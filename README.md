# SubHealthAI (Starter)

AI-powered preventive health platform to detect **subclinical dysfunctions** and early signs of chronic illness **before** diagnosis.  
This starter repo gives you a clean, minimal foundation to begin shipping an MVP and collecting evidence.

# SubHealthAI: Early Detection Before Diagnosis

SubHealthAI is an AI-powered health monitoring platform designed to detect
**subclinical dysfunctions and early signs of chronic illness before they
become diagnosable disease**.

### Why this matters
- **Chronic diseases drive ~90% of U.S. healthcare costs ($4.1 trillion annually).**
- Current medical systems miss **subclinical dysfunction** (silent inflammation,
early metabolic decline, autoimmune signals).
- By shifting care from **reactive to preventive**, SubHealthAI can help reduce
costs, improve quality of life, and save lives.

### What we are building (MVP)
- **Data ingestion** from wearables + lifestyle inputs  
- **Rule-based signals ("flags")** → sleep debt, low HRV, elevated resting HR  
- **AI-generated weekly note** → plain-language explanation of risk trends  
- **Clinician-ready export** → PDF/email with data table + citations  

This repo contains the **MVP skeleton**, database schema, and demo UI for
future iterations.


## What it does (MVP scope)
- Ingests **wearable & lifestyle** events into `events_raw`
- Computes derived **metrics** (sleep, HRV, steps, RHR)
- Raises **flags** (e.g., sleep debt, low HRV) with rationale
- Generates a **Weekly Note** (LLM wrapper) from structured flags
- Exports a **PDF** report (placeholder route) with sources & data table

## Stack
- **Next.js (App Router)** + TypeScript + TailwindCSS
- **Supabase (Postgres + Auth + Storage)** via `@supabase/supabase-js`
- Simple cron/script for **deltas → metrics → flags → audit_log**

## Architecture (MVP)
```mermaid
flowchart TD
  A[Wearables/Lifestyle Apps] -->|events| B[events_raw]
  B --> C[metrics (daily aggregates)]
  C --> D[flags (rule-based signals)]
  D --> E[LLM wrapper → weekly_notes]
  E --> F[PDF Export / Clinician Email]
  subgraph Supabase (Postgres)
    B
    C
    D
    E
    G[audit_log]
    H[users]
  end
  I[Admin Page] --> C
  I --> D
```

## Quick start
1. **Create Supabase project** → copy the SQL in `supabase/schema.sql` into the SQL editor.
2. Copy `.env.example` → `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (optional) `OPENAI_API_KEY` for weekly note generation
3. Install & run:
   ```bash
   npm install
   npm run dev
   ```
4. Seed demo data (optional):
   ```bash
   npm run seed
   ```

## Repo layout
```
/app                 # Next.js app router
  /api/weekly-note   # API route placeholder for LLM wrapper
  /components        # UI components
  /styles            # Tailwind styles
/docs                # Whitepaper outline & docs
/lib                 # Supabase client & helpers
/scripts             # cron-style scripts (compute flags, seed data)
/supabase            # SQL schema & RLS notes
```

## Roadmap
- Add OAuth login + per-user RLS
- Add wearable connectors (Apple/Google/Fitbit exports → ETL)
- Improve flags with time-series models
- PDF export via server route (Puppeteer/Playwright)
- Clinician view + CSV export

## Legal & Safety
This repository is a **technical demo**. It is **not medical advice**. Any health guidance must be validated by licensed professionals.
