"use client";

/**
 * Read-aloud accessibility button (§26). Uses the browser's built-in
 * speech synthesis — no backend, no extra bandwidth. Speaks in the
 * current language when a matching voice is available.
 */
import { useEffect, useRef, useState } from "react";
import { useLang } from "./LanguageProvider";

export function ReadAloud({ text }: { text: string }) {
  const { t, lang } = useLang();
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "hi" ? "hi-IN" : "en-IN";
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    setSpeaking(true);
    synth.speak(u);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn-ghost text-sm"
      aria-pressed={speaking}
    >
      <span aria-hidden="true">🔊</span>
      {speaking ? t("common.stop") : t("common.listen")}
    </button>
  );
}
