"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import { useAuth } from "@/components/AuthProvider";
import { PrivacyWarning } from "@/components/Disclaimer";
import { saveAdhocCase, ADHOC_ID } from "@/lib/adhocCase";
import type { DemoCase } from "@/lib/types";

const CATEGORIES = [
  "Post", "Telecom", "Banking", "Insurance", "Education",
  "Road & Highways", "Health", "External Affairs", "Petroleum & Gas", "Other",
];

const SAMPLE_RESPONSE =
  "The matter was examined by the concerned authority. Inspection has been carried out and necessary action has been initiated through the implementing agency. The grievance is disposed.";

export default function FilePage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [jurisdiction, setJurisdiction] = useState<"central" | "state" | "ut">("central");
  const [subject, setSubject] = useState("");
  const [grievance, setGrievance] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (grievance.trim().length < 10) {
      setError(L("Please describe your grievance (at least a sentence).", "कृपया अपनी शिकायत लिखें (कम से कम एक वाक्य)।"));
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const trimmedSubject = subject.trim();
    // Build a first-class ad-hoc case so the filing flows through the SAME
    // journey as the curated demo cases (analysis → feedback → appeal → tracking).
    const adhoc: DemoCase = {
      id: ADHOC_ID,
      label: trimmedSubject || L("Your grievance", "आपकी शिकायत"),
      tagline: category,
      citizen: { name: user?.name ?? L("You", "आप") },
      grievance: {
        title: trimmedSubject || L("Your grievance", "आपकी शिकायत"),
        text: grievance.trim(),
        submittedAt: today,
      },
      response: {
        text: response.trim() || L("(No department response provided.)", "(विभाग का कोई जवाब नहीं दिया गया।)"),
        receivedAt: today,
      },
      caseContext: {
        jurisdiction,
        status: "disposed",
        disposedAt: today,
        feedback: "none",
      },
      hasCachedAnalysis: false,
    };
    saveAdhocCase(adhoc);
    router.push(`/case/${ADHOC_ID}`);
  }

  return (
    <div className="container-reading space-y-5 py-6">
      <div>
        <h1 className="section-title">{L("Lodge a grievance", "शिकायत दर्ज करें")}</h1>
        <p className="mt-3 text-sm text-ink-soft">
          {L(
            "Enter your grievance and (if you have it) the department’s response. We’ll compare them request-by-request. This is a demo — nothing is sent to any government system.",
            "अपनी शिकायत और (यदि हो तो) विभाग का जवाब भरें। हम माँग-दर-माँग तुलना करेंगे। यह डेमो है — कुछ भी किसी सरकारी सिस्टम को नहीं भेजा जाता।"
          )}
        </p>
      </div>

      <PrivacyWarning />

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink">
              {L("Grievance category", "शिकायत श्रेणी")}
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border border-black/15 bg-white px-3 text-base"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink">
              {L("Jurisdiction", "क्षेत्राधिकार")}
            </span>
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value as any)}
              className="min-h-[44px] w-full rounded-xl border border-black/15 bg-white px-3 text-base"
            >
              <option value="central">{L("Central Government", "केंद्र सरकार")}</option>
              <option value="state">{L("State Government", "राज्य सरकार")}</option>
              <option value="ut">{L("Union Territory", "केंद्र शासित प्रदेश")}</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink">
            {L("Subject", "विषय")}
          </span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={140}
            placeholder={L("Short summary of the issue", "समस्या का संक्षिप्त सारांश")}
            className="min-h-[44px] w-full rounded-xl border border-black/15 bg-white px-3 text-base"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink">
            {L("Grievance details", "शिकायत का विवरण")} *
          </span>
          <textarea
            value={grievance}
            onChange={(e) => setGrievance(e.target.value)}
            rows={6}
            maxLength={4000}
            placeholder={L(
              "Describe your requests clearly. Tip: number them (1., 2., 3.).",
              "अपनी माँगें स्पष्ट लिखें। सुझाव: उन्हें क्रमांकित करें (1., 2., 3.)।"
            )}
            className="w-full rounded-xl border border-black/15 bg-white p-3 text-base leading-relaxed"
          />
        </label>

        <label className="block">
          <span className="mb-1 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-ink">
              {L("Department response (if received)", "विभाग का जवाब (यदि मिला हो)")}
            </span>
            <button
              type="button"
              onClick={() => setResponse(SAMPLE_RESPONSE)}
              className="text-xs font-semibold text-accent hover:underline"
            >
              {L("Insert sample reply", "नमूना जवाब डालें")}
            </button>
          </span>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={4}
            maxLength={4000}
            placeholder={L(
              "Paste the department’s response. Leave blank if none yet.",
              "विभाग का जवाब यहाँ डालें। अभी न हो तो खाली छोड़ें।"
            )}
            className="w-full rounded-xl border border-black/15 bg-white p-3 text-base leading-relaxed"
          />
        </label>

        {error && <p className="text-sm text-status-missing">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" className="btn-primary">
            {L("Check my resolution", "मेरा समाधान जाँचें")} →
          </button>
          <Link href="/demo" className="btn-ghost">
            {L("Or try a curated demo case", "या एक तैयार डेमो केस आज़माएँ")}
          </Link>
        </div>
      </form>
    </div>
  );
}
