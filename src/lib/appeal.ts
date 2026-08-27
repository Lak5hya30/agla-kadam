/**
 * Evidence-grounded appeal composer (§19, §20, §21, §43).
 *
 * The draft is composed DETERMINISTICALLY from validated, source-mapped
 * structured data (the AI's extracted requests + coverage). It never
 * invents dates, events, failures, legal arguments, or losses. Every
 * paragraph carries an explicit source reference, so the "✓ Source-backed"
 * indicator is truthful by construction.
 */
import type { ResolutionAnalysis } from "./schema";

export interface AppealParagraph {
  text: string;
  /** Human-readable provenance, e.g. "Original grievance — Request #2". */
  source: string;
  /** The verbatim source span this paragraph is grounded in, if any. */
  sourceSpan?: string;
}

export interface AppealUnresolvedItem {
  requestId: string;
  requestText: string;
  requestSpan: string;
  /** How the response addressed it (or the fact that it didn't). */
  responseSummary: string;
  responseSpans: string[];
  status: string;
}

export interface ComposedAppeal {
  paragraphs: AppealParagraph[];
  /** The plain concatenated text, for editing / submission. */
  plainText: string;
}

/**
 * List the unresolved / partly-resolved / unclear items a citizen might
 * include in an appeal. Fully-addressed items are excluded — the product
 * does not encourage unnecessary appeals (§10, §65).
 */
export function unresolvedItems(
  analysis: ResolutionAnalysis
): AppealUnresolvedItem[] {
  const reqById = new Map(analysis.original_requests.map((r) => [r.id, r]));
  const actionById = new Map(analysis.response_actions.map((a) => [a.id, a]));

  return analysis.coverage
    .filter((c) => c.status !== "addressed")
    .map((c) => {
      const req = reqById.get(c.request_id);
      const spans = c.response_evidence_ids
        .map((id) => actionById.get(id)?.source_span)
        .filter((s): s is string => Boolean(s));
      return {
        requestId: c.request_id,
        requestText: req?.request ?? c.request_id,
        requestSpan: req?.source_span ?? "",
        responseSummary: c.reason,
        responseSpans: spans,
        status: c.status,
      };
    });
}

/**
 * Compose an appeal draft from the citizen's selected unresolved items.
 * Only selected item ids are included. Respectful, neutral tone; no
 * invented accusations.
 */
export function composeAppeal(
  analysis: ResolutionAnalysis,
  selectedRequestIds: string[]
): ComposedAppeal {
  const selected = new Set(selectedRequestIds);
  const items = unresolvedItems(analysis).filter((i) =>
    selected.has(i.requestId)
  );

  const paragraphs: AppealParagraph[] = [];

  // 1. Opening — fixed, neutral, no invented facts.
  paragraphs.push({
    text: "I am requesting a review of the resolution of my grievance.",
    source: "Standard opening (no factual claim)",
  });

  // 2. Restate the original requests, grounded verbatim.
  const requestLines = analysis.original_requests
    .map((r, i) => `${i + 1}. ${r.request}`)
    .join("\n");
  paragraphs.push({
    text: `My original grievance requested:\n${requestLines}`,
    source: "Original grievance — all requests",
  });

  // 3. For each SELECTED unresolved item, a grounded sentence.
  items.forEach((item, idx) => {
    let sentence: string;
    if (item.status === "not_addressed") {
      sentence = `Regarding "${item.requestText}", I could not find a corresponding statement in the department response.`;
    } else if (item.status === "partial") {
      sentence = `Regarding "${item.requestText}", the response indicates action was started but does not confirm completion.`;
    } else {
      sentence = `Regarding "${item.requestText}", the department response is unclear about whether this was addressed.`;
    }
    paragraphs.push({
      text: sentence,
      source: `Original grievance — Request #${
        analysis.original_requests.findIndex((r) => r.id === item.requestId) + 1
      }${item.responseSpans.length ? " · Department response" : ""}`,
      sourceSpan: item.responseSpans[0],
    });
  });

  // 4. Closing request — neutral.
  paragraphs.push({
    text: "Based on the information in the response provided, I request a review of the unresolved points listed above.",
    source: "Standard closing (no factual claim)",
  });

  const plainText = paragraphs.map((p) => p.text).join("\n\n");
  return { paragraphs, plainText };
}
