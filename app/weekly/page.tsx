"use client";
import React from "react";

export default function WeeklyPage() {
  return (
    <main className="rounded-2xl border border-zinc-800 p-4">
      <h2 className="mb-2 text-lg font-semibold">Weekly Note</h2>
      <p className="text-sm opacity-80">
        This is a placeholder summary generated from structured flags.
      </p>
      <div className="mt-4 space-y-2 text-sm">
        <p><strong>Signals →</strong> sleep debt, low HRV, elevated resting HR</p>
        <p><strong>Flags →</strong> 4 high, 2 medium</p>
        <p><strong>What this means →</strong> Possible recovery debt and stress trend</p>
        <p><strong>Sources →</strong> Fitbit export, manual symptom log</p>
      </div>
    </main>
  );
}
