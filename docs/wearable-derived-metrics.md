# Wearable-Derived Metrics and Candidate Digital Biomarkers

> **Status:** authoritative product/architecture spec for the wearable-data and
> derived-analytics layer. Most of what follows is **not yet implemented** — the
> wearable ingestion pipeline is currently stubbed (`lib/oauth.ts`,
> `lib/deviceAccounts.ts`, `lib/queue.ts`). This document is the reference that
> Phase 2 (provider connectivity) and Phase 3 (longitudinal intelligence) work
> must satisfy. A per-item status reconciliation is at the end.

SubHealthAI uses data from users' **existing** wearables and health-data
platforms. It does **not** require proprietary SubHealthAI hardware.

## 1. Product objective

A user who connects an external wearable or health-data source should receive:

1. The underlying authorized physiological measurements.
2. Relevant provider-native scores, **clearly attributed to the provider**.
3. SubHealthAI-derived longitudinal indicators.
4. Personalized baseline-relative analysis.
5. Transparent explanations of which signals contributed to observed changes.
6. Cross-source analysis incorporating optional laboratory, lifestyle, symptom,
   and event data.

## 2. Provider-native data

When permitted by the provider API, ingest and preserve: heart rate, resting
heart rate, heart-rate variability, sleep duration, sleep stages, respiratory
rate, oxygen saturation, temperature deviation, steps, activity, workouts, and
provider-computed scores (recovery / readiness / strain / sleep score / etc.).

**Attribution rule.** Provider-native scores must remain explicitly identified by
provider and must never be represented as SubHealthAI calculations — e.g.
`WHOOP Recovery Score`, `Oura Readiness Score`, `Fitbit Sleep Score`. Do **not**
reverse-engineer or reproduce proprietary provider scoring algorithms.

## 3. SubHealthAI-derived indicators

A **versioned** analytics framework derives transparent indicators such as:
Instability Index, personal baseline deviation, autonomic deviation, sleep
regularity, persistent HRV suppression, persistent resting-heart-rate elevation,
recovery lag, multisignal drift, circadian disruption, trend persistence,
volatility, change-point detection, pre/post-event comparisons, data
sufficiency, and cross-source signal alignment.

**Every derived indicator must carry:** formal definition · input signals ·
required minimum data · calculation window · missing-data behavior · unit
handling · baseline version · algorithm version · data-quality status ·
calculation timestamp · feature attribution (where applicable) · known
limitations.

### 3.1 Indicator registry (honest current status)

| Indicator | Status today | Notes |
|---|---|---|
| Instability Index | Demo + partial real | Presented in UI; computed by `lib/dashboardRealUser.ts` / `risk_scores`. Lacks full formal metadata (window/version/limitations) as a first-class record. |
| Volatility | Partial | `eval_volatility_series`, dashboard `volatilityIndex`. |
| Baseline deviation / baselines | Partial | `baseline_versions` (hrv/rhr/sleep/steps/stress); versioned rows exist. |
| Flags (hrv_decline, rhr_elevated, recovery_lag, sleep_debt, activity_instability, stress_marker) | Partial | `flags` table + `lib/flagRules.ts`; rule-based, rationale strings. |
| Feature attribution (SHAP-style) | Partial | `explain_contribs`, `v_shap_topk`, `ml/explainability.py`. |
| Change-point detection | Not implemented | Roadmap. |
| Circadian disruption / sleep regularity | Not implemented | Roadmap. |
| Autonomic deviation / persistent HRV suppression / RHR elevation | Not implemented as named indicators | Underlying HRV/RHR signals exist; the persistent-deviation indicators do not. |
| Cross-source signal alignment | Not implemented | Depends on the harmonization layer (§5). |

The registry is the intended home for the mandated metadata; today most
indicators do not yet record all required fields. Do not present any of these as
validated.

## 4. Terminology

Until appropriate validation exists, describe derived indicators only as:
**derived physiological indicator**, **digital measure**, **baseline-relative
signal**, **research-associated pattern**, or **candidate digital biomarker**.

The term **“validated digital biomarker” must not be used** without documented
analytical and scientific validation. (“Biomarker” remains fine for actual
laboratory analytes such as HbA1c, glucose, hs-CRP, and lipids.)

## 5. Cross-provider harmonization

Provider measurements differ in sampling frequency, units, algorithms, and
availability. The normalization layer must:

- Preserve raw provider records and provider identity.
- Store canonical normalized values **separately** from raw records.
- Avoid treating measurements from different devices as perfectly equivalent.
- Record device changes; detect gaps caused by provider switching.
- Allow provider-specific calibration metadata.
- Prevent duplicate ingestion (idempotent sync, provider record id + dedupe key).
- Track known changes in provider algorithms or data schemas.

**Do not silently combine incompatible measurements.**

## 6. Grounded AI usage

The AI explanation layer **may** explain: what changed, when it began, which
signals contributed, whether the pattern persisted, whether available data is
sufficient, what data is missing, and how selected periods compare.

The AI layer **must not**: diagnose medical conditions, invent biomarkers, claim
causality from correlation, recommend treatment, override authoritative
calculations, rebrand provider-native scores, or present candidate digital
biomarkers as clinically validated. (Enforced at the trust boundary: the LLM
explains verified, versioned results returned by tools — see the copilot routes.)

## 7. Research and evaluation readiness

Instrument the system so future studies can evaluate: cross-device consistency,
baseline stability, test–retest reliability, sensitivity to controlled signal
changes, robustness to missing data, robustness to provider switching,
attribution stability, false-alert frequency, user comprehension, AI
groundedness, and unsupported medical-claim rate.

The architecture should support future grant proposals and publications
**without overstating** current validation status.

## 8. Current status vs. this spec (2026-07-11)

- **Provider connectivity (§2):** not implemented — OAuth/token/queue are stubs;
  `device_accounts` lists providers but nothing writes to it, and there is no
  table distinguishing provider-native scores from derived indicators.
- **Derived-indicator framework (§3):** partially present as ad-hoc components
  (Instability Index, volatility, flags, SHAP); no unified versioned registry
  with the mandated per-indicator metadata yet.
- **Terminology (§4):** repo is compliant — no derived indicator is described as
  a validated biomarker; "clinically validated digital biomarkers" appears only
  under *Future Regulated Research (not current product claims)*.
- **Harmonization (§5):** not implemented — canonical normalization, provenance,
  and dedupe layers are Phase-2 work.
- **Grounded AI (§6):** copilot is tool-grounded and authorization-scoped; output
  policy enforcement (diagnostic-language / unsupported-claim checks) is not yet
  implemented.
- **Evaluation (§7):** an eval scaffold exists (`ml/evaluation`, `/api/eval`) but
  the wearable-specific metrics above are not yet measured.
