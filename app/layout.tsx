// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubHealthAI — Physiological Pattern Monitoring Research Prototype",
  description:
    "SubHealthAI is an explainable, non-diagnostic research prototype that monitors physiological signal patterns from wearable data. Not a medical device.",
  openGraph: {
    title: "SubHealthAI — Physiological Pattern Monitoring Research Prototype",
    description:
      "SubHealthAI is an explainable, non-diagnostic research prototype that monitors physiological signal patterns from wearable data. Not a medical device.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;600;700&family=Space+Mono:wght@400;700&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
