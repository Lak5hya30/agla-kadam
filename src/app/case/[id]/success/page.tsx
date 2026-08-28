"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { useJourney } from "@/components/JourneyProvider";
import { useResolvedCase } from "@/lib/useCase";
import { CaseGuard } from "@/components/CaseGuard";

export default function SuccessPage({ params }: { params: { id: string } }) {
  const { t } = useLang();
  const { state } = useJourney();
  const { demoCase: c, ready } = useResolvedCase(params.id);
  if (!ready || !c) return <CaseGuard ready={ready} hasCase={!!c} />;

  if (!state.appealId) {
    return (
      <div className="card space-y-3">
        <p className="text-ink-soft">{t("guard.noAppeal")}</p>
        <Link href={`/case/${c.id}/appeal`} className="btn-primary w-fit">
          {t("appeal.title")} →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="card space-y-3 border-l-4 border-l-status-ok text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-status-okSoft text-2xl text-status-ok">
          ✓
        </div>
        <h1 className="text-2xl font-extrabold text-ink">{t("success.title")}</h1>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("success.reference")}
          </p>
          <p className="select-all font-mono text-xl font-bold text-accent">
            {state.appealId}
          </p>
        </div>
        <p className="mx-auto max-w-sm rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {t("success.note")}
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={`/case/${c.id}/tracking`} className="btn-primary">
          {t("success.track")} →
        </Link>
        <Link href="/demo" className="btn-ghost">
          ← {t("common.back")}
        </Link>
      </div>
    </div>
  );
}
