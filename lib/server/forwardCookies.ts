import { cookies } from "next/headers";

/**
 * Rebuild the current request's Cookie header for server-to-server fetches.
 *
 * The copilot routes retrieve data by fetching the app's own read routes. Those
 * routes are session-gated (findings C1/H3), so the outbound request must carry
 * the caller's auth cookies or it will be rejected. This runs inside a Route
 * Handler request scope, where `cookies()` is available.
 *
 * Supabase auth cookie values are base64url/JWT (no characters that require
 * percent-encoding), so the name=value pairs are rebuilt verbatim. Returns an
 * empty string when there is no request scope (e.g. unit tests) or no cookies,
 * in which case the downstream route simply behaves as unauthenticated.
 */
export function currentCookieHeader(): string {
  try {
    return cookies()
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
  } catch {
    return "";
  }
}
