// lib/flagRules.ts
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const sb = createClient(url, serviceKey)

type Metric = {
  id: string; user_id: string; day: string;
  steps: number | null; sleep_minutes: number | null;
  hr_avg: number | null; hrv_avg: number | null; rhr: number | null;
}
type FlagInsert = {
  user_id: string; day: string; flag_type: string; severity: number; rationale: string;
}

export function rules(m: Metric): FlagInsert[] {
  const out: FlagInsert[] = []
  if (m.sleep_minutes != null && m.sleep_minutes < 300)
    out.push({ user_id: m.user_id, day: m.day, flag_type: 'sleep_debt', severity: 2, rationale: 'Sleep under 5 hours' })
  if (m.hrv_avg != null && m.hrv_avg < 40)
    out.push({ user_id: m.user_id, day: m.day, flag_type: 'low_hrv', severity: 3, rationale: 'HRV below baseline proxy' })
  if (m.rhr != null && m.rhr > 80)
    out.push({ user_id: m.user_id, day: m.day, flag_type: 'elevated_rhr', severity: 2, rationale: 'Resting HR > 80 bpm' })
  return out
}

/** Idempotent: inserts flags for a given ISO day; skips duplicates; writes audit_log */
export async function applyFlagsForDay(dayISO: string) {
  const { data: metrics, error: mErr } = await sb
    .from('metrics')
    .select('id,user_id,day,steps,sleep_minutes,hr_avg,hrv_avg,rhr')
    .eq('day', dayISO)
  if (mErr) throw mErr

  const planned = (metrics as Metric[] | null)?.flatMap(rules) ?? []

  const { data: existing, error: eErr } = await sb
    .from('flags')
    .select('user_id,day,flag_type')
    .eq('day', dayISO)
  if (eErr) throw eErr

  const existingKeys = new Set((existing ?? []).map(f => `${f.user_id}|${f.day}|${f.flag_type}`))
  const toInsert = planned.filter(f => !existingKeys.has(`${f.user_id}|${f.day}|${f.flag_type}`))

  if (toInsert.length) {
    const { error: insErr } = await sb.from('flags').insert(toInsert)
    if (insErr) throw insErr
  }

  await sb.from('audit_log').insert({
    user_id: null,
    action: 'apply_flags_for_day',
    details: {
      day: dayISO,
      planned: planned.length,
      inserted: toInsert.length,
      skipped_as_duplicates: planned.length - toInsert.length,
      rule_thresholds: { sleep_minutes_lt: 300, hrv_avg_lt: 40, rhr_gt: 80 }
    }
  })

  return { planned: planned.length, inserted: toInsert.length }
}
