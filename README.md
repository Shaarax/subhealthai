# SubHealthAI: Early Detection Before Diagnosis

SubHealthAI is an **AI-powered health monitoring platform** designed to detect  
subclinical dysfunctions and early signs of chronic illness **before they become diagnosable disease**.  
By combining wearable data, lifestyle inputs, and advanced machine learning, SubHealthAI aims to shift healthcare from **reactive treatment** to **preventive intervention**.

---

## 🌍 Why This Matters
- **Chronic disease drives ~90% of U.S. healthcare costs** ($4.1 trillion annually).
- Millions of Americans suffer from **silent inflammation, metabolic dysfunction, and autoimmune issues** that remain invisible to traditional diagnostics.
- **Early detection saves lives and reduces costs.** By identifying hidden risk patterns before symptoms escalate, SubHealthAI enables timely action for individuals and physicians.

---

## 🚀 What We’re Building (MVP)
- **Data ingestion** from wearables, lifestyle tracking, and behavioral inputs  
- **Signal flags**: rule-based indicators (e.g., sleep debt, HRV decline, elevated resting HR)  
- **AI-generated weekly note**: plain-language report summarizing risks and trends  
- **Clinician export**: one-tap PDF/email report with tables, charts, and references  
- **Audit logging**: system-wide transparency for trust and reliability  

This repository contains the **starter codebase**, database schema, and demo UI for the MVP.

---

## 🛠 Tech Stack
- **Frontend**: Next.js (App Router), TailwindCSS  
- **Backend / Auth**: Supabase (Postgres, Row-Level Security, Auth)  
- **Data Processing**: Cron-style scripts for wearable delta ingestion + flag computation  
- **AI Integration**: LLM wrappers for generating weekly notes (OpenAI / Hugging Face)  
- **Export**: PDF generation + email delivery (transactional API integration planned)  

---

## 🗂 Database Schema
Key tables in `/supabase/schema.sql`:
- `users` → profiles and auth linkage  
- `events_raw` → ingested wearable + lifestyle data  
- `metrics` → computed metrics (sleep, HR, HRV, steps, etc.)  
- `flags` → rule-based signals indicating early risk  
- `weekly_notes` → AI-generated summaries for end users  
- `audit_log` → system-wide transparency and accountability  

---

## 📈 Roadmap
- [x] Project scaffold: Next.js + Supabase + TailwindCSS  
- [x] Core schema design (users, events, flags, metrics, notes, audit log)  
- [ ] Basic dashboard UI with signal flags + weekly note preview  
- [ ] PDF export and clinician-ready report  
- [ ] Integrations with wearable APIs (Fitbit, Oura, Garmin, Apple Health)  
- [ ] Advanced AI models: time-series forecasting, embeddings, and multi-modal risk scoring  
- [ ] Pilot study with real user data + clinical advisors  

---

## 📄 Whitepaper
See `/docs/whitepaper-outline.md` for the initial research framing:  
- U.S. healthcare burden of chronic illness  
- Gaps in early detection and subclinical dysfunction  
- SubHealthAI’s proposed solution architecture  
- Future research and clinical validation pathway  

---

## 🤝 How to Contribute
We welcome collaborators in:  
- Preventive medicine, public health, and clinical research  
- AI/ML modeling (time-series, embeddings, anomaly detection)  
- Full-stack engineering (Next.js, Supabase, data pipelines)  

---

## 📬 Contact
Founder: **Mohd Shaarif Khan**  
Email: [your email here]  
GitHub: [your GitHub username]  
LinkedIn: [your LinkedIn link]  

---

> ⚠️ **Disclaimer**: SubHealthAI is a research and development project.  
> It is **not a medical device** and does not provide medical advice.  
> Always consult qualified healthcare professionals for medical decisions.
