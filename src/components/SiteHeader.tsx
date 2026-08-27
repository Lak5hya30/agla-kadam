"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "./LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function SiteHeader() {
  const { t } = useLang();
  const pathname = usePathname();

  const navItems = [
    { href: "/", labelKey: "nav.home" },
    { href: "/demo", labelKey: "nav.demos" },
    { href: "/how", labelKey: "nav.whatsReal" },
  ];

  return (
    <header className="sticky top-0 z-20 shadow-sm">
      {/* Utility strip — echoes a civic-portal top bar (no emblem/branding). */}
      <div className="bg-gov-maroonDark text-white">
        <div className="container-page flex items-center justify-between gap-2 py-1">
          <span className="text-xs font-medium text-white/80">
            {t("header.independent")}
          </span>
          <Link href="/how" className="utility-link">
            <span aria-hidden="true">ℹ️</span>
            {t("home.how")}
          </Link>
        </div>
      </div>

      {/* Brand row — Agla Kadam identity, clearly its own product. */}
      <div className="border-b border-black/5 bg-surface">
        <div className="container-page flex items-center justify-between gap-3 py-3">
          <Link href="/" className="flex items-center gap-3" aria-label={t("app.name")}>
            <span
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gov-maroon text-lg font-bold text-white"
            >
              अ
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-lg font-extrabold tracking-tight text-gov-maroon">
                {t("app.name")}
              </span>
              <span className="hidden text-xs text-ink-faint sm:block">
                {t("header.companion")}
              </span>
            </span>
          </Link>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Primary navigation — maroon strip, the strongest civic-portal signal. */}
      <nav className="bg-gov-maroon" aria-label="Primary">
        <div className="container-page flex items-stretch overflow-x-auto">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`nav-link whitespace-nowrap ${
                  active
                    ? "border-b-[3px] border-gov-saffron bg-gov-maroonDark text-white"
                    : "border-b-[3px] border-transparent"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
