"use client";

import React, { useMemo } from "react";
import { GitCommit, ArrowRight } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import type { DashboardViewData } from "@/lib/dashboardViewData";

type ExplainabilityPanelProps = {
  data: DashboardViewData;
  onViewFullAttribution?: () => void;
};

function formatDriverLine(driver: DashboardViewData["drivers"][number]): string {
  const direction = driver.impact > 0 ? "↑" : driver.impact < 0 ? "↓" : "→";
  const magnitude = Math.abs(driver.impact);
  const domain = driver.domain ? ` · ${driver.domain}` : "";
  return `${driver.name} — ${direction}${magnitude}${domain}`;
}

export function ExplainabilityPanel({
  data,
  onViewFullAttribution,
}: ExplainabilityPanelProps) {
  const rankedDrivers = useMemo(
    () =>
      [...(data.drivers || [])]
        .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
        .slice(0, 3),
    [data.drivers],
  );

  return (
    <BentoCard
      title="Explainability"
      icon={GitCommit}
      delay={350}
      colSpan="md:col-span-4 lg:col-span-6"
    >
      <div className="space-y-4 h-full flex flex-col">
        {rankedDrivers.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono">
            Explainability will appear once enough risk history is available for
            your profile.
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {rankedDrivers.map((driver, i) => (
                <li
                  key={`${driver.name}-${i}`}
                  className="text-xs font-mono text-slate-300 leading-snug"
                >
                  {formatDriverLine(driver)}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-slate-500 font-mono leading-snug">
              Non-diagnostic SHAP attribution for research and explanatory use
              only.
            </p>
          </>
        )}

        {onViewFullAttribution && rankedDrivers.length > 0 && (
          <button
            type="button"
            onClick={onViewFullAttribution}
            className="mt-auto pt-2 inline-flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View full attribution
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </BentoCard>
  );
}
