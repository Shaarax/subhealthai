import React from "react";

export default function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-800 p-4">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <div className="text-sm">{children}</div>
    </section>
  );
}
