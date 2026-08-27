"use client";

import Link from "next/link";
import { useLang } from "./LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function SiteHeader() {
  const { t } = useLang();
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-surface/90 backdrop-blur">
      {/* Slim civic-service accent strip — a broad government-portal pattern,
          not CPGRAMS branding. */}
      <div
        aria-hidden="true"
        className="h-1 w-full bg-gradient-to-r from-accent via-accent to-status-ok"
      />
      <div className="container-page flex items-center justify-between gap-3 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label={t("app.name")}>
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-bold text-white"
          >
            अ
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold text-ink">{t("app.name")}</span>
            <span className="hidden text-xs text-ink-faint sm:block">
              {t("app.subtitle")}
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/how" className="hidden text-sm font-semibold text-accent hover:underline sm:inline">
            {t("home.how")}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
