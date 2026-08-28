"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

/** Global error boundary — never exposes a raw stack trace to the citizen (§46). */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  const { lang } = useLang();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);
  return (
    <div className="container-reading space-y-4 py-10 text-center">
      <p className="text-4xl" aria-hidden="true">😕</p>
      <h1 className="text-2xl font-extrabold text-ink">
        {L("Something went wrong", "कुछ गड़बड़ हो गई")}
      </h1>
      <p className="text-ink-soft">
        {L(
          "This is a demo prototype. Please try again, or return to the start.",
          "यह एक डेमो है। दोबारा कोशिश करें या शुरुआत पर लौट जाएँ।"
        )}
      </p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <button onClick={reset} className="btn-primary">
          {L("Try again", "दोबारा कोशिश करें")}
        </button>
        <Link href="/" className="btn-ghost">
          {L("Go home", "होम पर जाएँ")}
        </Link>
      </div>
    </div>
  );
}
