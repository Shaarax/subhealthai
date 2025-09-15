import { createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // For local testing only
const supabase = createClient(url, key);

async function seed() {
  // Create demo user
  const email = "demo@subhealth.ai";
  const { data: existing } = await supabase.from("users").select("*").eq("email", email).maybeSingle();

  let userId: string;
  if (existing) {
    userId = existing.id;
  } else {
    const { data, error } = await supabase.from("users").insert({ email, display_name: "Demo User" }).select().single();
    if (error) throw error;
    userId = data.id;
  }

  // Insert simple events for past 7 days
  for (let i = 1; i <= 7; i++) {
    const t = dayjs().subtract(i, "day");
    const day = t.toDate();
    await supabase.from("events_raw").insert([
      { user_id: userId, source: "manual", metric: "steps", value: 7500 + i * 100, event_time: day },
      { user_id: userId, source: "manual", metric: "sleep_minutes", value: 360 + i * 5, event_time: day },
      { user_id: userId, source: "manual", metric: "hrv", value: 38 + i, event_time: day },
      { user_id: userId, source: "manual", metric: "rhr", value: 62 - i * 0.3, event_time: day }
    ]);
  }

  console.log("Seed complete. DEMO_USER_ID=", userId);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
