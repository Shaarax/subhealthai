# SubHealthAI Whitepaper (Outline)

## 1. Abstract
One-paragraph summary of early detection platform and U.S. impact.

## 2. Motivation & U.S. Burden
- Chronic disease = ~90% of U.S. healthcare spend
- Preventive gap: subclinical dysfunction rarely captured

## 3. System Overview
- Data: wearables, lifestyle, symptom input
- Processing: metrics → rule-based flags → weekly notes
- Outputs: clinician-ready PDF, citations, history

## 4. Architecture
- Postgres schema (users, events_raw, metrics, flags, weekly_notes, audit_log)
- ETL/CRON for deltas
- LLM wrapper with guardrails

## 5. Methods
- Flag rules (sleep debt, low HRV, elevated RHR, sedentary, unstable schedule)
- Confidence scoring + rationale
- Security & privacy

## 6. Pilot & Evaluation
- Feasibility metrics
- User/clinician feedback

## 7. Roadmap
- Time-series ML, multimodal models
- FHIR/EHR integration, clinical validation
- Risk scoring & calibration

## 8. References
Place CDC/HHS/FDA sources, wearable validation studies, etc.
