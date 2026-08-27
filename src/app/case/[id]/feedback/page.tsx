"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import { useJourney } from "@/components/JourneyProvider";
import { getCase } from "@/lib/caseData";
import type { FeedbackStatus } from "@/lib/types";

const RATINGS: { value: FeedbackStatus; key: string; icon: string }[] = [
  { value: "satisfied", key: "feedback.satisfied", icon: "🟢" },
  { value: "partly", key: "feedback.partly", icon: "🟠" },
  { value: "poor", key: "feedback.poor", icon: "🔴" },
];

export default function FeedbackPage({ params }: { params: { id: string } }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const { state, update } = useJourney();
  const c = getCase(params.id);

  const suggested = useMemo(() => {
    const analysis = state.analysis;
    if (!analysis) return [];
    const reqById = new Map(analysis.original_requests.map((r) => [r.id, r]));
    return analysis.coverage
      .filter((cov) => cov.status !== "addressed")
      .map((cov) => {
        const req = reqById.get(cov.request_id);
        return { id: cov.request_id, label: cov.reason, request: req?.request ?? "" };
      });
  }, [state.analysis]);

  const [rating, setRating] = useState<FeedbackStatus>(
    state.feedbackRating ?? "poor"
  );
  // Default-checked: a suggested point is included unless explicitly
  // unchecked (robust against sessionStorage hydration timing).
  const [unchecked, setUnchecked] = useState<Record<string, boolean>>({});
  const isChecked = (id: string) => !unchecked[id];
  const [submitting, setSubmitting] = useState(false);

  if (!c) return null;

  if (!state.analysis) {
    return (
      <div className="card space-y-3">
        <p className="text-ink-soft">
          Please run the resolution analysis first.
        </p>
        <Link href={`/case/${c.id}/analysis`} className="btn-primary w-fit">
          {t("case.check")} →
        </Link>
      </div>
    );
  }

  function toggle(id: string) {
    setUnchecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function submit() {
    setSubmitting(true);
    const unresolvedPoints = suggested
      .filter((s) => isChecked(s.id))
      .map((s) => s.label);
    const selectedRequestIds = suggested
      .filter((s) => isChecked(s.id))
      .map((s) => s.id);

    try {
      await fetch("/api/mock/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: c!.id, rating, unresolvedPoints }),
      });
    } catch {
      /* mock — proceed even if the request hiccups */
    }
    update({ feedbackRating: rating, unresolvedPoints, selectedRequestIds });
    if (rating === "satisfied") {
      update({ resolvedChoice: "resolved" });
      router.push(`/case/${c!.id}/next-step`);
    } else {
      router.push(`/case/${c!.id}/next-step`);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-ink">{t("feedback.title")}</h1>

      <div
        role="radiogroup"
        aria-label={t("feedback.title")}
        className="grid gap-2 sm:grid-cols-3"
      >
        {RATINGS.map((r) => (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={rating === r.value}
            onClick={() => setRating(r.value)}
            className={`card text-left transition-colors ${
              rating === r.value ? "ring-2 ring-accent" : ""
            }`}
          >
            <span className="text-2xl" aria-hidden="true">{r.icon}</span>
            <p className="mt-1 font-bold text-ink">{t(r.key)}</p>
          </button>
        ))}
      </div>

      {rating !== "satisfied" && suggested.length > 0 && (
        <section className="card space-y-3">
          <h2 className="text-lg font-bold text-ink">{t("feedback.unresolved")}</h2>
          <p className="text-xs text-ink-faint">
            {lang === "hi"
              ? "ये बिंदु विश्लेषण से पहले से भरे गए हैं। आप बदल सकते हैं।"
              : "Pre-filled from the analysis. You can edit these."}
          </p>
          <ul className="space-y-2">
            {suggested.map((s) => (
              <li key={s.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-surface-soft p-3">
                  <input
                    type="checkbox"
                    checked={isChecked(s.id)}
                    onChange={() => toggle(s.id)}
                    className="mt-1 h-5 w-5 accent-accent"
                  />
                  <span className="text-sm text-ink">{s.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="btn-primary" onClick={submit} disabled={submitting}>
          {submitting ? "…" : t("feedback.submit")} →
        </button>
        <Link href={`/case/${c.id}/next-step`} className="btn-ghost">
          ← {t("common.back")}
        </Link>
      </div>
    </div>
  );
}
