import "./globals.css";
import React from "react";

export const metadata = {
  title: "SubHealthAI",
  description: "Early detection, before diagnosis."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <header className="mb-6">
            <h1 className="text-2xl font-bold">SubHealthAI</h1>
            <p className="text-sm opacity-80">Early signals. Earlier interventions.</p>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
