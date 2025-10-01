import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { to, subject, message } = body || {}
  // For demo: just echo. (Wire Postmark/SendGrid later.)
  return NextResponse.json({
    ok: true,
    to: to || 'demo@clinic.example',
    subject: subject || 'SubHealthAI Report',
    message: message || 'Demo email stub accepted.'
  })
}
