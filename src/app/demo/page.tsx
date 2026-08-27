"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { Disclaimer } from "@/components/Disclaimer";
import { listCases } from "@/lib/caseData";

const CASE_META: Record<
  string,
  { badge: string; badgeClass: string }
> = {
  "DEMO-001": { badge: "Partly addressed", badgeClass: "bg-status-partialSoft text-status-partial" },
  "DEMO-002": { badge: "Fully resolved", badgeClass: "bg-status-okSoft text-status-ok" },
  "DEMO-003": { badge: "State jurisdiction", badgeClass: "bg-status-unclearSoft text-status-unclear" },
};

export default function DemoPage() {
  const { t } = useLang();
  const cases = listCases();

  return (
    <div className="container-page space-y-6 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-ink">{t("demo.title")}</h1>
        <p className="text-ink-soft">{t("demo.subtitle")}</p>
      </div>

      <div className="space-y-3">
        {cases.map((c) => {
          const meta = CASE_META[c.id];
          return (
            <Link
              key={c.id}
              href={`/case/${c.id}`}
              className="card block transition-shadow hover:shadow-lg focus-visible:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    {c.id} · {c.citizen.name}
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold text-ink">{c.label}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{c.tagline}</p>
                </div>
                {meta && (
                  <span
                    className={`pill shrink-0 ${meta.badgeClass}`}
                    aria-label={`Scenario: ${meta.badge}`}
                  >
                    {meta.badge}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="pill bg-surface-sunken text-ink-soft">
                  <span aria-hidden="true">📄</span> {t("case.status")}:{" "}
                  {t("case.disposed")}
                </span>
                <span className="font-semibold text-accent">
                  {t("case.check")} →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <Disclaimer />
    </div>
  );
}
