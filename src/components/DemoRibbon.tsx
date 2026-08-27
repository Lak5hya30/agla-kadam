"use client";

import { useLang } from "./LanguageProvider";

/**
 * Persistent DEMO ribbon. This is what keeps a close visual replica a
 * *labelled prototype* rather than an impersonation of the real service.
 * It is always visible at the very top of every page.
 */
export function DemoRibbon() {
  const { lang } = useLang();
  const text =
    lang === "hi"
      ? "डेमो / प्रोटोटाइप — यह हैकाथॉन डेमो है, असली CPGRAMS या भारत सरकार की वेबसाइट नहीं। केवल काल्पनिक डेटा।"
      : "DEMO / PROTOTYPE — a hackathon demo, NOT the official CPGRAMS or Government of India website. Synthetic data only.";
  return (
    <div className="bg-amber-300 text-amber-950">
      <div className="container-page flex items-center justify-center gap-2 py-1 text-center text-[11px] font-bold leading-tight sm:text-xs">
        <span aria-hidden="true">⚠️</span>
        <span>{text}</span>
      </div>
    </div>
  );
}
