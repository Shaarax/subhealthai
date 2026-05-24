"use client";

import React from "react";
import { getDriverRationale } from "@/lib/utils/dashboardUtils";
import type { DashboardViewData } from "@/lib/dashboardViewData";

type Driver = DashboardViewData["drivers"][number];

const DOMAIN_STYLES: Record<string, string> = {
  Sleep: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  Lifestyle: "text-violet-400 border-violet-500/30 bg-violet-500/10",
  Metabolic: "text-amber-400 border-amber-500/30 bg-amber-500/10",
};

type DriverRationaleCardsProps = {
  drivers: Driver[];
};

export function DriverRationaleCards({ drivers }: DriverRationaleCardsProps) {
  if (drivers.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {drivers.map((driver, i) => {
        const domain = driver.domain;
        const domainStyle =
          (domain && DOMAIN_STYLES[domain]) ||
          "text-slate-400 border-slate-600/40 bg-slate-800/40";

        return (
          <div
            key={`${driver.name}-${i}`}
            className="rounded-xl border border-slate-700/60 bg-slate-900/50 px-3.5 py-3"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="text-xs font-mono text-slate-200 truncate">
                  {driver.name}
                </p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  {driver.impact > 0 ? "↑" : "↓"} Instability · magnitude{" "}
                  {Math.abs(driver.impact)}
                  {driver.value ? ` · ${driver.value}` : ""}
                </p>
              </div>
              {domain && (
                <span
                  className={`shrink-0 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-wide ${domainStyle}`}
                >
                  {domain}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug font-mono">
              {driver.rationale ?? getDriverRationale(driver)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
