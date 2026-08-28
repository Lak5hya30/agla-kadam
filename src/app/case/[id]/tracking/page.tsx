"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { useJourney } from "@/components/JourneyProvider";
import { useResolvedCase } from "@/lib/useCase";
import { CaseGuard } from "@/components/CaseGuard";
import type { MockAppealStage } from "@/lib/types";

const STAGES: { stage: MockAppealStage; key: string }[] = [
  { stage: "submitted", key: "track.submitted" },
  { stage: "under_review", key: "track.review" },
  { stage: "decision", key: "track.decision" },
];

export default function TrackingPage({ params }: { params: { id: string } }) {
  const { t } = useLang();
  const { state, update } = useJourney();
  const { demoCase: c, ready } = useResolvedCase(params.id);
  const [busy, setBusy] = useState(false);

  if (!ready || !c) return <CaseGuard ready={ready} hasCase={!!c} />;

  if (!state.appealId) {
    return (
      <div className="card space-y-3">
        <p className="text-ink-soft">{t("guard.noTracking")}</p>
        <Link href={`/case/${c.id}/appeal`} className="btn-primary w-fit">
          {t("appeal.title")} →
        </Link>
      </div>
    );
  }

  const currentStage = state.appealStage ?? "submitted";
  const currentIdx = STAGES.findIndex((s) => s.stage === currentStage);

  async function advance() {
    setBusy(true);
    const nextIdx = Math.min(currentIdx + 1, STAGES.length - 1);
    const nextStage = STAGES[nextIdx].stage;
    // Try the mock API; fall back to local advance so the demo always moves.
    try {
      const res = await fetch(
        `/api/mock/appeals/${state.appealId}/advance`,
        { method: "POST" }
      );
      if (res.ok) {
        const data = await res.json();
        update({ appealStage: data.stage, appealHistory: data.history });
        setBusy(false);
        return;
      }
    } catch {
      /* fall through */
    }
    const at = new Date().toISOString();
    update({
      appealStage: nextStage,
      appealHistory: [
        ...(state.appealHistory ?? []),
        { stage: nextStage, at },
      ],
    });
    setBusy(false);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">{t("track.title")}</h1>
        <p className="font-mono text-sm text-ink-faint">{state.appealId}</p>
      </div>

      <ol className="card space-y-0">
        {STAGES.map((s, i) => {
          const stateName =
            i < currentIdx ? "done" : i === currentIdx ? "current" : "todo";
          return (
            <li key={s.stage} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                    stateName === "done"
                      ? "bg-status-ok text-white"
                      : stateName === "current"
                        ? "bg-accent text-white"
                        : "bg-surface-sunken text-ink-faint"
                  }`}
                >
                  {stateName === "done" ? "✓" : stateName === "current" ? "●" : "○"}
                </span>
                {i < STAGES.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`my-1 h-8 w-0.5 ${
                      i < currentIdx ? "bg-status-ok" : "bg-surface-sunken"
                    }`}
                  />
                )}
              </div>
              <div className="pb-4 pt-1">
                <p
                  className={`font-semibold ${
                    stateName === "todo" ? "text-ink-faint" : "text-ink"
                  }`}
                >
                  {t(s.key)}
                </p>
                {stateName === "current" && (
                  <p className="text-xs text-accent">{t("track.current")}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border border-dashed border-black/15 bg-surface-soft p-3">
        <p className="mb-2 text-xs text-ink-faint">{t("track.judgeNote")}</p>
        <button
          className="btn-secondary text-sm disabled:opacity-50"
          onClick={advance}
          disabled={busy || currentIdx >= STAGES.length - 1}
        >
          {t("track.advance")} →
        </button>
      </div>

      <Link href="/demo" className="btn-ghost w-fit">
        ← {t("common.back")}
      </Link>
    </div>
  );
}
