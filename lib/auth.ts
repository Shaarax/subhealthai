import { getCurrentAppUserId } from "./getCurrentAppUserId";

export interface User {
  id: string;
}

/**
 * Resolve the authenticated app user for a Route Handler.
 *
 * Identity comes from the Supabase session (auth cookie), never from the
 * request. This closes finding C1: previously the acting user was taken from
 * the `?user=` query parameter and resolved with the service-role client,
 * which let any caller act on behalf of any user id (IDOR).
 *
 * If a `?user=` parameter is present it is treated as defense-in-depth only: it
 * may reference the caller's own id, otherwise the request is rejected. It is
 * never used to *select* the user.
 */
export async function requireUser(req?: Request): Promise<User> {
  let id: string;
  try {
    id = await getCurrentAppUserId();
  } catch {
    // Normalize any session/lookup failure to a single unauthorized signal so
    // callers (and tests) don't have to distinguish the cause.
    throw new Error("Unauthorized: a valid authenticated session is required.");
  }

  if (req) {
    let requested: string | null = null;
    try {
      requested = new URL(req.url).searchParams.get("user");
    } catch {
      requested = null;
    }
    if (requested && requested !== id) {
      throw new Error("Forbidden: cannot act on behalf of another user.");
    }
  }

  return { id };
}
