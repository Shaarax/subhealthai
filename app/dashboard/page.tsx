// app/dashboard/page.tsx
import { supabase } from '../../lib/supabase'


function fmt(dt?: string | null) {
  return dt ? new Date(dt).toLocaleString() : ''
}

export default async function Dashboard() {
  const today = new Date().toISOString().slice(0, 10)

  const { data: metrics } = await supabase
    .from('metrics')
    .select('day,steps,sleep_minutes,hr_avg,hrv_avg,rhr')
    .order('day', { ascending: false })
    .limit(7)

  const { data: flags } = await supabase
    .from('flags')
    .select('day,flag_type,severity,rationale,created_at')
    .eq('day', today)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">SubHealthAI — Demo Dashboard</h1>
        <a href="/api/report" className="inline-block px-3 py-2 rounded-lg border hover:bg-gray-50">
          Download Demo PDF
        </a>
      </div>

      <section>
        <h2 className="text-xl font-medium mb-3">Last 7 Days (metrics)</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Day</th>
                <th className="p-2 text-left">Steps</th>
                <th className="p-2 text-left">Sleep (min)</th>
                <th className="p-2 text-left">HR avg</th>
                <th className="p-2 text-left">HRV avg</th>
                <th className="p-2 text-left">RHR</th>
              </tr>
            </thead>
            <tbody>
              {(metrics ?? []).map((m: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{m.day}</td>
                  <td className="p-2">{m.steps ?? '-'}</td>
                  <td className="p-2">{m.sleep_minutes ?? '-'}</td>
                  <td className="p-2">{m.hr_avg ?? '-'}</td>
                  <td className="p-2">{m.hrv_avg ?? '-'}</td>
                  <td className="p-2">{m.rhr ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-medium mb-3">Today’s Flags</h2>
        <div className="rounded-xl border divide-y">
          {(flags ?? []).length === 0 && <div className="p-3 text-gray-500">No flags today.</div>}
          {flags?.map((f: any, i: number) => (
            <div key={i} className="p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{f.flag_type}</div>
                <div className="text-sm text-gray-500">Severity {f.severity}</div>
              </div>
              <div className="text-sm text-gray-700">{f.rationale}</div>
              <div className="text-xs text-gray-400 mt-1">Created: {fmt(f.created_at)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
