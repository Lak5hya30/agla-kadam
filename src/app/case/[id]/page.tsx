"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { PrivacyWarning } from "@/components/Disclaimer";
import { ReadAloud } from "@/components/ReadAloud";
import { useResolvedCase } from "@/lib/useCase";
import { CaseGuard } from "@/components/CaseGuard";

export default function CasePage({ params }: { params: { id: string } }) {
  const { t, lang } = useLang();
  const { demoCase: c, ready } = useResolvedCase(params.id);
  if (!ready || !c) return <CaseGuard ready={ready} hasCase={!!c} />;

  const title =
    lang === "hi" && c.grievance.title_hi ? c.grievance.title_hi : c.grievance.title;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {c.id} · {c.citizen.name}
            {c.citizen.context ? ` · ${c.citizen.context}` : ""}
          </p>
          <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
        </div>
        <span className="pill bg-status-unclearSoft text-ink-soft text-sm">
          <span aria-hidden="true">📄</span>
          {t("case.status")}:{" "}
          <strong className="uppercase tracking-wide">{t("case.disposed")}</strong>
        </span>
      </div>

      <DocumentCard
        label={t("case.grievance")}
        text={c.grievance.text}
        textHi={c.grievance.text_hi}
        metaLabel={t("case.submitted")}
        metaValue={c.grievance.submittedAt}
      />

      <DocumentCard
        label={t("case.response")}
        text={c.response.text}
        textHi={c.response.text_hi}
        metaLabel={t("case.received")}
        metaValue={c.response.receivedAt}
        accent
      />

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

function DocumentCard({
  label,
  text,
  textHi,
  metaLabel,
  metaValue,
  accent = false,
}: {
  label: string;
  text: string;
  textHi?: string;
  metaLabel: string;
  metaValue: string;
  accent?: boolean;
}) {
  const { lang } = useLang();
  const [showOriginal, setShowOriginal] = useState(false);

  const showHindi = lang === "hi" && Boolean(textHi);
  const primary = showHindi ? (textHi as string) : text;

  return (
    <article className={`card space-y-2 ${accent ? "border-l-4 border-l-accent/40" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint">
          {label}
        </h2>
        <ReadAloud text={primary} />
      </div>

      <p className="whitespace-pre-line leading-relaxed text-ink">{primary}</p>

      {showHindi && (
        <div>
          <button
            type="button"
            onClick={() => setShowOriginal((s) => !s)}
            className="text-xs font-semibold text-accent hover:underline"
            aria-expanded={showOriginal}
          >
            {showOriginal ? "मूल पाठ छिपाएँ" : "मूल पाठ (अंग्रेज़ी) देखें"}
          </button>
          {showOriginal && (
            <p className="mt-1 whitespace-pre-line rounded-lg bg-surface-soft p-2 text-sm leading-relaxed text-ink-soft">
              {text}
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-ink-faint">
        {metaLabel}: {metaValue}
      </p>
    </article>
  );
}
