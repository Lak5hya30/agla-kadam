"use client";

import { useLang } from "./LanguageProvider";
import { LANGS } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div
      className="inline-flex overflow-hidden rounded-lg border border-black/10 bg-surface text-sm"
      role="group"
      aria-label="Language"
    >
      {LANGS.map((l, i) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={`min-h-[40px] px-3 font-semibold transition-colors ${
            lang === l.code
              ? "bg-accent text-white"
              : "text-ink-soft hover:bg-surface-sunken"
          } ${i > 0 ? "border-l border-black/10" : ""}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
