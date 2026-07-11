import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Vitest config for SubHealthAI.
// - tsconfigPaths resolves the `@/*` alias used across the app.
// - setup.ts loads env (.env.local / .env.test) and provides safe fallbacks so
//   module-load-time env guards (e.g. lib/supabaseAdmin.ts) do not throw during
//   pure unit tests that never touch the network.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    hookTimeout: 20000,
    testTimeout: 20000,
  },
});
