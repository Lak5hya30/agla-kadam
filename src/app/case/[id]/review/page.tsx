"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import { useJourney } from "@/components/JourneyProvider";
import { useResolvedCase } from "@/lib/useCase";
import { CaseGuard } from "@/components/CaseGuard";
import type { MockAppealStage } from "@/lib/types";

const CHECK_KEYS = ["verify.c1", "verify.c2", "verify.c3", "verify.c4", "verify.c5"];

export default function ReviewPage({ params }: { params: { id: string } }) {
  const { t } = useLang();
  const router = useRouter();
  const { state, update } = useJourney();
  const { demoCase: c, ready } = useResolvedCase(params.id);

  const [checks, setChecks] = useState<boolean[]>(Array(CHECK_KEYS.length).fill(false));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready || !c) return <CaseGuard ready={ready} hasCase={!!c} />;

  const allChecked = checks.every(Boolean);
  const appealText = state.appealText ?? "";

  async function submit() {
    if (!allChecked || !c) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/mock/appeals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: c.id, confirmed: true, appealText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "failed");
      update({
        appealId: data.appealId,
        appealStage: data.stage as MockAppealStage,
        appealHistory: data.history,
      });
      router.push(`/case/${c.id}/success`);
    } catch {
      // Reliable client fallback so the demo never dead-ends.
      const year = new Date().getFullYear();
      const seq = String(40 + Math.floor((Date.now() % 900) + 2)).padStart(4, "0");
      const appealId = `AGLA-DEMO-${year}-${seq}`;
      const at = new Date().toISOString();
      update({
        appealId,
        appealStage: "submitted",
        appealHistory: [{ stage: "submitted", at }],
      });
      router.push(`/case/${c.id}/success`);
    } finally {
      setSubmitting(false);
    }
  }

  if (!appealText) {
    return (
      <div className="card space-y-3">
        <p className="text-ink-soft">{t("guard.appealFirst")}</p>
        <Link href={`/case/${c.id}/appeal`} className="btn-primary w-fit">
          {t("appeal.title")} →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-ink">{t("verify.title")}</h1>

      <section className="card">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {t("appeal.draftTitle")}
        </p>
        <p className="max-h-48 overflow-y-auto whitespace-pre-line rounded-xl bg-surface-soft p-3 text-sm text-ink">
          {appealText}
        </p>
      </section>

      <fieldset className="card space-y-2">
        <legend className="sr-only">{t("verify.title")}</legend>
        {CHECK_KEYS.map((key, i) => (
          <label
            key={key}
            className="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-surface-soft"
          >
            <input
              type="checkbox"
              checked={checks[i]}
              onChange={() =>
                setChecks((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
              }
              className="mt-1 h-5 w-5 accent-accent"
            />
            <span className="text-sm text-ink">{t(key)}</span>
          </label>
        ))}
      </fieldset>

      {error && <p className="text-sm text-status-missing">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          onClick={submit}
          disabled={!allChecked || submitting}
        >
          {submitting ? "…" : t("verify.submit")} →
        </button>
        <Link href={`/case/${c.id}/appeal`} className="btn-ghost">
          ← {t("common.back")}
        </Link>
      </div>
    </div>
  );
}
