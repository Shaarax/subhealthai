"use client";

import React from "react";
import { ClipboardList } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";

type ResearchSignalSummaryProps = {
  profile: "healthy" | "risk";
  isDemo: boolean;
};

const NOMINAL_OBSERVATIONS = [
  "Sleep and recovery trends remain aligned with baseline",
  "Training load variation contributed to minor instability elevation",
  "HRV and resting heart rate remained within expected demo ranges",
  "Mild metabolic-pattern variation observed relative to baseline",
];

const RISK_OBSERVATIONS = [
  "Sleep duration below baseline relative to the 28-day window",
  "HRV and resting heart rate elevated vs expected demo ranges",
  "Training load and recovery variation contributed to instability elevation",
  "Metabolic- and inflammatory-pattern variation observed relative to baseline",
];

const DEMO_METADATA = [
  "Synthetic demo profile",
  "28-day rolling baseline architecture",
  "SHAP-style feature attribution",
  "Explainable instability-monitoring prototype",
];

const REAL_METADATA = [
  "User wearable + lab inputs",
  "28-day rolling baseline architecture",
  "SHAP-style feature attribution",
  "Explainable instability-monitoring prototype",
];

export function ResearchSignalSummary({
  profile,
  isDemo,
}: ResearchSignalSummaryProps) {
  const observations = profile === "risk" ? RISK_OBSERVATIONS : NOMINAL_OBSERVATIONS;
  const metadata = isDemo ? DEMO_METADATA : REAL_METADATA;

  return (
    <BentoCard
      title="Research Signal Summary"
      icon={ClipboardList}
      delay={350}
      colSpan="md:col-span-4 lg:col-span-6"
    >
      <div className="space-y-5 font-mono text-xs text-slate-300 leading-relaxed">
        <div className="space-y-3 max-w-4xl">
          <p>
            Baseline-relative contributors from the current 28-day observation window.
          </p>
          <p className="text-slate-400">
            These outputs summarize longitudinal instability patterns derived from wearable
            and lifestyle-associated signals. The system is intended for research and
            informational use only and does not diagnose, predict, or screen for disease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-cyan-400/90 mb-3">
              Current observations
            </h3>
            <ul className="space-y-2">
              {observations.map((item) => (
                <li key={item} className="flex gap-2 text-[11px] text-slate-300">
                  <span className="text-slate-600 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-slate-400 mb-3">
              System metadata
            </h3>
            <ul className="space-y-2">
              {metadata.map((item) => (
                <li key={item} className="flex gap-2 text-[11px] text-slate-400">
                  <span className="text-slate-600 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
