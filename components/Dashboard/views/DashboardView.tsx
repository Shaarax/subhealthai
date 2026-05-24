"use client";

import React from 'react';
import { Activity, Brain, Zap, GitCommit, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { BentoCard } from '@/components/ui/BentoCard';
import { MiniAreaChart } from '@/components/ui/MiniAreaChart';
import { StatValue } from '@/components/ui/StatValue';
import { ClinicalReasonsCard } from '@/components/Dashboard/ClinicalReasonsCard';
import { ResearchSignalSummary } from '@/components/Dashboard/ResearchSignalSummary';
import { formatNumber } from '@/lib/utils/dashboardUtils';
import type { DashboardViewData } from '@/lib/dashboardViewData';

type DashboardViewProps = {
  profile: 'healthy' | 'risk';
  data: DashboardViewData;
  onToggleCopilot: () => void;
  forecastSeries?: any[];
  isDemo: boolean;
  userId: string | null;
  latestMetrics: any;
  clinicalReasons: string[];
  version?: string;
  onViewFullAttribution?: () => void;
};

const ENGINE_VERSION = "phase3-v1-wes";

export const DashboardView = ({ 
  profile, 
  data, 
  onToggleCopilot, 
  forecastSeries, 
  isDemo, 
  userId, 
  latestMetrics, 
  clinicalReasons,
  version = ENGINE_VERSION,
  onViewFullAttribution,
}: DashboardViewProps) => {
  const isRisk = profile === 'risk';
  const chartColor = isRisk ? '#fbbf24' : '#22d3ee';
  const hasForecast = data.hasForecast;
  
  const demoReasons = isDemo ? (isRisk ? [
    "Low steps",
    "Short sleep",
    "High RHR",
    "Low HRV",
    "High LDL & triglycerides",
    "Prediabetes-range HbA1c"
  ] : [
    "Optimal sleep duration",
    "Stable HRV",
    "Normal RHR",
    "Healthy activity levels",
    "Glucose signal within demo range",
    "Lipid signal within demo range"
  ]) : [];
  
  const generateReasonsFromData = () => {
    if (isDemo) return [];
    const reasons: string[] = [];
    
    if (data?.drivers && data.drivers.length > 0) {
      data.drivers.slice(0, 3).forEach((driver: any) => {
        if (driver.impact > 0) {
          reasons.push(`${driver.name} increased instability`);
        } else if (driver.impact < 0) {
          reasons.push(`${driver.name} reduced instability`);
        }
      });
    }
    
    if (data?.trends) {
      if (data.trends.hrv === 'down') reasons.push("HRV decreased vs baseline");
      if (data.trends.rhr === 'up') reasons.push("Resting heart rate elevated");
    }
    
    if (data?.labs && data.labs.length > 0) {
      data.labs.forEach((lab: any) => {
        if (lab.status === 'Elevated' || lab.status === 'High' || lab.status === 'Borderline') {
          reasons.push(`${lab.name} ${lab.status.toLowerCase()}`);
        }
      });
    }
    
    if (data?.drift) {
      if (data.drift.metabolic === 'Moderate' || data.drift.metabolic === 'Elevated') {
        reasons.push("Metabolic drift consistent with elevated instability");
      }
      if (data.drift.cardio === 'Elevated') {
        reasons.push("Cardiovascular markers elevated");
      }
    }
    
    if (data?.instabilityScore) {
      if (data.instabilityScore >= 70) {
        reasons.push("High instability signal");
      } else if (data.instabilityScore >= 40) {
        reasons.push("Moderate instability signal");
      }
    }
    
    return reasons.slice(0, 6);
  };
  
  const reasonsToShow = clinicalReasons && clinicalReasons.length > 0 
    ? clinicalReasons 
    : (isDemo ? demoReasons : generateReasonsFromData());
  
  const chartData = forecastSeries && forecastSeries.length > 0
    ? forecastSeries.map((point: any) => Math.round((point.risk || point.value || 0) * 100))
    : (isDemo ? (isRisk ? [45, 50, 65, 78, 82, 80, 85, 90, 88, 92, 85, 80] : [12, 15, 10, 14, 12, 18, 15, 12, 10, 14, 12, 15]) : []);

  const shouldShowGraph = isDemo || hasForecast;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <BentoCard 
        colSpan="md:col-span-2 lg:col-span-3" 
        rowSpan="row-span-2" 
        title="Instability Index" 
        icon={Activity}
        delay={100}
        glowing={isRisk}
        className="pr-4"
      >
        {shouldShowGraph ? (
          <>
            <div className="flex justify-between items-center w-full mb-4 relative z-20 pr-3">
              <div className="flex items-center gap-2">
                 <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border border-opacity-20 ${isRisk ? 'text-amber-400 border-amber-400 bg-amber-400/10' : 'text-cyan-400 border-cyan-400 bg-cyan-400/10'}`}>
                   {data.status}
                 </div>
              </div>
              <div className="text-right flex flex-col justify-center">
                 <StatValue 
                   value={data.instabilityScore} 
                   unit="/100" 
                   trend={isRisk ? 'up' : 'down'} 
                   trendVal={isRisk ? '+42% Drift' : '-2% Stable'} 
                   isRisk={isRisk} 
                 />
                 <div className="text-[9px] text-slate-600 font-mono mt-1">vs 28-day baseline</div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-48 z-10 opacity-60 pr-3">
               <MiniAreaChart data={chartData} color={chartColor} height={100} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start justify-center h-full gap-3">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              No baseline yet
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              We haven&apos;t computed your Instability baseline yet. Once we have enough
              wearable + lab data, this card will activate.
            </p>
          </div>
        )}
      </BentoCard>

      <BentoCard colSpan="md:col-span-2 lg:col-span-3" title="Daily Briefing" icon={Brain} delay={150}>
        <div className="flex flex-col justify-between h-full">
          <p className="text-sm text-slate-300 leading-relaxed font-mono border-l-4 border-cyan-500/30 pl-4 py-1 max-w-[75ch]">
            {data.narrative}
          </p>
          <div className="mt-4 flex gap-2">
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">Calibration: within expected range</span>
          </div>
        </div>
      </BentoCard>

      <BentoCard colSpan="md:col-span-2 lg:col-span-3" title="Biometric Telemetry" icon={Zap} delay={200}>
        <div className="grid grid-cols-2 gap-4 h-full">
          <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono mb-2">HRV (rmssd)</span>
            <span className={`text-xl font-['Unbounded'] ${isRisk ? 'text-amber-400' : 'text-white'}`}>{formatNumber(data.vitals.hrv, 0)}<span className="text-[10px] text-slate-500">ms</span></span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono mb-2">RHR</span>
            <span className={`text-xl font-['Unbounded'] ${isRisk ? 'text-amber-400' : 'text-white'}`}>{formatNumber(data.vitals.rhr, 0)}<span className="text-[10px] text-slate-500">bpm</span></span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono mb-2">Resp Rate</span>
            <span className="text-xl font-['Unbounded'] text-white">{data.vitals.resp}<span className="text-[10px] text-slate-500">rpm</span></span>
          </div>
          <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono mb-2">Skin Temp</span>
            <span className="text-xl font-['Unbounded'] text-white">{data.vitals.temp}<span className="text-[10px] text-slate-500">°F</span></span>
          </div>
        </div>
      </BentoCard>

      <BentoCard colSpan="md:col-span-2 lg:col-span-2" title="Key Contributors" icon={GitCommit} delay={250}>
        {data.drivers.length === 0 ? (
          <div className="flex flex-col items-start justify-center h-full gap-2">
            <p className="text-xs text-slate-500">
              Contributors will appear once enough observation history is available for your profile.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="space-y-4 mt-2 flex-1">
              {data.drivers.map((d, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-mono">{d.name}</span>
                    <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${d.impact > 0 ? 'bg-rose-950/20 text-rose-400/90 border border-rose-900/50' : 'bg-emerald-950/20 text-emerald-400/90 border border-emerald-900/50'}`}>
                      {d.impact > 0 ? '↑ Instability' : '↓ Instability'}
                    </div>
                  </div>
                  {d.domain && (
                    <div className="text-[9px] text-slate-500 ml-1">{d.domain}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-auto pt-4 space-y-2 text-center">
              <p className="text-[9px] text-slate-600 font-mono">
                Based on SHAP-style feature attribution
              </p>
              {onViewFullAttribution && (
                <button
                  type="button"
                  onClick={onViewFullAttribution}
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  View full attribution
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        )}
      </BentoCard>

      <BentoCard colSpan="md:col-span-4 lg:col-span-2" title="Physiological Drift Indicators" icon={TrendingUp} delay={300} className={isRisk ? "border-amber-500/20 bg-amber-900/5" : ""}>
        <div className="space-y-5 h-full flex flex-col justify-center">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
             <span className="text-xs text-slate-400 font-mono">Metabolic</span>
             <span className={`text-xs font-bold font-mono ${data.drift.metabolic === 'Low' ? 'text-emerald-400' : data.drift.metabolic === 'Moderate' ? 'text-amber-400' : 'text-amber-500'}`}>{data.drift.metabolic}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
             <span className="text-xs text-slate-400 font-mono">Cardiovascular</span>
             <span className={`text-xs font-bold font-mono ${data.drift.cardio === 'Low' ? 'text-emerald-400' : data.drift.cardio === 'Moderate' ? 'text-amber-400' : 'text-amber-500'}`}>{data.drift.cardio}</span>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-xs text-slate-400 font-mono">Inflammatory</span>
             <span className={`text-xs font-bold font-mono ${data.drift.inflammation === 'Normal' ? 'text-emerald-400' : 'text-rose-400'}`}>{data.drift.inflammation}</span>
          </div>
          <div className="mt-auto pt-2">
            <p className="text-[9px] text-slate-600 leading-tight">
              Non-diagnostic pattern indicators. Not intended for diagnosis, treatment, or clinical decision support.
            </p>
          </div>
        </div>
      </BentoCard>

      <BentoCard delay={320} colSpan="col-span-full md:col-span-2 lg:col-span-2" title="Why the Instability Index Moved" icon={AlertCircle}>
        <ClinicalReasonsCard reasons={reasonsToShow} />
      </BentoCard>

      <ResearchSignalSummary profile={profile} isDemo={isDemo} />
    </div>
  );
};
