import { describe, it, expect } from "vitest";
import { groundAnalysis } from "@/lib/grounding";
import { parseAnalysis, type ResolutionAnalysis } from "@/lib/schema";

const GRIEVANCE = "Please repair the road and replace the barrier.";
const RESPONSE = "Road repair has been initiated by the agency.";

function analysis(overrides?: Partial<ResolutionAnalysis>): ResolutionAnalysis {
  return {
    summary: { plain_language: "x", plain_language_hi: "x", confidence: 0.8 },
    original_requests: [
      { id: "r1", request: "Repair the road", source_span: "repair the road" },
      { id: "r2", request: "Replace the barrier", source_span: "replace the barrier" },
    ],
    response_actions: [
      { id: "a1", action: "Repair initiated", source_span: "Road repair has been initiated" },
      // a2 is HALLUCINATED — this span is not in RESPONSE
      { id: "a2", action: "Barrier replaced", source_span: "the barrier has been replaced" },
    ],
    coverage: [
      { request_id: "r1", status: "partial", reason: "initiated", response_evidence_ids: ["a1"], confidence: 0.85 },
      { request_id: "r2", status: "addressed", reason: "done", response_evidence_ids: ["a2"], confidence: 0.9 },
    ],
    policy_questions: { needs_appeal_eligibility_check: true },
    unsupported_claims: [],
    ...overrides,
  };
}

describe("evidence grounding", () => {
  it("drops response actions whose span is not verbatim in the response", () => {
    const { analysis: g, droppedEvidence } = groundAnalysis(analysis(), GRIEVANCE, RESPONSE);
    expect(droppedEvidence).toBe(1);
    expect(g.response_actions.map((a) => a.id)).toEqual(["a1"]);
  });

  it("degrades an 'addressed' finding to 'unclear' when its evidence was hallucinated", () => {
    const { analysis: g, degraded } = groundAnalysis(analysis(), GRIEVANCE, RESPONSE);
    const r2 = g.coverage.find((c) => c.request_id === "r2")!;
    expect(r2.status).toBe("unclear");
    expect(r2.response_evidence_ids).toEqual([]);
    expect(r2.confidence).toBeLessThanOrEqual(0.49);
    expect(degraded).toContain("r2");
  });

  it("keeps a finding whose evidence IS verbatim", () => {
    const { analysis: g } = groundAnalysis(analysis(), GRIEVANCE, RESPONSE);
    const r1 = g.coverage.find((c) => c.request_id === "r1")!;
    expect(r1.status).toBe("partial");
    expect(r1.response_evidence_ids).toEqual(["a1"]);
  });

  it("output still passes full schema + cross-reference validation", () => {
    const { analysis: g } = groundAnalysis(analysis(), GRIEVANCE, RESPONSE);
    expect(parseAnalysis(g).ok).toBe(true);
  });

  it("leaves not_addressed items (no evidence) untouched", () => {
    const a = analysis({
      coverage: [
        { request_id: "r1", status: "not_addressed", reason: "none", response_evidence_ids: [], confidence: 0.8 },
        { request_id: "r2", status: "not_addressed", reason: "none", response_evidence_ids: [], confidence: 0.8 },
      ],
    });
    const { analysis: g, degraded } = groundAnalysis(a, GRIEVANCE, RESPONSE);
    expect(degraded).toEqual([]);
    expect(g.coverage.every((c) => c.status === "not_addressed")).toBe(true);
  });
});
