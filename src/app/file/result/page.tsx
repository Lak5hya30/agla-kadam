"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { ComparisonCard } from "@/components/ComparisonCard";
import { ReadAloud } from "@/components/ReadAloud";
import { toDisplayCoverage, type ResolutionAnalysis } from "@/lib/schema";
import { decideNextAction } from "@/lib/policyEngine";
import type { AnalysisSource } from "@/lib/analyze";
import { FILING_KEY } from "../page";

interface Filing {
  category: string;
  jurisdiction: "central" | "state" | "ut";
  subject: string;
  grievance: string;
  response: string;
}

export default function FileResultPage() {
  const { t, lang } = useLang();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const [filing, setFiling] = useState<Filing | null>(null);
  const [analysis, setAnalysis] = useState<ResolutionAnalysis | null>(null);
  const [source, setSource] = useState<AnalysisSource | null>(null);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(FILING_KEY);
      if (raw) setFiling(JSON.parse(raw));
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const run = useCallback(async (f: Filing) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-resolution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grievance: f.grievance, response: f.response }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "failed");
      setAnalysis(data.analysis);
      setSource(data.source);
      setFallbackReason(data.fallbackReason ?? null);
    } catch (e: any) {
      setError(e?.message ?? "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filing) void run(filing);
  }, [filing, run]);

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

  if (!filing) {
    return (
      <div className="container-page space-y-3 py-6">
        <div className="card space-y-3">
          <p className="text-ink-soft">
            {L("No grievance to analyse yet.", "अभी विश्लेषण के लिए कोई शिकायत नहीं है।")}
          </p>
          <Link href="/file" className="btn-primary w-fit">
            {L("Lodge a grievance", "शिकायत दर्ज करें")} →
          </Link>
        </div>
      </div>
    );
  }

  const decision = decideNextAction({
    jurisdiction: filing.jurisdiction,
    status: "disposed",
    feedback: "none",
  });

  const summaryText = analysis
    ? lang === "hi"
      ? analysis.summary.plain_language_hi
      : analysis.summary.plain_language
    : "";

  return (
    <div className="container-page space-y-5 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="section-title">{t("analysis.title")}</h1>
        {source && <SourceBadge source={source} />}
      </div>

      {filing.subject && (
        <p className="text-sm text-ink-faint">
          {L("Subject", "विषय")}: <span className="text-ink">{filing.subject}</span> ·{" "}
          {filing.category}
        </p>
      )}

      {loading && (
        <div className="card flex items-center gap-3" role="status" aria-live="polite">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden="true" />
          <p className="text-ink-soft">{t("analysis.checking")}</p>
        </div>
      )}

      {error && (
        <div className="card space-y-3">
          <p className="text-status-missing">{error}</p>
          <button className="btn-primary w-fit" onClick={() => run(filing)}>
            {L("Try again", "फिर कोशिश करें")}
          </button>
        </div>
      )}

      {fallbackReason && (
        <div role="note" className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {fallbackReason}
        </div>
      )}

      {analysis && display && (
        <>
          <section className="card space-y-2 border-l-4 border-l-gov-saffron">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-ink">{L("Summary", "सारांश")}</h2>
              <ReadAloud text={summaryText} />
            </div>
            <p className="leading-relaxed text-ink-soft">{summaryText}</p>
          </section>

          <div className="space-y-3">
            {display.items.map((it, i) => (
              <ComparisonCard
                key={it.request.id}
                index={i + 1}
                coverage={it.cov}
                request={it.request}
                actions={it.actions}
                responseText={filing.response || L("(no response provided)", "(कोई जवाब नहीं दिया गया)")}
                grievanceText={filing.grievance}
              />
            ))}
          </div>

          <Tally tally={display.tally} />

          {/* Deterministic next step from the policy engine */}
          <section className="card space-y-3">
            <h2 className="text-lg font-bold text-ink">{t("next.whatNext")}</h2>
            <p className="text-sm text-ink-soft">{decision.explanation}</p>
            <ul className="space-y-1.5">
              {decision.checks.map((chk, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span aria-hidden="true" className={chk.met ? "text-status-ok" : "text-ink-faint"}>
                    {chk.met ? "✓" : "○"}
                  </span>
                  <span className={chk.met ? "text-ink" : "text-ink-faint"}>{chk.label}</span>
                </li>
              ))}
            </ul>
            <p className="rounded-lg bg-accent-soft px-3 py-2 text-xs text-accent">
              🔒 {t("next.aiNote")}
            </p>
          </section>

          <div className="rounded-xl border border-dashed border-black/15 bg-surface-soft p-3 text-sm text-ink-soft">
            {L(
              "This is a quick check of your own text. For the full feedback → appeal → tracking journey, try a curated demo case.",
              "यह आपके अपने पाठ की त्वरित जाँच है। पूरी प्रतिक्रिया → अपील → ट्रैकिंग यात्रा के लिए, एक तैयार डेमो केस आज़माएँ।"
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/file" className="btn-ghost">
              ← {L("Edit grievance", "शिकायत संपादित करें")}
            </Link>
            <Link href="/demo" className="btn-secondary">
              {L("Try a curated demo case", "तैयार डेमो केस आज़माएँ")} →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function SourceBadge({ source }: { source: AnalysisSource }) {
  const { t } = useLang();
  const map = {
    live: { cls: "bg-status-okSoft text-status-ok", icon: "🟢", label: t("common.live") },
    cached: { cls: "bg-surface-sunken text-ink-soft", icon: "💾", label: t("common.cached") },
    offline: { cls: "bg-gov-saffronSoft text-gov-saffron", icon: "🧮", label: "Offline comparison" },
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
