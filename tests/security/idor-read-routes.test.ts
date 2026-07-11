import { describe, it, expect } from "vitest";
import { resolveOwnUserId } from "@/lib/authUser";

/**
 * Finding C1 (Critical), read side — the ~19 read routes (dashboard, insights/*,
 * explain, trends, risk, anomaly, forecast, metric_snapshot, summary, ...)
 * previously called `resolveUserId(?user=)` directly, letting any caller read
 * another user's data by supplying their id/email. They now call
 * `resolveOwnUserId`, which requires a session and rejects a ?user= that is not
 * the caller's own id.
 *
 * With no request scope there is no session, so the secure contract is to
 * REJECT. Positive-path isolation against a real session is covered by
 * tests/security/rls-isolation.test.ts.
 */
const VICTIM_ID = "22222222-2222-4222-8222-222222222222";

describe("C1 read side: resolveOwnUserId is session-based", () => {
  it("rejects a ?user= id with no authenticated session", async () => {
    await expect(resolveOwnUserId(VICTIM_ID)).rejects.toThrow();
  });

  it("rejects an email ?user= with no authenticated session", async () => {
    await expect(resolveOwnUserId("victim@example.com")).rejects.toThrow();
  });

  it("rejects when called with no argument and no session", async () => {
    await expect(resolveOwnUserId()).rejects.toThrow();
  });

  it("never resolves to the attacker-supplied id", async () => {
    const result = await resolveOwnUserId(VICTIM_ID).catch(() => null);
    expect(result).toBeNull();
  });
});
