"use client";

import Link from "next/link";
import { useLang } from "./LanguageProvider";

export function CpgramsFooter() {
  const { lang } = useLang();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const cols = [
    {
      title: L("Quick Links", "त्वरित लिंक"),
      links: [
        { href: "/demo", label: L("Check Resolution", "समाधान जाँचें") },
        { href: "/redress-process", label: L("Redress Process", "निवारण प्रक्रिया") },
        { href: "/demo", label: L("Demo Cases", "डेमो केस") },
      ],
    },
    {
      title: L("About", "परिचय"),
      links: [
        { href: "/how", label: L("What’s Real vs Mock", "क्या असली, क्या मॉक") },
        { href: "/how", label: L("How it Works", "यह कैसे काम करता है") },
      ],
    },
  ];

  return (
    <footer className="mt-10 bg-gov-maroon text-white/90">
      <div className="container-page grid gap-6 py-8 sm:grid-cols-3">
        <div className="space-y-2">
          <p className="text-base font-extrabold text-white">Agla Kadam</p>
          <p className="text-xs leading-relaxed">
            {L(
              "A citizen-side companion that helps you understand a department response and your next step.",
              "एक नागरिक-साथी जो विभाग के जवाब और आपके अगले कदम को समझने में मदद करता है।"
            )}
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title} className="space-y-2">
            <p className="border-b border-white/20 pb-1 text-sm font-bold uppercase tracking-wide">
              {col.title}
            </p>
            <ul className="space-y-1 text-xs">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-gov-saffron hover:underline">
                    → {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/15 bg-gov-maroonDark">
        <div className="container-page py-3 text-center text-[11px] leading-relaxed">
          {L(
            "Hackathon prototype · Synthetic data only · Independent demo, NOT affiliated with CPGRAMS or the Government of India. The seal shown is a neutral placeholder, not an official emblem.",
            "हैकाथॉन प्रोटोटाइप · केवल काल्पनिक डेटा · स्वतंत्र डेमो, CPGRAMS या भारत सरकार से संबद्ध नहीं। दिखाई गई मुहर एक तटस्थ प्लेसहोल्डर है, कोई आधिकारिक प्रतीक नहीं।"
          )}
        </div>
      </div>
    </footer>
  );
}
