// scripts/compute_flag.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-side only
const sb = createClient(url, key);

type Metric = {
  id: string; user_id: string; day: string;
  steps: number | null; sleep_minutes: number | null;
  hr_avg: number | null; hrv_avg: number | null; rhr: number | null;
};

function rules(m: Metric) {
  const out: {user_id:string; day:string; flag_type:string; severity:number; rationale:string}[] = [];
  if (m.sleep_minutes != null && m.sleep_minutes < 300)
    out.push({ user_id: m.user_id, day: m.day, flag_type: 'sleep_debt', severity: 2, rationale: 'Sleep under 5 hours' });
  if (m.hrv_avg != null && m.hrv_avg < 40)
    out.push({ user_id: m.user_id, day: m.day, flag_type: 'low_hrv', severity: 3, rationale: 'HRV below baseline proxy' });
  if (m.rhr != null && m.rhr > 80)
    out.push({ user_id: m.user_id, day: m.day, flag_type: 'elevated_rhr', severity: 2, rationale: 'Resting HR > 80 bpm' });
  return out;
}

async function run(dayISO?: string) {
  const day = dayISO ?? new Date().toISOString().slice(0, 10);
  const { data: metrics, error } = await sb
    .from('metrics')
    .select('id,user_id,day,steps,sleep_minutes,hr_avg,hrv_avg,rhr')
    .eq('day', day);

  if (error) throw error;
  const inserts = (metrics as Metric[]).flatMap(rules);
  if (inserts.length) {
    const { error: insErr } = await sb.from('flags').insert(inserts);
    if (insErr) throw insErr;
    console.log(`[flags] inserted ${inserts.length} flags for ${day}`);
  } else {
    console.log(`[flags] none for ${day}`);
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
