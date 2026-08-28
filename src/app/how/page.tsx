"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { Disclaimer } from "@/components/Disclaimer";

function LiveAiStatus() {
  const { lang } = useLang();
  const [status, setStatus] = useState<null | { liveAiConfigured: boolean; model: string | null }>(null);
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ liveAiConfigured: false, model: null }));
  }, []);
  if (!status) return null;
  const on = status.liveAiConfigured;
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);
  return (
    <div
      role="note"
      className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
        on
          ? "border-status-ok/30 bg-status-okSoft text-status-ok"
          : "border-gov-saffron/30 bg-gov-saffronSoft text-gov-saffron"
      }`}
    >
      <span aria-hidden="true">{on ? "🟢" : "🧪"}</span>
      <p>
        <strong>
          {on
            ? L("Live OpenAI analysis: enabled", "लाइव OpenAI विश्लेषण: सक्षम")
            : L("Demo mode — no live API key needed", "डेमो मोड — किसी लाइव API कुंजी की ज़रूरत नहीं")}
        </strong>
        {" — "}
        {on
          ? L(
              `Analyses on this deployment use the ${status.model} model.`,
              `इस परिनियोजन पर विश्लेषण ${status.model} मॉडल से होते हैं।`
            )
          : L(
              "The synthetic cases show prepared analyses and your own text uses an offline comparison, so the demo works anywhere. The same pipeline calls OpenAI live when a key is configured.",
              "काल्पनिक केस तैयार विश्लेषण दिखाते हैं और आपका अपना पाठ ऑफ़लाइन तुलना का उपयोग करता है, इसलिए यह डेमो कहीं भी चलता है। कुंजी होने पर वही पाइपलाइन OpenAI को लाइव कॉल करती है।"
            )}
      </p>
    </div>
  );
}

type Status = "Real" | "Mock" | "Not used" | "Synthetic";

const STATUS_META: Record<Status, { cls: string; en: string; hi: string }> = {
  Real: { cls: "bg-status-okSoft text-status-ok", en: "Real", hi: "असली" },
  Mock: { cls: "bg-status-partialSoft text-status-partial", en: "Mock", hi: "मॉक" },
  "Not used": { cls: "bg-status-unclearSoft text-ink-soft", en: "Not used", hi: "उपयोग नहीं" },
  Synthetic: { cls: "bg-accent-soft text-accent", en: "Synthetic", hi: "काल्पनिक" },
};

const ROWS: { en: string; hi: string; status: Status }[] = [
  { en: "Citizen UI", hi: "नागरिक UI", status: "Real" },
  { en: "OpenAI grievance-response comparison (needs API key)", hi: "OpenAI शिकायत-जवाब तुलना (API कुंजी चाहिए)", status: "Real" },
  { en: "User grievance filing form", hi: "उपयोगकर्ता शिकायत फॉर्म", status: "Real" },
  { en: "Offline comparison (when no API key)", hi: "ऑफ़लाइन तुलना (जब कोई API कुंजी न हो)", status: "Real" },
  { en: "Request extraction", hi: "शिकायत से अलग-अलग माँगें पहचानना", status: "Real" },
  { en: "Evidence highlighting", hi: "जवाब में संबंधित अंश दिखाना", status: "Real" },
  { en: "Hindi explanation", hi: "सरल हिन्दी में समझाना", status: "Real" },
  { en: "Deterministic policy engine", hi: "तय नियमों से अगला कदम चुनना", status: "Real" },
  { en: "Feedback submission", hi: "प्रतिक्रिया जमा करना", status: "Mock" },
  { en: "Appeal submission", hi: "अपील जमा करना", status: "Mock" },
  { en: "Appeal tracking", hi: "अपील की स्थिति देखना", status: "Mock" },
  { en: "Demo sign-in (display name only)", hi: "डेमो साइन-इन (केवल प्रदर्शित नाम)", status: "Mock" },
  { en: "Real CPGRAMS login / passwords / OTP", hi: "असली CPGRAMS लॉगिन / पासवर्ड / OTP", status: "Not used" },
  { en: "Government API integration", hi: "सरकारी API एकीकरण", status: "Not used" },
  { en: "Citizen data", hi: "नागरिक डेटा", status: "Synthetic" },
];

const HOW_STEPS = [
  { icon: "🧠", en: "OpenAI", hi: "OpenAI", enBody: "Understands and compares the two documents — extracts requests, actions, and evidence.", hiBody: "शिकायत और जवाब को समझकर अलग-अलग माँगें, विभाग की कार्रवाई और उनसे जुड़े अंश पहचानता है।" },
  { icon: "⚖️", en: "Rules engine", hi: "नियमों की जाँच", enBody: "Deterministic code decides workflow: feedback, appeal availability, jurisdiction.", hiBody: "तय नियम देखकर बताता है कि प्रतिक्रिया देनी है, अपील उपलब्ध है या मामला किसी और विभाग का है।" },
  { icon: "🙋", en: "You", hi: "आप", enBody: "Review every finding and confirm before anything is submitted.", hiBody: "हर निष्कर्ष की समीक्षा करें और कुछ भी भेजने से पहले पुष्टि करें।" },
  { icon: "📮", en: "Mock adapter", hi: "डेमो व्यवस्था", enBody: "Simulates the government action and issues a demo reference number.", hiBody: "सरकारी प्रणाली जैसी प्रक्रिया दिखाती है और केवल डेमो के लिए एक संदर्भ संख्या देती है।" },
];

export default function HowPage() {
  const { t, lang } = useLang();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  return (
    <div className="container-reading space-y-6 py-6">
      <h1 className="text-2xl font-extrabold text-ink">{t("mockreal.title")}</h1>

      <LiveAiStatus />

      <section className="grid gap-3 sm:grid-cols-2">
        {HOW_STEPS.map((s) => (
          <div key={s.en} className="card">
            <p className="text-2xl" aria-hidden="true">{s.icon}</p>
            <h2 className="mt-1 font-bold text-ink">{L(s.en, s.hi)}</h2>
            <p className="text-sm text-ink-soft">{L(s.enBody, s.hiBody)}</p>
          </div>
        ))}
      </section>

      <section className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            {L("What is real and what is mocked in this prototype", "इस प्रोटोटाइप में क्या असली है और क्या मॉक")}
          </caption>
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase tracking-wide text-ink-faint">
              <th scope="col" className="py-2 pr-4 font-semibold">{L("Capability", "क्षमता")}</th>
              <th scope="col" className="py-2 font-semibold">{L("Status", "स्थिति")}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => {
              const m = STATUS_META[r.status];
              return (
                <tr key={r.en} className="border-b border-black/5 last:border-0">
                  <td className="py-2 pr-4 text-ink">{L(r.en, r.hi)}</td>
                  <td className="py-2">
                    <span className={`pill text-xs ${m.cls}`}>{L(m.en, m.hi)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <Disclaimer />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/case/DEMO-001" className="btn-primary">
          {L("Check a demo grievance", "एक डेमो शिकायत जाँचें")} →
        </Link>
        <Link href="/" className="btn-ghost">
          ← {t("common.back")}
        </Link>
      </div>
    </div>
  );
}
