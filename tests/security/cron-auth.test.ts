import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/cron/route";

/**
 * Finding C3 — /api/cron triggered flag computation and weekly-note (LLM)
 * generation with no authentication. It now requires a CRON_SECRET via
 * `Authorization: Bearer` or `?key=`. These requests present neither, so they
 * must be rejected with 401 before any work runs (true whether or not
 * CRON_SECRET is configured in the environment, since no matching credential is
 * supplied).
 */
describe("C3: /api/cron requires authorization", () => {
  it("rejects a POST with no credential (401)", async () => {
    const res = await POST(new Request("https://app.local/api/cron"));
    expect(res.status).toBe(401);
  });

  it("rejects a POST with a wrong ?key= (401)", async () => {
    const res = await POST(new Request("https://app.local/api/cron?key=definitely-wrong"));
    expect(res.status).toBe(401);
  });

  it("rejects a POST with a wrong Bearer token (401)", async () => {
    const res = await POST(
      new Request("https://app.local/api/cron", {
        method: "POST",
        headers: { authorization: "Bearer definitely-wrong" },
      }),
    );
    expect(res.status).toBe(401);
  });
});
