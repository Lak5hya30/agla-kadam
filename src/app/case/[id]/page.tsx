"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { PrivacyWarning } from "@/components/Disclaimer";
import { ReadAloud } from "@/components/ReadAloud";
import { useResolvedCase } from "@/lib/useCase";
import { CaseGuard } from "@/components/CaseGuard";

export default function CasePage({ params }: { params: { id: string } }) {
  const { t } = useLang();
  const { demoCase: c, ready } = useResolvedCase(params.id);
  if (!ready || !c) return <CaseGuard ready={ready} hasCase={!!c} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {c.id} · {c.citizen.name}
            {c.citizen.context ? ` · ${c.citizen.context}` : ""}
          </p>
          <h1 className="text-2xl font-extrabold text-ink">{c.grievance.title}</h1>
        </div>
        <span className="pill bg-status-unclearSoft text-ink-soft text-sm">
          <span aria-hidden="true">📄</span>
          {t("case.status")}:{" "}
          <strong className="uppercase tracking-wide">{t("case.disposed")}</strong>
        </span>
      </div>

      <article className="card space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint">
            {t("case.grievance")}
          </h2>
          <ReadAloud text={c.grievance.text} />
        </div>
        <p className="whitespace-pre-line leading-relaxed text-ink">
          {c.grievance.text}
        </p>
        <p className="text-xs text-ink-faint">
          {t("case.submitted")}: {c.grievance.submittedAt}
        </p>
      </article>

      <article className="card space-y-2 border-l-4 border-l-accent/40">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint">
            {t("case.response")}
          </h2>
          <ReadAloud text={c.response.text} />
        </div>
        <p className="whitespace-pre-line leading-relaxed text-ink">
          {c.response.text}
        </p>
        <p className="text-xs text-ink-faint">
          {t("case.received")}: {c.response.receivedAt}
        </p>
      </article>

      <PrivacyWarning />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href={`/case/${c.id}/analysis`} className="btn-primary">
          {t("case.check")} →
        </Link>
        <Link href="/demo" className="btn-ghost">
          ← {t("common.back")}
        </Link>
      </div>
    </div>
  );
}
