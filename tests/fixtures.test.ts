import { describe, it, expect } from "vitest";
import { listCases, getCase, getCachedAnalysis } from "@/lib/cases";

describe("synthetic fixtures integrity", () => {
  it("exposes the three demo cases", () => {
    const ids = listCases().map((c) => c.id).sort();
    expect(ids).toEqual(["DEMO-001", "DEMO-002", "DEMO-003"]);
  });

  it("every cached analysis validates against the schema", () => {
    for (const c of listCases()) {
      expect(() => getCachedAnalysis(c.id)).not.toThrow();
    }
  });

  it("every analysis source_span appears verbatim in the case text", () => {
    for (const c of listCases()) {
      const analysis = getCachedAnalysis(c.id);
      const grievance = c.grievance.text;
      const response = c.response.text;

      for (const req of analysis.original_requests) {
        expect(
          grievance.includes(req.source_span),
          `case ${c.id} request ${req.id} span not found in grievance`
        ).toBe(true);
      }
      for (const act of analysis.response_actions) {
        expect(
          response.includes(act.source_span),
          `case ${c.id} action ${act.id} span not found in response`
        ).toBe(true);
      }
    }
  });

  it("the fully-resolved case needs no appeal eligibility check", () => {
    const analysis = getCachedAnalysis("DEMO-002");
    expect(analysis.policy_questions.needs_appeal_eligibility_check).toBe(false);
    expect(analysis.coverage.every((c) => c.status === "addressed")).toBe(true);
  });

  it("returns undefined for an unknown case id", () => {
    expect(getCase("NOPE")).toBeUndefined();
  });
});
