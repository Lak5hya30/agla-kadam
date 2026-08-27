"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useLang } from "./LanguageProvider";

/** Header sign-in control — CPGRAMS-style "Sign In", or a signed-in menu. */
export function AuthControl() {
  const { user, signOut, ready } = useAuth();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  if (!ready) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-gov-saffron px-3 text-sm font-bold text-white hover:brightness-95"
      >
        <span aria-hidden="true">➜</span>
        {L("Sign In", "साइन इन")}
      </Link>
    );
  }

  const initial = user.name.charAt(0).toUpperCase();
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex min-h-[36px] items-center gap-2 rounded-md bg-white/15 px-2.5 text-sm font-semibold text-white hover:bg-white/25"
      >
        <span
          aria-hidden="true"
          className="grid h-6 w-6 place-items-center rounded-full bg-gov-saffron text-xs font-bold text-white"
        >
          {initial}
        </span>
        <span className="max-w-[8rem] truncate">{user.name}</span>
        <span aria-hidden="true" className="text-xs">▾</span>
      </button>
      {open && (
        <div
          className="absolute right-0 z-30 mt-1 w-48 rounded-lg border border-black/10 bg-surface p-1 text-ink shadow-card"
          role="menu"
        >
          <p className="px-3 py-2 text-xs text-ink-faint">
            {L("Signed in (demo)", "साइन इन (डेमो)")}
          </p>
          <Link
            href="/demo"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block rounded px-3 py-2 text-sm hover:bg-surface-sunken"
          >
            {L("My demo cases", "मेरे डेमो केस")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            className="block w-full rounded px-3 py-2 text-left text-sm text-status-missing hover:bg-surface-sunken"
          >
            {L("Sign out", "साइन आउट")}
          </button>
        </div>
      )}
    </div>
  );
}
