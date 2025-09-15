/**
 * Placeholder job:
 * 1) Read recent events from events_raw
 * 2) Aggregate into metrics
 * 3) Evaluate simple rules → insert flags
 * 4) Write audit_log entry
 */
import dayjs from "dayjs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Replace with service role key in real cron
const supabase = createClient(url, key);

async function run() {
  const userId = process.env.DEMO_USER_ID;
  if (!userId) {
    console.log("Set DEMO_USER_ID to test.");
    return;
  }

  // Example: insert a simple flag for yesterday
  const day = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const { error } = await supabase.from("flags").insert({
    user_id: userId,
    day,
    flag_type: "sleep_debt",
    severity: 3,
    rationale: "Sleep < 6.5h avg over last 3 days."
  });

  if (error) {
    console.error(error);
  } else {
    console.log("Inserted demo flag.");
  }
}

run().catch(console.error);
