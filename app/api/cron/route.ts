// app/api/cron/route.ts
import { NextResponse } from 'next/server'
import { applyFlagsForDay } from '../../../lib/flagRules'

function ymd(d: Date) { return d.toISOString().slice(0,10) }

export async function POST(req: Request) {
  const url = new URL(req.url)
  const day = url.searchParams.get('day') || ymd(new Date())

  try {
    // 1) compute flags for the given day (idempotent)
    const res = await applyFlagsForDay(day)

    // 2) trigger weekly note generation (synchronous call)
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const genResp = await fetch(`${base}/api/weekly_note`, { method: 'POST' })
    const gen = await genResp.json().catch(() => ({ ok:false }))

    return NextResponse.json({ ok: true, day, flags: res, weekly_note: gen })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'cron failed', day }, { status: 500 })
  }
}
