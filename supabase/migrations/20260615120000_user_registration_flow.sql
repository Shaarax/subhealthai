-- ============================================================================
-- 20260615120000_user_registration_flow.sql
-- Auto-provision app rows when a new Supabase Auth user is created.
-- ============================================================================
-- Root cause this fixes:
--   Supabase Auth writes new sign-ups to auth.users, but the app resolves
--   identity from public.users (by email, see lib/getCurrentAppUser.ts) and
--   stores every per-user row keyed on public.users(id) under RLS policies of
--   the form (auth.uid() = user_id). New auth users had NO public.users row,
--   so getCurrentAppUser() threw "No app user row found" and the dashboard
--   rendered "No data profile found for this account."
--
-- Fix: add the standard auth.users -> public.users provisioning trigger.
-- Critically, public.users.id is set EQUAL to auth.users.id so that the
-- existing RLS policies (auth.uid() = user_id) match this user's data without
-- any further changes. This migration is additive and non-destructive; it does
-- not touch the existing manually-created user's row.

-- 1) Provisioning function.
--    SECURITY DEFINER so the initial bootstrap inserts run as the function
--    owner and are not blocked by RLS on the target tables -- the same
--    privilege model already used by public.set_updated_at().
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- App account row. id is intentionally the auth user id so all RLS policies
  -- shaped like (auth.uid() = user_id) resolve to this user's own rows.
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    lower(NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  -- Demographic profile stub; populated later during onboarding/intake.
  INSERT INTO public.user_profile (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Audit trail, matching the app convention: { user_id, action, details }.
  INSERT INTO public.audit_log (user_id, action, details)
  VALUES (
    NEW.id,
    'user_registered',
    jsonb_build_object('email', lower(NEW.email), 'source', 'auth_signup_trigger')
  );

  RETURN NEW;
END;
$$;

-- 2) Fire once per newly created auth user.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3) Make the new user's own-row access explicit and least-privilege.
--    public.user_profile already has an RLS policy (user_profile_own, FOR ALL,
--    auth.uid() = user_id) that covers both SELECT and the INSERT WITH CHECK,
--    so a signed-in user can read and complete their own profile. We add
--    redundant, named SELECT/INSERT policies only if that policy is absent, to
--    keep this migration self-contained when applied to a fresh database.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_profile'
  ) THEN
    EXECUTE 'ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY user_profile_select_own ON public.user_profile
               FOR SELECT TO authenticated USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY user_profile_insert_own ON public.user_profile
               FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;
