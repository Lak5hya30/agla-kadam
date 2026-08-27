"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LanguageProvider";

const PERSONAS = ["Asha Sharma", "Ravi Menon", "Meena Patel"];

function LoginInner() {
  const { signIn } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const [name, setName] = useState("");
  const next = params.get("next") || "/demo";

  function doSignIn(displayName: string) {
    signIn(displayName);
    router.push(next);
  }

  return (
    <div className="container-reading space-y-5 py-8">
      <div className="mx-auto max-w-md space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-gov-maroon">
            {L("Sign in", "साइन इन")}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {L(
              "A demo sign-in to personalise your session.",
              "आपके सत्र को वैयक्तिकृत करने के लिए एक डेमो साइन-इन।"
            )}
          </p>
        </div>

        {/* Safety notice — this is what keeps a mock login honest. */}
        <div
          role="note"
          className="flex items-start gap-2 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <span aria-hidden="true" className="mt-0.5">🔒</span>
          <p>
            {L(
              "Demo sign-in only. No password, OTP, Aadhaar, PAN or phone number is asked or stored. Never enter real CPGRAMS or government credentials. Nothing is verified or sent to any server.",
              "केवल डेमो साइन-इन। कोई पासवर्ड, OTP, आधार, पैन या फोन नंबर नहीं माँगा या संग्रहीत किया जाता। असली CPGRAMS या सरकारी क्रेडेंशियल कभी न भरें। कुछ भी सत्यापित या किसी सर्वर को नहीं भेजा जाता।"
            )}
          </p>
        </div>

        <div className="card space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink">
              {L("Display name", "प्रदर्शित नाम")}
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder={L("Your name (optional)", "आपका नाम (वैकल्पिक)")}
              className="min-h-[44px] w-full rounded-xl border border-black/15 bg-white px-3 text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter") doSignIn(name);
              }}
            />
            <span className="mt-1 block text-xs text-ink-faint">
              {L(
                "Use any name — it is only shown back to you in this demo.",
                "कोई भी नाम लिखें — यह इस डेमो में केवल आपको दिखाया जाता है।"
              )}
            </span>
          </label>

          <button className="btn-primary w-full" onClick={() => doSignIn(name)}>
            {L("Continue", "जारी रखें")} →
          </button>

          <div className="flex items-center gap-2 text-xs text-ink-faint">
            <span className="h-px flex-1 bg-black/10" />
            {L("or sign in as a demo persona", "या डेमो व्यक्ति के रूप में साइन इन करें")}
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {PERSONAS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => doSignIn(p)}
                className="btn-ghost text-sm"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm">
          <Link href="/" className="text-accent hover:underline">
            ← {L("Back to home", "होम पर वापस")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
