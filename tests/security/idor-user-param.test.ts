import { describe, it, expect } from "vitest";
import { requireUser } from "@/lib/auth";

/**
 * Finding C1 (Critical) — IDOR via the `?user=` query parameter. FIXED.
 *
 * `requireUser` now derives identity from the Supabase session (auth cookie)
 * and never from the request. `?user=` can no longer *select* the acting user;
 * at most it must equal the caller's own id, otherwise the request is rejected.
 *
 * These tests run without a request scope, so no session exists — the secure
 * contract is therefore to REJECT. Before the fix, the first case returned the
 * attacker-supplied victim id; that regression is what these assertions lock
 * down. (Positive-path, real-session isolation is covered by
 * tests/security/rls-isolation.test.ts against a live Supabase.)
 */
const VICTIM_ID = "11111111-1111-4111-8111-111111111111";

describe("C1: requireUser is session-based (?user= cannot select the user)", () => {
  it("rejects a ?user= request with no authenticated session", async () => {
    const req = new Request(`https://app.local/api/explain?user=${VICTIM_ID}`);
    await expect(requireUser(req)).rejects.toThrow();
  });

  it("rejects a request with no session and no params", async () => {
    const req = new Request("https://app.local/api/explain");
    await expect(requireUser(req)).rejects.toThrow();
  });

  it("never resolves to the attacker-supplied id", async () => {
    const req = new Request(`https://app.local/api/explain?user=${VICTIM_ID}`);
    await expect(requireUser(req)).rejects.toThrow();
    // Belt and suspenders: prove it does not silently return the victim id.
    const result = await requireUser(req).catch(() => null);
    expect(result).toBeNull();
  });
});
