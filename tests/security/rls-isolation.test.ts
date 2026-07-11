import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Finding H1 (High) — RLS cross-user isolation is unverified.
 *
 * This is the Phase-1 acceptance test from the Platform 2026 spec: prove that
 * User A cannot read User B's rows through the ANON client (i.e. under RLS).
 * "Do not assume RLS is correct merely because policies exist. Test it."
 *
 * It exercises a REAL Supabase instance (local `supabase start`, or a staging
 * project) using two seeded test users. It is skipped unless the required
 * TEST_* env vars are present, so it never fails in an environment without a
 * database. To run it:
 *
 *   .env.test:
 *     TEST_SUPABASE_URL=...
 *     TEST_SUPABASE_ANON_KEY=...
 *     TEST_USER_A_EMAIL=...     TEST_USER_A_PASSWORD=...
 *     TEST_USER_B_EMAIL=...     TEST_USER_B_PASSWORD=...
 *     TEST_USER_B_ID=<public.users.id of user B>
 *
 *   npm test
 */
const url = process.env.TEST_SUPABASE_URL;
const anon = process.env.TEST_SUPABASE_ANON_KEY;
const aEmail = process.env.TEST_USER_A_EMAIL;
const aPassword = process.env.TEST_USER_A_PASSWORD;
const bEmail = process.env.TEST_USER_B_EMAIL;
const bPassword = process.env.TEST_USER_B_PASSWORD;
const bId = process.env.TEST_USER_B_ID;

const hasCreds = Boolean(
  url && anon && aEmail && aPassword && bEmail && bPassword && bId,
);

// Per-user tables whose RLS policy is `auth.uid() = user_id`. Reading any of
// these filtered by another user's id must return zero rows for a signed-in
// non-owner.
const OWNED_TABLES = [
  "metrics",
  "user_profile",
  "labs_core",
  "vitals",
  "device_accounts",
] as const;

describe.skipIf(!hasCreds)("H1: RLS cross-user isolation (anon client)", () => {
  let clientA: SupabaseClient;

  beforeAll(async () => {
    clientA = createClient(url!, anon!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await clientA.auth.signInWithPassword({
      email: aEmail!,
      password: aPassword!,
    });
    if (error) throw new Error(`Test user A sign-in failed: ${error.message}`);
  });

  for (const table of OWNED_TABLES) {
    it(`User A cannot read User B's rows in ${table}`, async () => {
      const { data, error } = await clientA
        .from(table)
        .select("user_id")
        .eq("user_id", bId!);

      // RLS should silently filter B's rows to an empty set (not error).
      expect(error).toBeNull();
      expect(data ?? []).toHaveLength(0);
    });
  }

  it("sign-in produced a session scoped to User A only", async () => {
    const { data } = await clientA.auth.getUser();
    expect(data.user?.email?.toLowerCase()).toBe(aEmail!.toLowerCase());
    expect(data.user?.email?.toLowerCase()).not.toBe(bEmail!.toLowerCase());
  });
});

// Visibility guard: if the suite is skipped, make it obvious why, so a green
// run is never mistaken for "isolation proven".
describe("H1: RLS isolation preconditions", () => {
  it(hasCreds ? "TEST_* Supabase credentials present" : "TEST_* Supabase credentials NOT set — RLS suite skipped", () => {
    expect(true).toBe(true);
  });
});
