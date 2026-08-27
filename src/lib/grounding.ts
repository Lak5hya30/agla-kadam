/**
 * Server-side evidence grounding (defense against model hallucination).
 *
 * Structured output guarantees the SHAPE of the analysis, not the TRUTH of
 * the values. This pass verifies that every evidence span the model cited
 * actually appears verbatim in the supplied source text. Spans that don't
 * are discarded; if an "addressed"/"partial" finding loses all its
 * supporting evidence, it is degraded to "unclear" so the UI never shows a
 * confident claim that isn't backed by the source (§42).
 *
 * Applied to LIVE model output only. Cached fixtures are already verified
 * verbatim by the fixtures test and are grounded by construction.
 */
import type { ResolutionAnalysis } from "./schema";

export interface GroundingResult {
  analysis: ResolutionAnalysis;
  /** Number of evidence spans dropped because they weren't found verbatim. */
  droppedEvidence: number;
  /** Request ids whose status was degraded to "unclear" for lack of evidence. */
  degraded: string[];
}

export function groundAnalysis(
  analysis: ResolutionAnalysis,
  grievance: string,
  response: string
): GroundingResult {
  let droppedEvidence = 0;
  const degraded: string[] = [];

  // 1. Keep only response actions whose span occurs verbatim in the response.
  const validActions = analysis.response_actions.filter((a) => {
    const ok = response.includes(a.source_span);
    if (!ok) droppedEvidence += 1;
    return ok;
  });
  const validActionIds = new Set(validActions.map((a) => a.id));

  // 2. Re-check coverage evidence against the surviving actions.
  const coverage = analysis.coverage.map((c) => {
    const evidence = c.response_evidence_ids.filter((id) => validActionIds.has(id));
    const lostAll =
      evidence.length === 0 && c.response_evidence_ids.length > 0;

    // An addressed/partial finding with no verified evidence is not trustworthy.
    if (
      lostAll &&
      (c.status === "addressed" || c.status === "partial")
    ) {
      degraded.push(c.request_id);
      return {
        ...c,
        status: "unclear" as const,
        reason:
          "The supplied response does not contain enough verifiable evidence to confirm this. Please review the original text.",
        response_evidence_ids: [],
        confidence: Math.min(c.confidence, 0.49),
      };
    }
    return { ...c, response_evidence_ids: evidence };
  });

  return {
    analysis: { ...analysis, response_actions: validActions, coverage },
    droppedEvidence,
    degraded,
  };
}
