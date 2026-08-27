"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { Disclaimer } from "@/components/Disclaimer";
import { ReadAloud } from "@/components/ReadAloud";
import { DemoQuickStart } from "@/components/DemoQuickStart";

export default function HomePage() {
  const { t } = useLang();

  const trust = [
    t("trust.synthetic"),
    t("trust.nologin"),
    t("trust.noapi"),
    t("trust.nopersonal"),
  ];

  return (
    <div className="mx-auto max-w-content space-y-8">
      <Suspense fallback={null}>
        <DemoQuickStart />
      </Suspense>
      <section className="space-y-4 pt-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          {t("app.name")} · {t("app.subtitle")}
        </p>
        <h1 className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          {t("home.hero1")}
          <br />
          <span className="text-accent">{t("home.hero2")}</span>
        </h1>
        <p className="text-lg text-ink-soft">{t("home.support")}</p>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <Link href="/demo" className="btn-primary sm:w-auto">
            {t("home.cta")} →
          </Link>
          <Link href="/how" className="btn-ghost sm:w-auto">
            {t("home.how")}
          </Link>
          <ReadAloud text={`${t("home.hero1")} ${t("home.hero2")} ${t("home.support")}`} />
        </div>
      </section>

      <section aria-label="Trust" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {trust.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 rounded-xl border border-black/5 bg-surface px-3 py-3 text-sm font-medium text-ink-soft shadow-card"
          >
            <span aria-hidden="true" className="text-status-ok">
              ✓
            </span>
            {item}
          </div>
        ))}
      </section>

      {/* The product insight, previewed on the homepage (§37) */}
      <section className="card space-y-4">
        <h2 className="text-lg font-bold">
          {t("analysis.title")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <InsightCard
            ask="Repair the road"
            said="“repair work has been initiated”"
            verdict={t("status.partial")}
            icon="◐"
            tone="text-status-partial"
          />
          <InsightCard
            ask="Replace safety barrier"
            said={t("analysis.noMatch")}
            verdict={t("status.not_addressed")}
            icon="!"
            tone="text-status-missing"
          />
          <InsightCard
            ask="Confirm completion"
            said="No completion date"
            verdict={t("status.unclear")}
            icon="?"
            tone="text-status-unclear"
          />
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}

function InsightCard({
  ask,
  said,
  verdict,
  icon,
  tone,
}: {
  ask: string;
  said: string;
  verdict: string;
  icon: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-surface-soft p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
        You asked
      </p>
      <p className="font-semibold text-ink">{ask}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        Department said
      </p>
      <p className="text-ink-soft">{said}</p>
      <p className={`mt-2 flex items-center gap-1.5 font-bold ${tone}`}>
        <span aria-hidden="true">{icon}</span>
        {verdict}
      </p>
    </div>
  );
}
