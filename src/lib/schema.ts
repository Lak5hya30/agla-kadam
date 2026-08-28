/**
 * Strict structured-output schema for the resolution analysis.
 *
 * The OpenAI model MUST return data matching this shape. Anything that
 * fails validation is rejected — we never trust arbitrary model output
 * (see §14, §46). The same schema is reused to validate cached fixtures,
 * so a corrupted fixture is caught too.
 */
import { z } from "zod";

export const CoverageStatusSchema = z.enum([
  "addressed",
  "partial",
  "not_addressed",
  "unclear",
]);
export type CoverageStatus = z.infer<typeof CoverageStatusSchema>;

export const OriginalRequestSchema = z.object({
  id: z.string().min(1),
  /** The citizen's individual request, in plain language. */
  request: z.string().min(1),
  /** Optional simple-Hindi rendering of the request. */
  request_hi: z.string().optional(),
  /** Verbatim span from the ORIGINAL GRIEVANCE that this request came from. */
  source_span: z.string().min(1),
});
export type OriginalRequest = z.infer<typeof OriginalRequestSchema>;

export const ResponseActionSchema = z.object({
  id: z.string().min(1),
  /** An action or statement the department made, in plain language. */
  action: z.string().min(1),
  /** Optional simple-Hindi rendering of the action. */
  action_hi: z.string().optional(),
  /** Verbatim span from the DEPARTMENT RESPONSE. */
  source_span: z.string().min(1),
});
export type ResponseAction = z.infer<typeof ResponseActionSchema>;

export const CoverageItemSchema = z.object({
  request_id: z.string().min(1),
  status: CoverageStatusSchema,
  /** Citizen-friendly reason. For not_addressed, states we couldn't find a match. */
  reason: z.string().min(1),
  /** Optional simple-Hindi rendering of the reason. */
  reason_hi: z.string().optional(),
  /** IDs of response_actions that support this assessment (may be empty for not_addressed). */
  response_evidence_ids: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});
export type CoverageItem = z.infer<typeof CoverageItemSchema>;

export const ResolutionAnalysisSchema = z.object({
  summary: z.object({
    plain_language: z.string().min(1),
    /** Simple-Hindi rendering of the summary (translate meaning, not words). */
    plain_language_hi: z.string().min(1),
    confidence: z.number().min(0).max(1),
  }),
  original_requests: z.array(OriginalRequestSchema).min(1),
  response_actions: z.array(ResponseActionSchema),
  coverage: z.array(CoverageItemSchema).min(1),
  policy_questions: z.object({
    /** The model may FLAG that an eligibility check is relevant; it never DECIDES it. */
    needs_appeal_eligibility_check: z.boolean(),
  }),
  /** Any claim the model was tempted to make but could not ground in source text. */
  unsupported_claims: z.array(z.string()),
});
export type ResolutionAnalysis = z.infer<typeof ResolutionAnalysisSchema>;

/**
 * Parse-and-validate helper. Returns a discriminated result so callers can
 * distinguish "model gave us garbage" from a genuine analysis, without throwing.
 */
export function parseAnalysis(
  data: unknown
): { ok: true; analysis: ResolutionAnalysis } | { ok: false; error: string } {
  const result = ResolutionAnalysisSchema.safeParse(data);
  if (result.success) {
    // Extra invariant checks the raw schema can't express:
    const reqIds = new Set(result.data.original_requests.map((r) => r.id));
    const actionIds = new Set(result.data.response_actions.map((a) => a.id));

    // Every coverage item must reference a real request.
    for (const cov of result.data.coverage) {
      if (!reqIds.has(cov.request_id)) {
        return {
          ok: false,
          error: `coverage references unknown request_id "${cov.request_id}"`,
        };
      }
      // Every evidence id must reference a real response action.
      for (const evId of cov.response_evidence_ids) {
        if (!actionIds.has(evId)) {
          return {
            ok: false,
            error: `coverage references unknown response_evidence_id "${evId}"`,
          };
        }
      }
    }

    // Every request should have exactly one coverage entry.
    const coveredReqIds = new Set(result.data.coverage.map((c) => c.request_id));
    for (const id of reqIds) {
      if (!coveredReqIds.has(id)) {
        return { ok: false, error: `request "${id}" has no coverage entry` };
      }
    }

    return { ok: true, analysis: result.data };
  }
  return { ok: false, error: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
}

/**
 * Confidence-aware display status (see §41).
 * A low-confidence "addressed"/"partial"/"not_addressed" is downgraded to
 * "unclear" for display, so the UI never overstates certainty.
 */
export const CONFIDENCE_DISPLAY_THRESHOLD = 0.8;
export const CONFIDENCE_UNCLEAR_FLOOR = 0.55;

export interface DisplayCoverage extends CoverageItem {
  /** What the UI should actually show, after applying confidence rules. */
  displayStatus: CoverageStatus;
  /** True when we surfaced a caution because confidence is in the middle band. */
  caution: boolean;
}

export function toDisplayCoverage(item: CoverageItem): DisplayCoverage {
  if (item.status === "unclear") {
    return { ...item, displayStatus: "unclear", caution: false };
  }
  if (item.confidence < CONFIDENCE_UNCLEAR_FLOOR) {
    return { ...item, displayStatus: "unclear", caution: false };
  }
  if (item.confidence < CONFIDENCE_DISPLAY_THRESHOLD) {
    return { ...item, displayStatus: item.status, caution: true };
  }
  return { ...item, displayStatus: item.status, caution: false };
}
