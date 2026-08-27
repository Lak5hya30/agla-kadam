"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import { useJourney } from "@/components/JourneyProvider";
import { ReadAloud } from "@/components/ReadAloud";
import { getCase } from "@/lib/caseData";
import { decideNextAction } from "@/lib/policyEngine";
import type { CaseContext } from "@/lib/types";

export default function NextStepPage({ params }: { params: { id: string } }) {
  const { t } = useLang();
  const router = useRouter();
  const { state, update } = useJourney();
  const c = getCase(params.id);
  const [choice, setChoice] = useState<"resolved" | "unresolved" | null>(
    state.resolvedChoice ?? null
  );

  const ctx: CaseContext | null = useMemo(() => {
    if (!c) return null;
    return {
      ...c.caseContext,
      feedback: state.feedbackRating ?? c.caseContext.feedback,
    };
  }, [c, state.feedbackRating]);

  if (!c || !ctx) return null;

  const decision = decideNextAction(ctx);

  function pick(v: "resolved" | "unresolved") {
    setChoice(v);
    update({ resolvedChoice: v });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink">{t("next.question")}</h1>
        <ReadAloud text={t("next.question")} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => pick("resolved")}
          aria-pressed={choice === "resolved"}
          className={`card text-left transition-colors ${
            choice === "resolved" ? "ring-2 ring-status-ok" : ""
          }`}
        >
          <span className="text-2xl" aria-hidden="true">🟢</span>
          <p className="mt-1 font-bold text-ink">{t("next.yes")}</p>
        </button>
        <button
          type="button"
          onClick={() => pick("unresolved")}
          aria-pressed={choice === "unresolved"}
          className={`card text-left transition-colors ${
            choice === "unresolved" ? "ring-2 ring-status-partial" : ""
          }`}
        >
          <span className="text-2xl" aria-hidden="true">🟠</span>
          <p className="mt-1 font-bold text-ink">{t("next.no")}</p>
        </button>
      </div>

      {choice === "resolved" && (
        <section className="card space-y-2 border-l-4 border-l-status-ok">
          <h2 className="text-lg font-bold text-status-ok">
            {t("next.resolvedTitle")}
          </h2>
          <p className="text-ink-soft">{t("next.resolvedBody")}</p>
          <Link href="/demo" className="btn-ghost mt-2 w-fit">
            {t("common.back")} →
          </Link>
        </section>
      )}

      {choice === "unresolved" && (
        <section className="space-y-4">
          <div className="card space-y-3">
            <h2 className="text-lg font-bold text-ink">{t("next.whatNext")}</h2>
            <p className="text-sm text-ink-soft">{decision.explanation}</p>

            <ul className="space-y-1.5">
              {decision.checks.map((chk, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span
                    aria-hidden="true"
                    className={chk.met ? "text-status-ok" : "text-ink-faint"}
                  >
                    {chk.met ? "✓" : "○"}
                  </span>
                  <span className={chk.met ? "text-ink" : "text-ink-faint"}>
                    {chk.label}
                  </span>
                </li>
              ))}
            </ul>

            {decision.alternatives && (
              <div className="rounded-xl bg-surface-soft p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  {t("next.seeOptions")}
                </p>
                <ul className="mt-1 space-y-1 text-sm text-ink">
                  {decision.alternatives.map((alt) => (
                    <li key={alt}>• {alt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <p className="flex items-start gap-2 rounded-lg bg-accent-soft px-3 py-2 text-xs text-accent">
            <span aria-hidden="true">🔒</span>
            {t("next.aiNote")}
          </p>

          <NextActionCTA
            action={decision.action}
            caseId={c.id}
            onFeedback={() => router.push(`/case/${c.id}/feedback`)}
          />
        </section>
      )}
    </div>
  );
}

function NextActionCTA({
  action,
  caseId,
  onFeedback,
}: {
  action: string;
  caseId: string;
  onFeedback: () => void;
}) {
  const { t } = useLang();
  if (action === "GIVE_FEEDBACK") {
    return (
      <button className="btn-primary" onClick={onFeedback}>
        {t("next.giveFeedback")} →
      </button>
    );
  }
  if (action === "APPEAL_AVAILABLE") {
    // Reached if feedback already recorded as poor.
    return (
      <Link href={`/case/${caseId}/appeal`} className="btn-primary">
        {t("appeal.title")} →
      </Link>
    );
  }
  // ALTERNATIVE_GUIDANCE / MANUAL_REVIEW_REQUIRED — no automated appeal.
  return (
    <Link href="/demo" className="btn-ghost w-fit">
      ← {t("common.back")}
    </Link>
  );
}
