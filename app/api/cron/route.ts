// app/api/cron/route.ts
import { NextResponse } from 'next/server'
import { applyFlagsForDay, applyFlagsForDayWithBaseline } from '../../../lib/flagRules'

function ymd(d: Date) { return d.toISOString().slice(0,10) }

/**
 * C3: this endpoint triggers flag computation and weekly-note (LLM) generation,
 * so it must not be publicly callable. Authorize via a shared CRON_SECRET,
 * supplied either as `Authorization: Bearer <secret>` (Vercel Cron style) or a
 * `?key=<secret>` query param for manual runs. Fails closed when CRON_SECRET is
 * not configured.
 */
function cronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${secret}`) return true
  try {
    return new URL(req.url).searchParams.get('key') === secret
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  // Accept day from querystring OR form POST (demo button posts a form)
  const url = new URL(req.url)
  let day = url.searchParams.get('day') || ymd(new Date())

  try {
    // 1) compute flags for the given day (idempotent)
    const simple = await applyFlagsForDay(day)
    const baseline = await applyFlagsForDayWithBaseline(day)

    // 2) trigger weekly note generation (synchronous call)
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const genResp = await fetch(`${base}/api/weekly-note`, { method: 'POST' })
    const gen = await genResp.json().catch(() => ({ ok: false }))

    // ❗ Return BOTH simple and baseline results
    return NextResponse.json({
      ok: true,
      day,
      flags: { simple, baseline },
      weekly_note: gen
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'cron failed', day }, { status: 500 })
  }
}

export async function GET(req: Request) { return POST(req) } // allow GET for demo clicks
