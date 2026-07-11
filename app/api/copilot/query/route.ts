import { NextResponse } from "next/server";

import { getAnomaly } from "@/lib/copilot/toolsRunner";
import { resolveActingUser } from "@/lib/authUser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { user, version = "phase3-v1-wes" } = await req.json();

    if (!user) {
      return NextResponse.json({ error: "missing user" }, { status: 400 });
    }

    // H3: resolve the acting user from the session; demo ids pass through.
    let acting;
    try {
      acting = await resolveActingUser(user);
    } catch {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const anomaly = await getAnomaly({ user: acting.id });

    const summary = anomaly?.summary ?? "No anomaly summary available.";
    const entries = anomaly?.entries ?? [];

    const text = [
      `User: ${user}`,
      `Version: ${version}`,
      "",
      summary,
      "",
      ...entries.map(
        (entry: any) =>
          `${entry.signal ?? entry.feature ?? "metric"} — z=${entry.z_score?.toFixed?.(2) ?? "n/a"}`
      ),
      "",
      "— Non-diagnostic, for preventive context.",
    ].join("\n");

    return NextResponse.json({ answer: text, refs: anomaly });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "copilot error" }, { status: 500 });
  }
}



export const dynamic = "force-dynamic";
