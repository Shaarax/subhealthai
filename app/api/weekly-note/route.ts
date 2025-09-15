import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Placeholder: In production, read structured flags from DB and call your LLM with guardrails.
  // Never send raw PHI; aggregate and anonymize where possible.
  const body = await req.json().catch(() => ({}));
  const userId = body?.user_id ?? "demo-user";
  const summary = `Weekly summary for ${userId}: Sleep debt flagged, HRV trending low, resting HR elevated. Prioritize recovery, light aerobic activity, and consistent sleep window.`;

  return NextResponse.json({
    user_id: userId,
    summary,
    recommendations: [
      "30–45 min Zone 2 cardio 3x this week",
      "Fixed sleep/wake window ±30 mins",
      "Hydration + magnesium (if appropriate)",
    ],
    sources: ["wearable_export.csv", "symptom_log.csv"]
  });
}
