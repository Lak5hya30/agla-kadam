"use client";

/** Compact orientation stepper across the citizen journey. */
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useLang } from "./LanguageProvider";

const STEPS = [
  { key: "grievance", match: /\/case\/[^/]+$/, labelEn: "Grievance", labelHi: "शिकायत" },
  { key: "analysis", match: /\/analysis$/, labelEn: "Compare", labelHi: "तुलना" },
  { key: "next", match: /\/next-step$/, labelEn: "Next step", labelHi: "अगला कदम" },
  { key: "feedback", match: /\/feedback$/, labelEn: "Feedback", labelHi: "प्रतिक्रिया" },
  { key: "appeal", match: /\/appeal$|\/review$/, labelEn: "Appeal", labelHi: "अपील" },
  { key: "track", match: /\/success$|\/tracking$/, labelEn: "Track", labelHi: "ट्रैक" },
];

export function JourneySteps() {
  const pathname = usePathname();
  const { lang } = useLang();
  const activeIdx = STEPS.findIndex((s) => s.match.test(pathname));
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const current = nav?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!nav || !current) return;
    nav.scrollLeft = current.offsetLeft - (nav.clientWidth - current.clientWidth) / 2;
  }, [activeIdx, lang]);

  return (
    <nav
      ref={navRef}
      aria-label={lang === "hi" ? "प्रक्रिया में आपकी स्थिति" : "Journey progress"}
      className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ol className="flex min-w-max items-center gap-1 text-xs">
        {STEPS.map((step, i) => {
          const state =
            i < activeIdx ? "done" : i === activeIdx ? "current" : "todo";
          return (
            <li key={step.key} className="flex items-center gap-1">
              <span
                aria-current={state === "current" ? "step" : undefined}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${
                  state === "current"
                    ? "bg-accent text-white"
                    : state === "done"
                      ? "bg-status-okSoft text-status-ok"
                      : "bg-surface-sunken text-ink-faint"
                }`}
              >
                <span aria-hidden="true">
                  {state === "done" ? "✓" : i + 1}
                </span>
                {lang === "hi" ? step.labelHi : step.labelEn}
              </span>
              {i < STEPS.length - 1 && (
                <span aria-hidden="true" className="text-ink-faint">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
