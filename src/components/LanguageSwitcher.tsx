"use client";

import { useLang } from "./LanguageProvider";
import { LANGS } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div
      className="inline-flex shrink-0 overflow-hidden rounded-lg border border-black/10 bg-surface text-sm"
      role="group"
      aria-label="Language"
    >
      {LANGS.map((l, i) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={`min-h-[40px] min-w-10 px-2 font-semibold transition-colors sm:px-3 ${
            lang === l.code
              ? "bg-accent text-white"
              : "text-ink-soft hover:bg-surface-sunken"
          } ${i > 0 ? "border-l border-black/10" : ""}`}
        >
          <span className="sm:hidden">{l.code === "en" ? "EN" : "हिं"}</span>
          <span className="hidden sm:inline">{l.label}</span>
        </button>
      ))}
    </div>
  );
}
