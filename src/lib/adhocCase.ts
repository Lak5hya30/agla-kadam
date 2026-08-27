/**
 * Ad-hoc (user-filed) case storage.
 *
 * A grievance filed through the form becomes a first-class case with the
 * special id USER-DRAFT, stored client-side in sessionStorage so it can
 * flow through the SAME journey pages as the curated demo cases
 * (analysis → next-step → feedback → appeal → tracking).
 */
import type { DemoCase } from "./types";

export const ADHOC_ID = "USER-DRAFT";
const CASE_KEY = "agla-kadam.case.USER-DRAFT";
const JOURNEY_KEY = "agla-kadam.journey.USER-DRAFT";

export function saveAdhocCase(c: DemoCase): void {
  try {
    sessionStorage.setItem(CASE_KEY, JSON.stringify(c));
    // A fresh filing must not inherit a previous draft's journey state.
    sessionStorage.removeItem(JOURNEY_KEY);
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function loadAdhocCase(): DemoCase | null {
  try {
    const raw = sessionStorage.getItem(CASE_KEY);
    return raw ? (JSON.parse(raw) as DemoCase) : null;
  } catch {
    return null;
  }
}
