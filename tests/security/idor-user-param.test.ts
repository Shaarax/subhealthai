import { describe, it, expect } from "vitest";
import { requireUser } from "@/lib/auth";

/**
 * Finding C1 (Critical) — IDOR via the `?user=` query parameter.
 *
 * `lib/auth.ts#requireUser` derives the acting user purely from the `?user=`
 * query string and (for the email path) resolves it with the SERVICE-ROLE
 * client, which bypasses RLS. There is no verification that the caller's
 * session actually owns that user id. Any of the many routes that call
 * `requireUser` (/api/explain, /api/anomaly, /api/forecast, ...) can therefore
 * be driven against an arbitrary victim id.
 *
 * A well-formed UUID short-circuits `resolveUserId` before it touches the
 * database, so this test proves the authorization defect with zero network I/O.
 */
const VICTIM_ID = "11111111-1111-4111-8111-111111111111";

describe("C1: cross-user IDOR through requireUser(?user=)", () => {
  it("characterization — requireUser authorizes from ?user= alone (VULNERABLE)", async () => {
    const req = new Request(`https://app.local/api/explain?user=${VICTIM_ID}`);

    const user = await requireUser(req);

    // No session was presented, yet the victim's id is returned as the acting
    // user. This is the exploit primitive behind C1.
    expect(user.id).toBe(VICTIM_ID);
  });

  /**
   * Regression target for the Point-2 fix.
   *
   * Marked `it.fails` on purpose: it encodes the SECURE expectation (an
   * unauthenticated / mismatched caller must be rejected). Today `requireUser`
   * resolves instead of rejecting, so the assertion below fails and `it.fails`
   * reports GREEN. Once the session-based fix lands, `requireUser` will reject,
   * this assertion will pass, and `it.fails` will flip the suite RED — the
   * signal to delete the `.fails` marker and keep it as a permanent regression
   * test.
   */
  it.fails(
    "regression — requireUser must reject a ?user= with no matching session",
    async () => {
      const req = new Request(`https://app.local/api/explain?user=${VICTIM_ID}`);
      await expect(requireUser(req)).rejects.toThrow();
    },
  );
});
