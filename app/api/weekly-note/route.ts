// app/api/weekly_note/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'  // relative path from this file
import OpenAI from 'openai'

function ymd(d: Date) { return d.toISOString().slice(0, 10) }

export async function POST() {
  const today = new Date()
  const start = new Date(today); start.setDate(start.getDate() - 6)
  const week_start = ymd(start), week_end = ymd(today)

  // pick a demo user with data this week
  // try week window first
  let user_id: string | undefined
  const { data: m } = await supabaseAdmin
    .from('metrics').select('user_id').gte('day', week_start).lte('day', week_end).limit(1)
  user_id = m?.[0]?.user_id

  // fallback: most recent metrics across all time
  if (!user_id) {
    const { data: mr } = await supabaseAdmin
      .from('metrics')
      .select('user_id,day')
      .order('day', { ascending: false })
      .limit(1)
    user_id = mr?.[0]?.user_id
  }
  // last-resort: most recent flags across all time
  if (!user_id) {
    const { data: fr } = await supabaseAdmin
      .from('flags')
      .select('user_id,day')
      .order('day', { ascending: false })
      .limit(1)
    user_id = fr?.[0]?.user_id
  }

  if (!user_id) {
    // still nothing: persist an empty note so demos don’t block
    const summary = 'No data available this week. This placeholder summary shows structure only.'
    const note_json = {
      week: { start: week_start, end: week_end },
      signals: { counts: { total: 0, low_hrv: 0, sleep_debt: 0, elevated_rhr: 0 } },
      flags: [],
      interpretation: { text: summary, confidence: 'low' },
      disclaimer: 'This is not a medical diagnosis. Insights are preventive and educational only.'
    }
    await supabaseAdmin.from('weekly_notes').upsert({
      user_id: null, week_start, week_end, summary, recommendations: null, sources: [], note_json
    }, { onConflict: 'user_id,week_start,week_end' })
    await supabaseAdmin.from('audit_log').insert({
      user_id: null,
      action: 'generate_weekly_note',
      details: { week_start, week_end, counts: note_json.signals.counts, used_llm: false, placeholder: true }
    })
    return NextResponse.json({ ok: true, user_id: null, week_start, week_end, placeholder: true })
  }


  // fetch flags for the user in the window
  const { data: flags, error: flagsErr } = await supabaseAdmin
    .from('flags')
    .select('day, flag_type, severity, rationale')
    .eq('user_id', user_id).gte('day', week_start).lte('day', week_end)
    .order('day', { ascending: true })
  if (flagsErr) return NextResponse.json({ error: flagsErr.message }, { status: 500 })

  const counts = {
    total: flags?.length ?? 0,
    low_hrv: flags?.filter(f => f.flag_type === 'low_hrv').length ?? 0,
    sleep_debt: flags?.filter(f => f.flag_type === 'sleep_debt').length ?? 0,
    elevated_rhr: flags?.filter(f => f.flag_type === 'elevated_rhr').length ?? 0,
  }

  // guardrailed structure
  const note_json: any = {
    week: { start: week_start, end: week_end },
    signals: { counts },
    flags: flags ?? [],
    interpretation: { text: '', confidence: 'medium' },
    disclaimer: 'This is not a medical diagnosis. Insights are preventive and educational only.'
  }

  // optional LLM if OPENAI_API_KEY set; otherwise deterministic fallback
  const apiKey = process.env.OPENAI_API_KEY
  if (apiKey) {
    try {
      const client = new (await import('openai')).default({ apiKey })
      const flagsBullets = (flags ?? [])
        .map(f => `• ${f.day}: ${f.flag_type} (sev ${f.severity}) — ${f.rationale}`)
        .join('\n') || '• No flags recorded.'

      const sys = `You are generating a brief weekly preventive health note.
- Audience: general users and clinicians.
- NEVER diagnose or name diseases.
- Keep it under 120 words.
- Output 3 short sections: Signals, Interpretation, Suggestions.
- Include a final disclaimer sentence: "This is not a medical diagnosis."`

      const user = `Counts this week: ${JSON.stringify(counts, null, 0)}
Flags:
${flagsBullets}`

      const resp = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user }
        ]
      })

      const text = resp.choices?.[0]?.message?.content?.trim() || ''
      note_json.interpretation.text = text
    } catch (e) {
      note_json.interpretation.text = `This week shows ${counts.total} signal(s). Focus on sleep regularity, recovery, and stress balance.`
    }
  } else {
    note_json.interpretation.text = `This week shows ${counts.total} signal(s). Focus on sleep regularity, recovery, and stress balance.`
  }

  const summary = note_json.interpretation.text
  const sources = ['metrics', 'flags']

  // upsert into weekly_notes (schema already exists)
  const { error: upErr } = await supabaseAdmin
    .from('weekly_notes')
    .upsert({
      user_id, week_start, week_end,
      summary,
      recommendations: null,
      sources,
      note_json
    }, { onConflict: 'user_id,week_start,week_end' })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  // audit
  await supabaseAdmin.from('audit_log').insert({
    user_id,
    action: 'generate_weekly_note',
    details: { week_start, week_end, counts, used_llm: !!apiKey }
  })

  return NextResponse.json({ ok: true, user_id, week_start, week_end })
}
