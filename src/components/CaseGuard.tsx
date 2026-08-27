"use client";

import Link from "next/link";
import { useLang } from "./LanguageProvider";

/**
 * Shown while an ad-hoc case is loading, or when a USER-DRAFT route is
 * visited with no filed grievance in this session.
 */
export function CaseGuard({ ready, hasCase }: { ready: boolean; hasCase: boolean }) {
  const { lang } = useLang();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  if (!ready) {
    return (
      <div className="card flex items-center gap-3" role="status" aria-live="polite">
        <span
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent"
          aria-hidden="true"
        />
        <p className="text-ink-soft">{L("Loading…", "लोड हो रहा है…")}</p>
      </div>
    );
  }
  if (!hasCase) {
    return (
      <div className="card space-y-3">
        <p className="text-ink-soft">
          {L(
            "No filed grievance found in this session. Please lodge one first.",
            "इस सत्र में कोई दर्ज शिकायत नहीं मिली। कृपया पहले एक दर्ज करें।"
          )}
        </p>
        <Link href="/file" className="btn-primary w-fit">
          {L("Lodge a grievance", "शिकायत दर्ज करें")} →
        </Link>
      </div>
    );
  }
  return null;
}
