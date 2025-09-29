// app/weekly/page.tsx
import { supabase } from '../../lib/supabase'

export default async function WeeklyNote() {
  const today = new Date()
  const dayISO = today.toISOString().slice(0,10)

  // Last 7 days metrics & flags
  const { data: metrics } = await supabase
    .from('metrics')
    .select('day, sleep_minutes, hrv_avg, rhr, steps')
    .gte('day', new Date(Date.now() - 6*24*3600*1000).toISOString().slice(0,10))
    .order('day', { ascending: true })

  const { data: flags } = await supabase
    .from('flags')
    .select('day, flag_type, severity, rationale')
    .gte('day', new Date(Date.now() - 6*24*3600*1000).toISOString().slice(0,10))
    .order('day', { ascending: true })

  // Simple human-readable summary (no LLM yet)
  const flagCount = (flags ?? []).length
  const lowHrv = (flags ?? []).filter(f => f.flag_type === 'low_hrv').length
  const sleepDebt = (flags ?? []).filter(f => f.flag_type === 'sleep_debt').length
  const elevatedRhr = (flags ?? []).filter(f => f.flag_type === 'elevated_rhr').length

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Weekly Note (demo)</h1>

      <section className="rounded-xl border p-4">
        <p className="text-sm leading-6">
          This is a placeholder weekly summary generated from the last 7 days of metrics & flags
          (no LLM yet). It illustrates the structure and guardrails we’ll use:
        </p>
        <div className="mt-3 text-sm">
          <p><span className="font-medium">Week ending:</span> {dayISO}</p>
          <p><span className="font-medium">Total flags:</span> {flagCount}</p>
          <ul className="list-disc ml-5">
            <li>Low HRV: {lowHrv}</li>
            <li>Sleep debt: {sleepDebt}</li>
            <li>Elevated RHR: {elevatedRhr}</li>
          </ul>
        </div>

        <div className="mt-4 text-sm">
          <h3 className="font-medium mb-1">Interpretation (demo):</h3>
          <p>
            Over the past week, SubHealthAI detected {flagCount} signal(s). We recommend prioritizing
            sleep regularity and recovery. If trends persist or worsen, consult a clinician.
          </p>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Disclaimer: This is not a medical diagnosis. It provides preventive, educational insights only.
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-medium mb-2">Flags (last 7 days)</h2>
        <div className="rounded-lg border divide-y">
          {(flags ?? []).length === 0 && <div className="p-3 text-gray-500">No flags this week.</div>}
          {flags?.map((f, i) => (
            <div key={i} className="p-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="font-medium">{f.flag_type}</div>
                <div className="text-gray-500">Severity {f.severity}</div>
              </div>
              <div className="text-gray-700">{f.rationale}</div>
              <div className="text-xs text-gray-400 mt-1">Day: {f.day}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
