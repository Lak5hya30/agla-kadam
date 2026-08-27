"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

export default function RedressProcessPage() {
  const { lang } = useLang();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const steps = [
    {
      en: "Lodge a grievance",
      hi: "शिकायत दर्ज करें",
      enBody: "A citizen files a grievance against a public service.",
      hiBody: "नागरिक किसी सार्वजनिक सेवा के विरुद्ध शिकायत दर्ज करता है।",
    },
    {
      en: "Automated routing",
      hi: "स्वचालित रूटिंग",
      enBody: "The grievance is routed to the concerned authority for redress.",
      hiBody: "शिकायत निवारण के लिए संबंधित प्राधिकरण को भेजी जाती है।",
    },
    {
      en: "Redress & disposal",
      hi: "निवारण एवं निपटान",
      enBody: "The authority examines the matter and marks the grievance disposed.",
      hiBody: "प्राधिकरण मामले की जाँच करता है और शिकायत को निपटाया हुआ चिह्नित करता है।",
    },
    {
      en: "Understand the outcome  ← Agla Kadam",
      hi: "नतीजा समझें  ← अगला कदम",
      enBody:
        "This is where Agla Kadam helps: compare the request with the response, see what was actually addressed, and decide the next step — feedback or appeal.",
      hiBody:
        "यहीं अगला कदम मदद करता है: माँग की जवाब से तुलना करें, देखें कि असल में क्या हुआ, और अगला कदम तय करें — प्रतिक्रिया या अपील।",
      highlight: true,
    },
  ];

  return (
    <div className="container-page space-y-6 py-6">
      <div>
        <h1 className="section-title">{L("Redress Process", "निवारण प्रक्रिया")}</h1>
        <p className="mt-3 text-sm text-ink-soft">
          {L(
            "A simplified view of the grievance redress journey, showing where this demo companion adds value.",
            "शिकायत निवारण यात्रा का एक सरल दृश्य, जो दिखाता है कि यह डेमो साथी कहाँ मदद करता है।"
          )}
        </p>
      </div>

      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li
            key={s.en}
            className={`card flex gap-3 ${s.highlight ? "border-l-4 border-l-gov-saffron" : ""}`}
          >
            <span
              aria-hidden="true"
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${
                s.highlight ? "bg-gov-saffron text-white" : "bg-gov-maroonSoft text-gov-maroon"
              }`}
            >
              {i + 1}
            </span>
            <div>
              <p className="font-bold text-ink">{L(s.en, s.hi)}</p>
              <p className="text-sm text-ink-soft">{L(s.enBody, s.hiBody)}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/demo" className="btn-primary">
          {L("Try the demo", "डेमो आज़माएँ")} →
        </Link>
        <Link href="/how" className="btn-ghost">
          {L("What’s real vs mocked", "क्या असली, क्या मॉक")}
        </Link>
      </div>
    </div>
  );
}
