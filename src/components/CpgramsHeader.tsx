"use client";

/**
 * CPGRAMS-style header: top utility bar + bilingual masthead + maroon
 * primary navigation. A close visual replica for the demo shell, paired
 * with the persistent DemoRibbon and a neutral placeholder seal so it is
 * never mistaken for the official service.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLang } from "./LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { GovSeal } from "./GovSeal";

const UTILITY_LINKS = [
  { href: "/", en: "Home", hi: "होम" },
  { href: "/how", en: "About Demo", hi: "डेमो के बारे में" },
  { href: "/how", en: "FAQs/Help", hi: "सहायता" },
  { href: "/how", en: "What’s Real?", hi: "क्या असली है?" },
];

const NAV = [
  { href: "/demo", en: "View Status", hi: "स्थिति देखें", primary: false },
  { href: "/redress-process", en: "Redress Process", hi: "निवारण प्रक्रिया", primary: false },
  { href: "/file", en: "Lodge Grievance", hi: "शिकायत दर्ज करें", primary: false },
  { href: "/demo", en: "Check Resolution", hi: "समाधान जाँचें", primary: true },
];

export function CpgramsHeader() {
  const { lang } = useLang();
  const pathname = usePathname();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  return (
    <header className="sticky top-0 z-20 shadow-sm">
      {/* Top utility bar */}
      <div className="border-b border-black/5 bg-surface-soft text-ink-soft">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1 text-[11px] sm:text-xs">
          <span className="font-medium">
            {L("Government-service grievance companion", "सरकारी सेवा शिकायत साथी")}{" "}
            <span className="text-ink-faint">· {L("Demo", "डेमो")}</span>
          </span>
          <nav aria-label="Utility" className="flex items-center gap-1">
            {UTILITY_LINKS.map((l, i) => (
              <span key={l.en} className="flex items-center gap-1">
                {i > 0 && <span className="text-ink-faint">|</span>}
                <Link href={l.href} className="hover:text-accent hover:underline">
                  {L(l.en, l.hi)}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>

      {/* Masthead */}
      <div className="bg-surface">
        <div className="container-page flex items-center justify-between gap-3 py-2.5">
          <Link href="/" className="flex items-center gap-3" aria-label="Agla Kadam home">
            <GovSeal className="h-12 w-12 shrink-0" />
            <span className="leading-tight">
              <span className="block text-[11px] font-semibold text-gov-maroon sm:text-xs">
                {L("Grievance Resolution Companion", "शिकायत समाधान साथी")}
              </span>
              <span className="block text-base font-extrabold uppercase tracking-tight text-gov-maroon sm:text-lg">
                Agla Kadam
              </span>
              <span className="block text-[10px] text-ink-faint sm:text-[11px]">
                {L("Understand the response · Know your next step", "जवाब समझें · अगला कदम जानें")}
              </span>
            </span>
          </Link>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-gov-maroon px-3 py-1 text-lg font-extrabold tracking-wide text-white">
                CPGRAMS
              </span>
            </div>
            <span className="hidden max-w-[16rem] text-right text-[10px] leading-tight text-ink-faint sm:block">
              {L(
                "Companion for Centralized Public Grievance responses",
                "सार्वजनिक शिकायत के जवाबों के लिए साथी"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Maroon primary navigation */}
      <nav className="bg-gov-maroon" aria-label="Primary">
        <div className="container-page flex items-stretch justify-between">
          <div className="flex items-stretch overflow-x-auto">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href) && item.href !== "/";
              return (
                <Link
                  key={item.en}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`nav-link whitespace-nowrap border-b-[3px] ${
                    item.primary ? "bg-gov-saffron text-white hover:bg-gov-saffron" : ""
                  } ${
                    active
                      ? "border-gov-saffron bg-gov-maroonDark text-white"
                      : "border-transparent"
                  }`}
                >
                  {item.primary && <span aria-hidden="true">🔎</span>}
                  {L(item.en, item.hi)}
                </Link>
              );
            })}
          </div>
          <div className="hidden items-center pr-1 sm:flex">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>
      <div className="container-page flex justify-end py-1 sm:hidden">
        <LanguageSwitcher />
      </div>
    </header>
  );
}
