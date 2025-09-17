# SubHealthAI Whitepaper (Outline)

## 1. Abstract
SubHealthAI is an AI-powered preventive health platform designed to surface **early warning signals of chronic dysfunction** before conditions progress into diagnosable disease. By integrating wearable, lifestyle, and behavioral data, the system aims to **support physicians in preventive care** while reducing the growing burden of chronic illness in the United States, which accounts for over **$4 trillion annually** in healthcare spending. This whitepaper outlines the motivation, system design, methods, safeguards, and roadmap for evaluation and future deployment.

---

## 2. Motivation & U.S. Burden
- Chronic diseases represent **~90% of U.S. healthcare spending** (CDC, 2023).  
- Six in ten U.S. adults live with at least one chronic disease; four in ten live with two or more.  
- Subclinical dysfunctions (silent inflammation, metabolic imbalance, fatigue patterns) often remain undetected until advanced stages.  
- **Workforce productivity, healthy lifespans, and national healthcare costs** are all negatively impacted by reactive care.  
- Federal agencies (HHS, NIH, FDA) emphasize preventive health and digital innovation as strategic priorities.  

---

## 3. System Overview
- **Inputs**: wearable data (HR, HRV, sleep, steps), lifestyle tracking, symptom inputs.  
- **Processing**: metrics → rule-based health flags → weekly summaries.  
- **Outputs**: clinician-ready PDF reports, historical trend charts, and audit logs for transparency.  
- **Scope**: SubHealthAI is not a diagnostic tool. It provides structured early signals to **assist physicians today** and has a long-term vision to **empower individuals under physician oversight**.  
- **Compliance-first**: HIPAA, FDA digital health guidelines, and privacy-by-design principles are integral to system design.  

---

## 4. Architecture & Data Flow
- **Database**: Supabase (Postgres) schema with `users`, `events_raw`, `metrics`, `flags`, `weekly_notes`, `audit_log`.  
- **Data Ingestion**: ETL/CRON jobs ingest deltas from wearable APIs and lifestyle trackers.  
- **Analysis Engine**: computes metrics and rule-based health flags.  
- **AI Layer**: LLM wrapper with strict guardrails generates weekly notes in plain language.  
- **Reports**: outputs available via user dashboard, PDF export, and clinician-sharing pathway.  
- **Audit Log**: ensures transparency, reproducibility, and trust.  

---

## 5. Methods & Safeguards
- **Flag Rules**:  
  - Sleep debt  
  - Low HRV  
  - Elevated resting HR  
  - Sedentary lifestyle  
  - Irregular schedules  
- **Confidence Scoring**: each flag paired with rationale and threshold logic.  
- **AI Usage**:  
  - Restricted to natural language generation for summaries.  
  - Does **not** diagnose or classify disease.  
  - Guardrails prevent unsupported medical claims.  
- **Security & Privacy**: encryption, row-level security (RLS), and compliance-first design.  

---

## 6. Pilot & Evaluation Plan
- **Exploratory pilot with clinical advisors** to test feasibility.  
- Metrics: data ingestion accuracy, flag precision, system uptime, clinician usability feedback.  
- Evaluation will emphasize **alignment with clinical workflow** and compliance standards.  

---

## 7. Roadmap & Future Vision
- **Year 1–2**: Complete MVP, publish technical whitepaper, open-source flagging modules.  
- **Year 2–3**: Expand into time-series ML models and multimodal health data (labs + lifestyle).  
- **Year 3–4**: Integrate with **FHIR/EHR systems** for clinical testing.  
- **Year 4–5**: Scale adoption through partnerships; expand predictive models (autoimmune, metabolic dysfunction).  
- **Long-term vision**: expand to a **public-facing platform** under physician oversight, bridging consumer health monitoring with formal healthcare systems.  

---

## 8. References (placeholders)
- CDC. “Chronic Disease Burden in the United States.” (2023).  
- HHS. “Digital Health Strategy.” (2022).  
- NIH. “AI for Biomedical and Behavioral Research.” (2023).  
- FDA. “Digital Health Innovation Action Plan.” (2021).  
- Peer-reviewed validation studies of wearable devices (Fitbit HRV, Oura sleep accuracy, Garmin step tracking).  
