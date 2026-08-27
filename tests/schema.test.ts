import { describe, it, expect } from "vitest";
import {
  parseAnalysis,
  toDisplayCoverage,
  type CoverageItem,
} from "@/lib/schema";

function validAnalysis() {
  return {
    summary: { plain_language: "ok", plain_language_hi: "ठीक", confidence: 0.8 },
    original_requests: [{ id: "r1", request: "Repair road", source_span: "Repair road" }],
    response_actions: [{ id: "a1", action: "Repair done", source_span: "Repair completed" }],
    coverage: [
      {
        request_id: "r1",
        status: "addressed",
        reason: "done",
        response_evidence_ids: ["a1"],
        confidence: 0.9,
      },
    ],
    policy_questions: { needs_appeal_eligibility_check: false },
    unsupported_claims: [],
  };
}

describe("model output validator", () => {
  it("accepts a well-formed analysis", () => {
    const r = parseAnalysis(validAnalysis());
    expect(r.ok).toBe(true);
  });

  it("rejects an invalid status enum", () => {
    const bad = validAnalysis();
    (bad.coverage[0] as any).status = "resolved"; // not allowed
    const r = parseAnalysis(bad);
    expect(r.ok).toBe(false);
  });

  it("rejects confidence > 1", () => {
    const bad = validAnalysis();
    bad.coverage[0].confidence = 1.5;
    const r = parseAnalysis(bad);
    expect(r.ok).toBe(false);
  });

  it("rejects missing original_requests", () => {
    const bad = validAnalysis();
    (bad as any).original_requests = [];
    const r = parseAnalysis(bad);
    expect(r.ok).toBe(false);
  });

  it("rejects coverage referencing an unknown request_id", () => {
    const bad = validAnalysis();
    bad.coverage[0].request_id = "r99";
    const r = parseAnalysis(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("unknown request_id");
  });

  it("rejects coverage referencing an unknown evidence id", () => {
    const bad = validAnalysis();
    bad.coverage[0].response_evidence_ids = ["a99"];
    const r = parseAnalysis(bad);
    expect(r.ok).toBe(false);
  });

  it("rejects a request with no coverage entry", () => {
    const bad = validAnalysis();
    bad.original_requests.push({ id: "r2", request: "x", source_span: "x" });
    const r = parseAnalysis(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("no coverage entry");
  });

  it("rejects malformed / non-object input", () => {
    expect(parseAnalysis("not json").ok).toBe(false);
    expect(parseAnalysis(null).ok).toBe(false);
    expect(parseAnalysis(42).ok).toBe(false);
  });
});

describe("confidence-aware display (§41)", () => {
  const base: CoverageItem = {
    request_id: "r1",
    status: "not_addressed",
    reason: "x",
    response_evidence_ids: [],
    confidence: 0.9,
  };

  it("high confidence keeps the classification, no caution", () => {
    const d = toDisplayCoverage({ ...base, confidence: 0.9 });
    expect(d.displayStatus).toBe("not_addressed");
    expect(d.caution).toBe(false);
  });

  it("mid-band confidence keeps classification but flags caution", () => {
    const d = toDisplayCoverage({ ...base, confidence: 0.65 });
    expect(d.displayStatus).toBe("not_addressed");
    expect(d.caution).toBe(true);
  });

  it("very low confidence is downgraded to unclear", () => {
    const d = toDisplayCoverage({ ...base, confidence: 0.4 });
    expect(d.displayStatus).toBe("unclear");
  });

  it("an already-unclear item stays unclear", () => {
    const d = toDisplayCoverage({ ...base, status: "unclear", confidence: 0.95 });
    expect(d.displayStatus).toBe("unclear");
  });
});
