# SubHealthAI Whitepaper  

## 1. Abstract  
SubHealthAI is an **AI-powered preventive health platform** designed to surface *early warning signals of subclinical dysfunction* before they progress into diagnosable disease. By integrating wearable, lifestyle, and (future) optional patient-provided lab data, the system generates structured, explainable **risk flags**. These are **not medical diagnoses**, but **supportive insights for clinicians** that highlight longitudinal health patterns. By shifting healthcare from reactive treatment to proactive prevention, SubHealthAI aims to reduce the chronic disease burden, which accounts for more than **$4 trillion annually** in U.S. healthcare spending.  

---

## 2. Motivation & U.S. Burden  
- Chronic diseases represent **~90% of U.S. healthcare spending** (CDC, 2023).  
- Six in ten U.S. adults live with at least one chronic disease; four in ten live with two or more.  
- **Subclinical dysfunctions** — silent inflammation, metabolic imbalance, fatigue patterns — often remain undetected until advanced stages.  
- The consequences: reduced workforce productivity, shortened healthy lifespan, rising national healthcare costs.  
- Federal agencies (HHS, NIH, FDA) emphasize **preventive care and digital health innovation** as national priorities.  

**Gap today:**  
- Wearables generate valuable signals (HRV, sleep, steps) but provide them in isolation.  
- No structured integration across multiple inputs.  
- No longitudinal tracking (7/30/90-day trends).  
- No clinician-ready outputs that can plug into preventive workflows.  

SubHealthAI addresses this gap by turning fragmented consumer health data into **structured, actionable, and compliance-aware insights**.  

---

## 3. System Overview  
- **Inputs**  
  - Wearables (MVP): HR, HRV, resting HR, sleep, steps, activity.  
  - Lifestyle: stress, fatigue, irregular schedules, self-reported behaviors.  
  - Future: optional patient-provided labs (e.g., CRP, HbA1c, vitamin D).  

- **Processing**  
  - Metrics → rule-based health flags → AI-generated weekly summaries.  

- **Outputs**  
  - Weekly plain-language note for users.  
  - Clinician-ready PDF reports with tables, trend charts, and citations.  
  - Full audit logs for transparency and reproducibility.  

- **Scope**  
  - SubHealthAI is **not a diagnostic tool**.  
  - It provides structured early signals to assist clinicians today, with a long-term vision of empowering individuals under physician oversight.  

- **Compliance-first**  
  - HIPAA alignment, FDA digital health guidelines, and privacy-by-design principles are core to the system’s roadmap.  

---

## 4. Architecture & Data Flow  
- **Database**: Supabase (Postgres) schema with `users`, `events_raw`, `metrics`, `flags`, `weekly_notes`, `audit_log`.  
- **Data ingestion**: ETL/CRON jobs pull deltas from wearable APIs and lifestyle trackers.  
- **Analysis engine**: computes metrics and applies flag rules.  
- **AI layer**: LLM wrapper with strict guardrails generates weekly notes and clinician-ready reports.  
- **Export**: dashboard, PDF, email.  
- **Audit log**: tracks all flags and outputs for transparency.  

---

## 5. Methods & Safeguards  

### 5.1 Flag Rules  
- Sleep debt accumulation  
- Low HRV relative to baseline  
- Elevated resting HR  
- Sedentary behavior  
- Irregular sleep/wake cycles  

### 5.2 Confidence Scoring  
- Each flag is paired with rationale and threshold logic.  
- Flags escalate only if consistent across 7/30/90-day windows → reduces false positives.  

### 5.3 Role of AI  
- **Current (MVP):**  
  - Restricted to **natural language generation**.  
  - Converts structured flags into plain-language weekly notes and clinician PDFs.  
  - Does **not** diagnose or classify disease.  
- **Future:**  
  - Anomaly detection, time-series forecasting, multimodal embeddings.  
  - Always framed as *flagging unusual patterns*, never diagnosis.  
- **Guardrails:**  
  - Reports include rationale, history, and supporting references.  
  - Prevent unsupported medical claims.  

### 5.4 Security & Privacy  
- End-to-end encryption, row-level security (RLS).  
- Privacy-first design to ensure compliance scalability.  
- HIPAA/FDA alignment considered from the start.  

---

## 6. Pilot & Evaluation Plan  
- **Exploratory pilot with clinical advisors** to test feasibility.  
- Metrics: ingestion accuracy, flag precision, system uptime, user comprehension.  
- Clinician evaluation: clarity and usefulness of reports in preventive workflows.  
- Compliance check: HIPAA, FDA digital health guidelines.  

---

## 7. Roadmap & Future Vision  
- **Year 1–2:** Complete MVP, publish technical whitepaper, open-source core modules.  
- **Year 2–3:** Expand into time-series ML models and multimodal data (labs + lifestyle).  
- **Year 3–4:** Integrate with FHIR/EHR systems for clinical testing.  
- **Year 4–5:** Scale adoption via partnerships; expand predictive models (autoimmune, metabolic dysfunction).  
- **Long-term:** a public-facing platform under physician oversight, bridging consumer monitoring with formal healthcare systems.  

---

## 8. References  
- CDC. *Chronic Disease Burden in the United States.* (2023).  
- HHS. *Digital Health Strategy.* (2022).  
- NIH. *AI for Biomedical and Behavioral Research.* (2023).  
- FDA. *Digital Health Innovation Action Plan.* (2021).  
- Peer-reviewed validation studies of wearables (HRV via Fitbit, Oura sleep accuracy, Garmin step tracking).  
