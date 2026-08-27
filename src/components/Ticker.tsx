"use client";

import { useLang } from "./LanguageProvider";

export function Ticker() {
  const { lang } = useLang();
  const text =
    lang === "hi"
      ? "सूचना: यह एक डेमो है। यहाँ असली शिकायत आईडी, आधार, पैन या पासवर्ड न भरें। सभी केस काल्पनिक हैं।"
      : "Notice: This is a demo. Do not enter real grievance IDs, Aadhaar, PAN or passwords here. All cases are synthetic.";
  return (
    <div className="overflow-hidden bg-gov-maroonDark text-white">
      <div className="container-page py-1.5">
        <p className="ticker-track text-xs font-semibold sm:text-sm" aria-live="off">
          <span aria-hidden="true">📢 </span>
          {text}
        </p>
      </div>
    </div>
  );
}
