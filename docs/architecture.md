# SubHealthAI – Architecture (MVP)

## Data Flow
1. **Ingest → `events_raw`** (wearables, lifestyle logs, CSV)
2. **Daily Rollup → `metrics`** (HRV, RHR, sleep minutes, steps)
3. **Flagging Engine → `flags`** (rules now; ML next)
4. **Weekly Notes (LLM) → `weekly_notes`** (explainable summaries with guardrails)
5. **Audit Trail → `audit_log`** (transparency for every automated action)

## Jobs / Scripts
- `scripts/load_mock_metrics.py` – seed/demo data
- `scripts/flagging_engine.py` – Python rule-based flags
- `scripts/compute_flag.ts` – TypeScript parity of rule-based flags
- (Planned) Supabase Edge Function (cron) – nightly rollup `events_raw → metrics`

## Core Tables
`users`, `events_raw`, `metrics`, `flags`, `weekly_notes`, `audit_log`