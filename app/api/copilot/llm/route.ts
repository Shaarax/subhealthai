import { NextResponse } from "next/server";

import { SYSTEM_PROMPT } from "@/lib/copilot/systemPrompt";
import { toolSpecs } from "@/lib/copilot/tools";
import { resolveActingUser } from "@/lib/authUser";
import { currentCookieHeader } from "@/lib/server/forwardCookies";

const BASE = process.env.LLM_BASE_URL!;
const KEY = process.env.LLM_API_KEY!;
const MODEL = process.env.LLM_MODEL!;
const ORIGIN = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

async function callTool(name: string, args: Record<string, any>) {
  try {
    // Forward the caller's session cookies so the session-gated read routes
    // authorize these server-to-server calls as the real user.
    const cookie = currentCookieHeader();
    const init: RequestInit | undefined = cookie ? { headers: { cookie } } : undefined;

    if (name === "get_risk") {
      const res = await fetch(
        `${ORIGIN}/api/risk?user=${encodeURIComponent(args.user)}&version=${encodeURIComponent(
          args.version ?? "phase3-v1-wes"
        )}`,
        init
      );
      return res.json();
    }
    if (name === "get_explain_summary") {
      const res = await fetch(
        `${ORIGIN}/api/explain/summary?user=${encodeURIComponent(args.user)}&version=${encodeURIComponent(
          args.version ?? "phase3-v1-wes"
        )}`,
        init
      );
      return res.json();
    }
    if (name === "get_anomaly") {
      const res = await fetch(`${ORIGIN}/api/anomaly?user=${encodeURIComponent(args.user)}`, init);
      return res.json();
    }
    if (name === "get_reliability") {
      const res = await fetch(
        `${ORIGIN}/api/reliability?version=${encodeURIComponent(args.version ?? "phase3-v1-wes")}`,
        init
      );
      return res.json();
    }
    if (name === "get_volatility") {
      const res = await fetch(
        `${ORIGIN}/api/volatility?version=${encodeURIComponent(args.version ?? "phase3-v1-wes")}`,
        init
      );
      return res.json();
    }
    if (name === "make_pdf") {
      const url = `${ORIGIN}/api/report?user=${encodeURIComponent(args.user)}&version=${encodeURIComponent(
        args.version ?? "phase3-v1-wes"
      )}&range=${encodeURIComponent(args.range ?? "7d")}`;
      return { url };
    }
  } catch (error: any) {
    return { error: error?.message || "tool failed" };
  }
  return { error: "unknown tool" };
}

export async function POST(req: Request) {
  try {
    const { user, version = "phase3-v1-wes", query } = await req.json();

    if (!user) {
      return NextResponse.json({ error: "missing user" }, { status: 400 });
    }

    // H3: derive the acting user from the session (demo ids pass through). The
    // tool executor (callTool) forwards the caller's cookies on its
    // server-to-server fetches, so the session-gated read routes authorize it
    // as the real user. This route is not currently wired to the client.
    let actingUser: string;
    try {
      ({ id: actingUser } = await resolveActingUser(user));
    } catch {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const initial = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        tools: toolSpecs,
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `User: ${actingUser}\nVersion: ${version}\nQuestion: ${query}`,
          },
        ],
      }),
    }).then((res) => res.json());

    const toolCall = initial?.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall) {
      const name = toolCall.function?.name;
      const args = JSON.parse(toolCall.function?.arguments || "{}");
      if (!args.user) args.user = actingUser;
      if (!args.version) args.version = version;

      const result = await callTool(name, args);

      const final = await fetch(`${BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.2,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `User: ${actingUser}\nVersion: ${version}\nQuestion: ${query}`,
            },
            {
              role: "tool",
              tool_call_id: toolCall.id,
              name,
              content: JSON.stringify(result),
            },
          ],
        }),
      }).then((res) => res.json());

      const text = final?.choices?.[0]?.message?.content ?? "No response.";
      return NextResponse.json({
        answer: `${text}\n\n— Non-diagnostic, for preventive context.`,
        refs: result,
      });
    }

    const text = initial?.choices?.[0]?.message?.content ?? "I couldn't derive an answer.";
    return NextResponse.json({
      answer: `${text}\n\n— Non-diagnostic, for preventive context.`,
      refs: null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "copilot error" }, { status: 500 });
  }
}
