# SubHealthAI — Session Log & Handoff

Purpose: resume work smoothly across sessions. **Read "Current status & next up"
first.** Each session appends a dated entry under "Session history" (newest
first) and updates the status section. Keep entries factual — commits, decisions,
and open items — not narrative.

---

## Current status & next up

- **Active branch:** `feature/productEnhancement` (pushed to `origin`, tracking).
  `main` is untouched. No PR opened yet.
- **Done so far:** end-to-end registration flow; Phase-0 audit + adversarial
  review; Vitest harness; authorization fixes **C1** (read + write routes) and
  **H3** (copilot) with tests; copilot data layer restored via cookie
  forwarding; **C3** cron gate; wearable-derived-metrics spec; ratified
  deterministic-analytics-first stance.
- **Tests:** `npm test` → 17 passed, 6 skipped (skipped = live-RLS suite needing
  `TEST_*` env). `tsc --noEmit` clean.

### Next up (pick one — both unblocked)
1. **Provider-agnostic ingestion foundation** — canonical ingest API (+ per-user
   auth) into `events_raw` (dedupe index already exists), AES-256-GCM token
   encryption (`TOKEN_ENC_KEY`), real `device_accounts` persistence, secure OAuth
   `state`+PKCE scaffold (fixes **C2**), connection status UI, tests.
2. **Phase-3 deterministic analytics core** — versioned personalized baselines,
   deviation (z/EWMA), change-point, volatility/persistence, additive
   attribution, data-sufficiency gating; the derived-indicator registry from
   `docs/wearable-derived-metrics.md`.

### Blocking decisions
- **Wearable device:** undecided. Samsung Health has **no server-side web API**
  (needs an Android Health Connect app or data export). Recommended purchase for
  a clean live web-OAuth path: **Oura Ring** (best data + API) or **Fitbit Charge
  6** (cheapest legitimate web OAuth). Foundation build is provider-agnostic and
  not blocked; only the concrete adapter needs this.
- **Open PR?** Not yet.

### Action items for the user (when relevant)
- Set **`CRON_SECRET`** in env/Vercel and have the cron job send
  `Authorization: Bearer <secret>` — `/api/cron` now fails closed (401) without it.
- Apply the registration migration
  `supabase/migrations/20260615120000_user_registration_flow.sql`
  (`supabase db push`) — not yet applied to the live DB.
- Confirm Supabase **dashboard auth settings** (email sign-ups enabled; email
  confirmation on/off — UI handles both).
- For wearables build: register a provider dev app (CLIENT_ID/SECRET/redirect)
  and generate `TOKEN_ENC_KEY` (`openssl rand -base64 32`).

### Known open findings (not yet addressed)
- **C2** — OAuth callback (`app/api/oauth/route.ts`) uses unsigned `state`; will
  be replaced by the secure scaffold in the foundation build.
- **H2** — real wearable OAuth/token exchange/encryption/backfill: entire
  `lib/oauth.ts` / `lib/deviceAccounts.ts` / `lib/queue.ts` layer is stubbed.
- **`/api/weekly-note`** — still unauthenticated + has a client button
  (`GenerateWeeklyButton`) with non-user-scoped generation; needs an auth-model
  decision (session vs. admin).
- Medium items from the audit: analytics reproducibility unverified, demo-mode
  leakage, audit_log raw-args/PII hygiene, file-upload validation (pre-Phase-4),
  `public.users` RLS disabled.

---

## Session history

### 2026-07-11 — Security remediation + wearable/analytics spec
Branch `feature/productEnhancement` (created off `main`). Nothing on `main`.

**Delivered (commits, oldest→newest):**
- `3560330` Registration flow fix + Phase-0 audit baseline. Root cause: no
  `auth.users → public.users` provisioning + signup was a disabled stub. Added
  trigger migration (`id = auth.uid()`, user_profile stub, audit row) + real
  signup form (email-confirmation-aware).
- `4d6b37b` Vitest harness + `tests/security/*` (proves C1 IDOR; skippable live
  RLS isolation suite).
- `748688e` **C1** — `requireUser` (13 write/ingest routes) now session-based.
- `d669ecc` **C1** — `resolveOwnUserId` for 19 read routes; report route switched
  from cookieless self-fetch to direct `buildRealUserDashboard`.
- `640bd34` **H3** — copilot routes resolve acting user from session
  (`resolveActingUser`, demo passthrough).
- `a414550` Copilot data layer restored — forward session cookies on
  server-to-server fetches (`lib/server/forwardCookies.ts`).
- `9f3cb5b` **C3** — `/api/cron` gated behind `CRON_SECRET` (fails closed).
- `6c905e6` `docs/wearable-derived-metrics.md` spec + README terminology/roadmap
  (provider-native attribution; candidate-digital-biomarker terminology).
- `edd7bb9` Ratified deterministic-analytics-first decision (README Phase 3).

**Key decisions:**
- Authorization fixed by session (never `?user=`); demo profiles pass through
  each route's pre-resolution branch to preserve the public NIW demo.
- Deterministic, versioned baseline/change-point/attribution core is
  authoritative; GRU + Isolation Forest stay complementary. (Memory:
  `analytics-deterministic-first`.)
- Samsung is native-only (no web API) — flagged; not built as a fake web OAuth.

**Left off:** awaiting device decision and choice of first build target
(foundation vs. analytics core). Branch pushed; no PR.
