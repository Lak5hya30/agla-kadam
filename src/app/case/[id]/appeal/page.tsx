"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import { useJourney } from "@/components/JourneyProvider";
import { useResolvedCase } from "@/lib/useCase";
import { CaseGuard } from "@/components/CaseGuard";
import { decideNextAction } from "@/lib/policyEngine";
import { unresolvedItems, composeAppeal, type ComposedAppeal } from "@/lib/appeal";
import { StatusBadge } from "@/components/StatusBadge";
import type { CoverageStatus } from "@/lib/schema";

export default function AppealPage({ params }: { params: { id: string } }) {
  const { t } = useLang();
  const router = useRouter();
  const { state, update } = useJourney();
  const { demoCase: c, ready } = useResolvedCase(params.id);

  const items = useMemo(
    () => (state.analysis ? unresolvedItems(state.analysis) : []),
    [state.analysis]
  );

  // Default-checked semantics: an item is included unless explicitly
  // unchecked. Robust against sessionStorage hydration timing (items may
  // be empty on the very first render, before the journey state loads).
  const [unchecked, setUnchecked] = useState<Record<string, boolean>>({});
  const isChecked = (id: string) => !unchecked[id];
  const [draft, setDraft] = useState<ComposedAppeal | null>(null);
  const [openSources, setOpenSources] = useState<Record<number, boolean>>({});

  if (!ready || !c) return <CaseGuard ready={ready} hasCase={!!c} />;

  // Deterministic guard: appeal must actually be available for this case.
  const ctx = {
    ...c.caseContext,
    feedback: state.feedbackRating ?? c.caseContext.feedback,
  };
  const decision = decideNextAction(ctx);

  if (!state.analysis) {
    return (
      <Guard href={`/case/${c.id}/analysis`} label={t("case.check")} />
    );
  }
  if (decision.action !== "APPEAL_AVAILABLE") {
    return (
      <div className="card space-y-3">
        <h1 className="text-xl font-bold text-ink">{decision.headline}</h1>
        <p className="text-ink-soft">{decision.explanation}</p>
        <Link href={`/case/${c.id}/next-step`} className="btn-primary w-fit">
          {t("next.whatNext")} →
        </Link>
      </div>
    );
  }

  const selectedIds = items
    .filter((i) => isChecked(i.requestId))
    .map((i) => i.requestId);

  function generate() {
    const composed = composeAppeal(state.analysis!, selectedIds);
    setDraft(composed);
    update({ selectedRequestIds: selectedIds, appealText: composed.plainText });
  }

  function onEditText(v: string) {
    setDraft((d) => (d ? { ...d, plainText: v } : d));
    update({ appealText: v });
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-ink">{t("appeal.title")}</h1>

      {!draft && (
        <>
          <p className="text-ink-soft">{t("appeal.selectPrompt")}</p>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.requestId} className="card space-y-2">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked(item.requestId)}
                    onChange={() =>
                      setUnchecked((p) => ({
                        ...p,
                        [item.requestId]: !p[item.requestId],
                      }))
                    }
                    className="mt-1 h-5 w-5 accent-accent"
                  />
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-bold text-ink">{item.requestText}</span>
                      <StatusBadge status={item.status as CoverageStatus} />
                    </span>
                  </span>
                </label>
                <dl className="ml-8 space-y-1 text-sm">
                  <div>
                    <dt className="inline text-xs font-semibold uppercase text-ink-faint">
                      Original grievance:{" "}
                    </dt>
                    <dd className="inline text-ink">“{item.requestSpan}”</dd>
                  </div>
                  <div>
                    <dt className="inline text-xs font-semibold uppercase text-ink-faint">
                      Department response:{" "}
                    </dt>
                    <dd className="inline text-ink-soft">
                      {item.responseSpans.length
                        ? `“${item.responseSpans[0]}”`
                        : t("analysis.noMatch")}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
          <button
            className="btn-primary"
            onClick={generate}
            disabled={selectedIds.length === 0}
          >
            {t("appeal.generate")} →
          </button>
        </>
      )}

      {draft && (
        <>
          <section className="card space-y-3">
            <h2 className="text-lg font-bold text-ink">{t("appeal.draftTitle")}</h2>
            <div className="space-y-3">
              {draft.paragraphs.map((p, i) => (
                <div key={i} className="rounded-xl bg-surface-soft p-3">
                  <p className="whitespace-pre-line text-sm text-ink">{p.text}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSources((o) => ({ ...o, [i]: !o[i] }))
                    }
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-status-ok"
                    aria-expanded={!!openSources[i]}
                  >
                    <span aria-hidden="true">✓</span> {t("appeal.sourceBacked")}
                  </button>
                  {openSources[i] && (
                    <p className="mt-1 rounded-lg bg-white p-2 text-xs text-ink-soft">
                      <span className="font-semibold">Source: </span>
                      {p.source}
                      {p.sourceSpan ? ` — “${p.sourceSpan}”` : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="card space-y-2">
            <label
              htmlFor="appeal-edit"
              className="text-sm font-bold text-ink"
            >
              {t("appeal.edit")}
            </label>
            <textarea
              id="appeal-edit"
              value={draft.plainText}
              onChange={(e) => onEditText(e.target.value)}
              rows={10}
              className="w-full rounded-xl border border-black/10 bg-white p-3 text-sm leading-relaxed text-ink"
            />
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/case/${c.id}/review`} className="btn-primary">
              {t("appeal.continue")} →
            </Link>
            <button className="btn-ghost" onClick={() => setDraft(null)}>
              ← {t("common.back")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Guard({ href, label }: { href: string; label: string }) {
  return (
    <div className="card space-y-3">
      <p className="text-ink-soft">Please run the resolution analysis first.</p>
      <Link href={href} className="btn-primary w-fit">
        {label} →
      </Link>
    </div>
  );
}
