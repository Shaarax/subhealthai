import { describe, it, expect } from "vitest";
import { resolveActingUser, isDemoUser } from "@/lib/authUser";

/**
 * Finding H3 — the copilot routes authorized off a request-body `user`, letting
 * any caller read another user's data through the AI surface. They now resolve
 * the acting user via `resolveActingUser`: demo ids pass through (public demo),
 * anything else requires the caller's own session.
 *
 * No request scope here ⇒ no session ⇒ real ids must be rejected; demo ids must
 * still resolve without a session.
 */
const VICTIM_ID = "33333333-3333-4333-8333-333333333333";

describe("H3: copilot resolveActingUser", () => {
  it("rejects a real ?user= id with no session", async () => {
    await expect(resolveActingUser(VICTIM_ID)).rejects.toThrow();
  });

  it("rejects a real email with no session", async () => {
    await expect(resolveActingUser("victim@example.com")).rejects.toThrow();
  });

  for (const demo of ["demo", "demo-healthy", "demo-risk"]) {
    it(`passes through demo id "${demo}" without a session`, async () => {
      const { id, isDemo } = await resolveActingUser(demo);
      expect(isDemo).toBe(true);
      expect(id).toBe(demo);
    });
  }

  it("isDemoUser only matches the known demo ids", () => {
    expect(isDemoUser("demo-healthy")).toBe(true);
    expect(isDemoUser(VICTIM_ID)).toBe(false);
    expect(isDemoUser(null)).toBe(false);
  });
});
