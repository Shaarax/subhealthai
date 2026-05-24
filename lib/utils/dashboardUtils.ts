import type { ClinicalSpecialty, DriverDomain } from '@/lib/dashboardViewData';

// Helper: format numbers with specified decimal places, handle null/undefined/NaN
export function formatNumber(n: number | null | undefined, digits = 0) {
  if (n === null || n === undefined || isNaN(n as number)) return '—';
  return (n as number).toFixed(digits);
}

/** Convert stored risk (0–1 fraction or 0–100 percent) to dashboard Instability Score. */
export function normalizeInstabilityScore(raw: number | null | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  if (n <= 1) return Math.round(n * 100);
  return Math.round(n);
}

// Helper: map specialty codes → human labels (legacy data; not shown on dashboard UI)
export function specialtyLabel(s: ClinicalSpecialty): string {
  switch (s) {
    case "PrimaryCare":
      return "Primary care";
    case "Cardiology":
      return "Cardiology";
    case "Endocrinology":
      return "Endocrinology";
    case "Nephrology":
      return "Nephrology";
    case "Pulmonology":
      return "Pulmonology";
    case "SleepMedicine":
      return "Sleep medicine";
    default:
      return s;
  }
}

/** Infer physiological domain for SHAP drivers (no medical specialty routing). */
export function inferDriverDomain(name: string): DriverDomain | undefined {
  const n = name.toLowerCase();
  if (n.includes("sleep")) return "Sleep";
  if (
    n.includes("glucose") ||
    n.includes("hba1c") ||
    n.includes("lipid") ||
    n.includes("crp") ||
    n.includes("metabolic") ||
    n.includes("glycemic")
  ) {
    return "Metabolic";
  }
  if (
    n.includes("caffeine") ||
    n.includes("training") ||
    n.includes("load") ||
    n.includes("hrv") ||
    n.includes("rhr") ||
    n.includes("autonomic") ||
    n.includes("respiratory") ||
    n.includes("resp")
  ) {
    return "Lifestyle";
  }
  return undefined;
}

/** Plain-language SHAP rationale for exhibit-facing explainability copy. */
export function getDriverRationale(driver: {
  name: string;
  impact: number;
  value?: string;
  domain?: string;
}): string {
  const magnitude = Math.abs(driver.impact);
  const valueClause = driver.value ? ` (current: ${driver.value})` : "";

  if (driver.impact > 0) {
    return `${driver.name}${valueClause} is consistent with higher instability in today's index—attributed magnitude ~${magnitude} points vs baseline.`;
  }
  if (driver.impact < 0) {
    return `${driver.name}${valueClause} is consistent with lower instability in today's index—attributed magnitude ~${magnitude} points vs baseline.`;
  }
  return `${driver.name}${valueClause} shows minimal attribution to today's instability index.`;
}

