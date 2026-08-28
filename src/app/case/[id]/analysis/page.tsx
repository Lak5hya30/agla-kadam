"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { useJourney } from "@/components/JourneyProvider";
import { ComparisonCard } from "@/components/ComparisonCard";
import { ReadAloud } from "@/components/ReadAloud";
import { toDisplayCoverage } from "@/lib/schema";
import type { AnalysisSource } from "@/lib/analyze";
import { useResolvedCase } from "@/lib/useCase";
import { ADHOC_ID } from "@/lib/adhocCase";
import { CaseGuard } from "@/components/CaseGuard";
import type { DemoCase } from "@/lib/types";

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const { t, lang } = useLang();
  const { state, update } = useJourney();
  const { demoCase: c, ready } = useResolvedCase(params.id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(
    async (theCase: DemoCase) => {
      setLoading(true);
      setError(null);
      try {
        const body =
          theCase.id === ADHOC_ID
            ? { grievance: theCase.grievance.text, response: theCase.response.text }
            : { caseId: theCase.id };
        const res = await fetch("/api/analyze-resolution", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("request failed");
        const data = await res.json();
        update({
          analysis: data.analysis,
          analysisSource: data.source,
          fallbackReason: data.fallbackReason ?? undefined,
        });
      } catch {
        setError(t("analysis.error"));
      } finally {
        setLoading(false);
      }
    },
    [update, t]
  );

  useEffect(() => {
    if (c && !state.analysis && !loading) void runAnalysis(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c]);

  const analysis = state.analysis;

  const display = useMemo(() => {
    if (!analysis) return null;
    const reqById = new Map(analysis.original_requests.map((r) => [r.id, r]));
    const actById = new Map(analysis.response_actions.map((a) => [a.id, a]));
    const items = analysis.coverage.map((cov) => ({
      cov: toDisplayCoverage(cov),
      request: reqById.get(cov.request_id)!,
      actions: cov.response_evidence_ids
        .map((id) => actById.get(id))
        .filter(Boolean) as NonNullable<ReturnType<typeof actById.get>>[],
    }));
    const tally = { addressed: 0, partial: 0, not_addressed: 0, unclear: 0 };
    for (const it of items) tally[it.cov.displayStatus] += 1;
    return { items, tally };
  }, [analysis]);

  if (!ready || !c) return <CaseGuard ready={ready} hasCase={!!c} />;

  if (loading || !analysis) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold">{t("analysis.title")}</h1>
        {error ? (
          <div className="card space-y-3">
            <p className="text-status-missing">{error}</p>
            <button className="btn-primary" onClick={() => runAnalysis(c)}>
              {t("analysis.tryAgain")}
            </button>
          </div>
        ) : (
          <div className="card flex items-center gap-3" role="status" aria-live="polite">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden="true" />
            <p className="text-ink-soft">{t("analysis.checking")}</p>
          </div>
        )}
      </div>
    );
  }

  const summaryText =
    lang === "hi" ? analysis.summary.plain_language_hi : analysis.summary.plain_language;

  const allAddressed = display!.items.every(
    (i) => i.cov.displayStatus === "addressed"
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold text-ink">{t("analysis.title")}</h1>
        <SourceBadge source={state.analysisSource} />
      </div>

      {state.fallbackReason && (
        <div
          role="note"
          className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {state.fallbackReason}
        </div>
      )}

      <section
        className={`card space-y-2 border-l-4 ${
          allAddressed ? "border-l-status-ok" : "border-l-status-partial"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">
            {allAddressed ? t("analysis.headAddressed") : t("analysis.headPartial")}
          </h2>
          <ReadAloud text={summaryText} />
        </div>
        <p className="leading-relaxed text-ink-soft">{summaryText}</p>
      </section>

      <div className="space-y-3">
        {display!.items.map((it, i) => (
          <ComparisonCard
            key={it.request.id}
            index={i + 1}
            coverage={it.cov}
            request={it.request}
            actions={it.actions}
            responseText={c.response.text}
            grievanceText={c.grievance.text}
          />
        ))}
      </div>

      <Tally tally={display!.tally} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={`/case/${c.id}/next-step`} className="btn-primary">
          {t("next.question")} →
        </Link>
        <Link href={`/case/${c.id}`} className="btn-ghost">
          ← {t("common.back")}
        </Link>
      </div>
    </div>
  );
}

function SourceBadge({ source }: { source?: AnalysisSource }) {
  const { t } = useLang();
  if (!source) return null;
  const map = {
    live: { cls: "bg-status-okSoft text-status-ok", icon: "🟢", label: t("common.live") },
    cached: { cls: "bg-surface-sunken text-ink-soft", icon: "💾", label: t("common.cached") },
    offline: { cls: "bg-gov-saffronSoft text-gov-saffron", icon: "🧮", label: t("common.offline") },
  } as const;
  const m = map[source];
  return (
    <span className={`pill text-sm ${m.cls}`}>
      <span aria-hidden="true">{m.icon}</span>
      {m.label}
    </span>
  );
}

function Tally({
  tally,
}: {
  tally: { addressed: number; partial: number; not_addressed: number; unclear: number };
}) {
  const { t } = useLang();
  const parts: string[] = [];
  if (tally.addressed) parts.push(`${tally.addressed} ${t("status.addressed").toLowerCase()}`);
  if (tally.partial) parts.push(`${tally.partial} ${t("status.partial").toLowerCase()}`);
  if (tally.not_addressed) parts.push(`${tally.not_addressed} ${t("status.not_addressed").toLowerCase()}`);
  if (tally.unclear) parts.push(`${tally.unclear} ${t("status.unclear").toLowerCase()}`);
  return (
    <div className="rounded-xl bg-surface-sunken px-4 py-3 text-center text-sm font-semibold text-ink">
      {parts.join(" · ")}
    </div>
  );
}
