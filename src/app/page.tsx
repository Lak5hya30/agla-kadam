"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { useAuth } from "@/components/AuthProvider";
import { Ticker } from "@/components/Ticker";
import { DemoQuickStart } from "@/components/DemoQuickStart";

const SERVICES: { icon: string; en: string; hi: string }[] = [
  { icon: "📮", en: "Post", hi: "डाक" },
  { icon: "📡", en: "Telecom", hi: "दूरसंचार" },
  { icon: "🏦", en: "Banking", hi: "बैंकिंग" },
  { icon: "🛡️", en: "Insurance", hi: "बीमा" },
  { icon: "🏫", en: "Education", hi: "शिक्षा" },
  { icon: "🛣️", en: "Road & Highways", hi: "सड़क एवं राजमार्ग" },
  { icon: "🏥", en: "Health", hi: "स्वास्थ्य" },
  { icon: "✈️", en: "External Affairs", hi: "विदेश मंत्रालय" },
  { icon: "⛽", en: "Petroleum & Gas", hi: "पेट्रोलियम एवं गैस" },
];

export default function HomePage() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  return (
    <>
      <Suspense fallback={null}>
        <DemoQuickStart />
      </Suspense>

      {/* Hero banner — maroon, service grid on the right (CPGRAMS-style) */}
      <section className="bg-gradient-to-br from-gov-maroon to-gov-maroonDark text-white">
        <div className="container-page grid gap-6 py-8 sm:grid-cols-2 sm:items-center">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gov-saffron">
              {user
                ? L(`Namaste, ${user.name}`, `नमस्ते, ${user.name}`)
                : L("Grievance Resolution Companion", "शिकायत समाधान साथी")}
            </p>
            <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
              {L("Your grievance says", "आपकी शिकायत कहती है")} “{L("Disposed", "निपटाई गई")}.”
              <br />
              <span className="text-gov-saffron">
                {L("But was it actually resolved?", "पर क्या यह सच में हल हुई?")}
              </span>
            </h1>
            <p className="text-sm text-white/90">
              {L(
                "Agla Kadam compares your request with the department’s response and explains what you can safely do next.",
                "अगला कदम आपकी माँग की तुलना विभाग के जवाब से करता है और बताता है कि आप आगे क्या कर सकते हैं।"
              )}
            </p>
            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Link
                href="/demo"
                className="btn inline-flex bg-gov-saffron text-white hover:brightness-95"
              >
                {L("Check my resolution", "मेरा समाधान जाँचें")} →
              </Link>
              <Link
                href="/file"
                className="btn inline-flex border border-white/40 bg-white/10 text-white hover:bg-white/20"
              >
                {L("Lodge a grievance", "शिकायत दर्ज करें")}
              </Link>
            </div>
          </div>

          {/* Service category grid */}
          <div className="grid grid-cols-3 gap-2">
            {SERVICES.map((s) => (
              <div
                key={s.en}
                className="flex flex-col items-center gap-1 rounded-lg bg-white/10 px-2 py-3 text-center"
              >
                <span className="text-2xl" aria-hidden="true">
                  {s.icon}
                </span>
                <span className="text-[11px] font-medium leading-tight text-white/90">
                  {L(s.en, s.hi)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Ticker />

      <div className="container-page space-y-8 py-8">
        {/* Primary feature entry */}
        <section className="card border-l-4 border-l-gov-saffron">
          <h2 className="section-title">{L("Check your resolution", "अपना समाधान जाँचें")}</h2>
          <p className="mt-3 text-sm text-ink-soft">
            {L(
              "Pick a synthetic disposed grievance. We compare each request with the department’s reply, show the evidence, and guide your next step — feedback or appeal.",
              "एक काल्पनिक निपटाई गई शिकायत चुनें। हम हर माँग की तुलना विभाग के जवाब से करते हैं, प्रमाण दिखाते हैं, और आपका अगला कदम बताते हैं।"
            )}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <InsightCard ask={L("Repair the road", "सड़क की मरम्मत")} said="“repair work has been initiated”" verdict={t("status.partial")} icon="◐" tone="text-status-partial" />
            <InsightCard ask={L("Replace safety barrier", "बैरियर बदलें")} said={t("analysis.noMatch")} verdict={t("status.not_addressed")} icon="!" tone="text-status-missing" />
            <InsightCard ask={L("Confirm completion", "पूरा होने की पुष्टि")} said={L("No completion date", "पूरा होने की तारीख नहीं")} verdict={t("status.unclear")} icon="?" tone="text-status-unclear" />
          </div>
          <Link href="/demo" className="btn-primary mt-4 inline-flex">
            {t("home.cta")} →
          </Link>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* About */}
          <section>
            <h2 className="section-title">{L("About this demo", "इस डेमो के बारे में")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {L(
                "CPGRAMS already handles filing and routing of grievances. The gap is what happens after the reply arrives. Agla Kadam is an independent companion that helps a citizen understand a “Disposed” response and decide the correct next step — using synthetic data only.",
                "CPGRAMS शिकायत दर्ज करने और भेजने का काम पहले से करता है। असली समस्या तब आती है जब जवाब आता है। अगला कदम एक स्वतंत्र साथी है जो नागरिक को “निपटाई गई” जवाब समझने और सही अगला कदम तय करने में मदद करता है — केवल काल्पनिक डेटा के साथ।"
              )}
            </p>
            <Link href="/how" className="mt-2 inline-block text-sm font-semibold text-accent hover:underline">
              {L("What’s real vs mocked", "क्या असली, क्या मॉक")} →
            </Link>
          </section>

          {/* What's New */}
          <section>
            <h2 className="section-title">{L("What’s new", "नया क्या है")}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                L("Request-by-request comparison with evidence highlighting", "प्रमाण के साथ माँग-दर-माँग तुलना"),
                L("Deterministic next-step guidance (feedback / appeal)", "निश्चित अगला-कदम मार्गदर्शन (प्रतिक्रिया / अपील)"),
                L("Source-backed appeal draft with your confirmation", "आपकी पुष्टि के साथ स्रोत-आधारित अपील मसौदा"),
                L("English & simple Hindi, with read-aloud", "अंग्रेज़ी और सरल हिन्दी, पढ़कर सुनाने के साथ"),
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-gov-saffron" aria-hidden="true">
                    ●
                  </span>
                  <span className="text-ink-soft">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}

function InsightCard({
  ask,
  said,
  verdict,
  icon,
  tone,
}: {
  ask: string;
  said: string;
  verdict: string;
  icon: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-surface-soft p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">You asked</p>
      <p className="font-semibold text-ink">{ask}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Department said</p>
      <p className="text-ink-soft">{said}</p>
      <p className={`mt-2 flex items-center gap-1.5 font-bold ${tone}`}>
        <span aria-hidden="true">{icon}</span>
        {verdict}
      </p>
    </div>
  );
}
