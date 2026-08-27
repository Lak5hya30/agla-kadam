/**
 * Presentation metadata for coverage statuses.
 * Every status pairs an ICON + TEXT LABEL with its colour, so status is
 * never communicated by colour alone (§27, §47).
 */
import type { CoverageStatus } from "./schema";

export interface StatusDisplay {
  /** Text-safe icon glyph. */
  icon: string;
  /** i18n key for the label. */
  labelKey: string;
  /** Tailwind classes for the pill (bg + text). */
  pillClass: string;
  /** Bold accent for headings. */
  textClass: string;
}

export const STATUS_DISPLAY: Record<CoverageStatus, StatusDisplay> = {
  addressed: {
    icon: "✓",
    labelKey: "status.addressed",
    pillClass: "bg-status-okSoft text-status-ok",
    textClass: "text-status-ok",
  },
  partial: {
    icon: "◐",
    labelKey: "status.partial",
    pillClass: "bg-status-partialSoft text-status-partial",
    textClass: "text-status-partial",
  },
  not_addressed: {
    icon: "!",
    labelKey: "status.not_addressed",
    pillClass: "bg-status-missingSoft text-status-missing",
    textClass: "text-status-missing",
  },
  unclear: {
    icon: "?",
    labelKey: "status.unclear",
    pillClass: "bg-status-unclearSoft text-status-unclear",
    textClass: "text-status-unclear",
  },
};
