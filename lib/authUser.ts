import { getCurrentAppUserId } from "./getCurrentAppUserId";

/**
 * Session-based user resolver for READ route handlers.
 *
 * Replaces the insecure `resolveUserId(?user=)` primitive: identity comes from
 * the authenticated Supabase session, never from the request. A `?user=` value
 * is accepted only when it refers to the caller's own app user id; anything
 * else is rejected. This closes the read side of finding C1 (cross-user IDOR).
 *
 * Demo profiles (`demo-healthy` / `demo-risk`) are intentionally NOT handled
 * here — every demo-capable route already short-circuits and returns synthetic
 * data before user resolution, so the public research demonstration keeps
 * working without a session. If a demo id ever reaches this function it is
 * treated like any other non-matching id: no session ⇒ Unauthorized.
 *
 * @throws if there is no valid session, or if `userParam` names another user.
 */
export async function resolveOwnUserId(userParam?: string | null): Promise<string> {
  const sessionId = await getCurrentAppUserId(); // throws when unauthenticated

  const requested = userParam?.trim();
  if (requested && requested !== sessionId) {
    throw new Error("Forbidden: cannot access another user's data.");
  }

  return sessionId;
}
