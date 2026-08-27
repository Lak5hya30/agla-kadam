"use client";

import { useLang } from "./LanguageProvider";
import { STATUS_DISPLAY } from "@/lib/statusDisplay";
import type { CoverageStatus } from "@/lib/schema";

export function StatusBadge({
  status,
  className = "",
}: {
  status: CoverageStatus;
  className?: string;
}) {
  const { t } = useLang();
  const d = STATUS_DISPLAY[status];
  return (
    <span className={`pill ${d.pillClass} ${className}`}>
      <span aria-hidden="true" className="text-base leading-none">
        {d.icon}
      </span>
      <span>{t(d.labelKey)}</span>
    </span>
  );
}
