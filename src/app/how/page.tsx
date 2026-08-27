"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { Disclaimer } from "@/components/Disclaimer";

const ROWS: { capability: string; status: "Real" | "Mock" | "Not used" | "Synthetic" }[] = [
  { capability: "Citizen UI", status: "Real" },
  { capability: "OpenAI grievance-response comparison", status: "Real" },
  { capability: "User grievance filing form", status: "Real" },
  { capability: "Offline comparison (when no API key)", status: "Real" },
  { capability: "Request extraction", status: "Real" },
  { capability: "Evidence highlighting", status: "Real" },
  { capability: "Hindi explanation", status: "Real" },
  { capability: "Deterministic policy engine", status: "Real" },
  { capability: "Feedback submission", status: "Mock" },
  { capability: "Appeal submission", status: "Mock" },
  { capability: "Appeal tracking", status: "Mock" },
  { capability: "Demo sign-in (display name only)", status: "Mock" },
  { capability: "Real CPGRAMS login / passwords / OTP", status: "Not used" },
  { capability: "Government API integration", status: "Not used" },
  { capability: "Citizen data", status: "Synthetic" },
];

const STATUS_CLASS: Record<string, string> = {
  Real: "bg-status-okSoft text-status-ok",
  Mock: "bg-status-partialSoft text-status-partial",
  "Not used": "bg-status-unclearSoft text-ink-soft",
  Synthetic: "bg-accent-soft text-accent",
};

const HOW_STEPS = [
  {
    icon: "🧠",
    title: "OpenAI",
    body: "Understands and compares the two documents — extracts requests, actions, and evidence.",
  },
  {
    icon: "⚖️",
    title: "Rules engine",
    body: "Deterministic code decides workflow: feedback, appeal availability, jurisdiction.",
  },
  {
    icon: "🙋",
    title: "You",
    body: "Review every finding and confirm before anything is submitted.",
  },
  {
    icon: "📮",
    title: "Mock adapter",
    body: "Simulates the government action and issues a demo reference number.",
  },
];

export default function HowPage() {
  const { t } = useLang();
  return (
    <div className="container-reading space-y-6 py-6">
      <h1 className="text-2xl font-extrabold text-ink">{t("mockreal.title")}</h1>

      <section className="grid gap-3 sm:grid-cols-2">
        {HOW_STEPS.map((s) => (
          <div key={s.title} className="card">
            <p className="text-2xl" aria-hidden="true">{s.icon}</p>
            <h2 className="mt-1 font-bold text-ink">{s.title}</h2>
            <p className="text-sm text-ink-soft">{s.body}</p>
          </div>
        ))}
      </section>

      <section className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            What is real and what is mocked in this prototype
          </caption>
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase tracking-wide text-ink-faint">
              <th scope="col" className="py-2 pr-4 font-semibold">Capability</th>
              <th scope="col" className="py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.capability} className="border-b border-black/5 last:border-0">
                <td className="py-2 pr-4 text-ink">{r.capability}</td>
                <td className="py-2">
                  <span className={`pill text-xs ${STATUS_CLASS[r.status]}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Disclaimer />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/demo" className="btn-primary">
          {t("home.cta")} →
        </Link>
        <Link href="/" className="btn-ghost">
          ← {t("common.back")}
        </Link>
      </div>
    </div>
  );
}
