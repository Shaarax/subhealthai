import { config } from "dotenv";

// Load real credentials when available (never committed). .env.test can hold
// dedicated TEST_* Supabase credentials for the RLS integration suite.
config({ path: ".env.local" });
config({ path: ".env.test", override: false });

// Fallbacks so that importing app modules whose top-level guards require these
// vars (e.g. lib/supabaseAdmin.ts, lib/supabase.ts) does not throw during unit
// tests. These are dummy values; they never connect anywhere. Real values, if
// present in the env files above, always win because of ||=.
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-service-role-key";
