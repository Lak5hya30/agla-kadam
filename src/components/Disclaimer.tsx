"use client";

import { useLang } from "./LanguageProvider";

/** Prominent, always-visible synthetic-data disclaimer (§4, §30). */
export function Disclaimer({ compact = false }: { compact?: boolean }) {
  const { t } = useLang();
  return (
    <div
      role="note"
      className={`flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 text-amber-900 ${
        compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
      }`}
    >
      <span aria-hidden="true" className="mt-0.5">
        ⚠️
      </span>
      <p>{t("app.disclaimer")}</p>
    </div>
  );
}

/** Inline privacy warning near case interaction (§31). */
export function PrivacyWarning() {
  const { t } = useLang();
  return (
    <p className="flex items-start gap-2 rounded-lg bg-surface-sunken px-3 py-2 text-xs text-ink-soft">
      <span aria-hidden="true">🔒</span>
      {t("common.privacyWarn")}
    </p>
  );
}
