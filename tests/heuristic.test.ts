import { describe, it, expect } from "vitest";
import { heuristicAnalyze } from "@/lib/heuristicAnalyze";
import { parseAnalysis } from "@/lib/schema";

function statusOf(grievance: string, response: string): string {
  const a = heuristicAnalyze(grievance, response);
  return a.coverage[0].status;
}

describe("offline heuristic analyzer", () => {
  it("always produces schema-valid, cross-referenced output", () => {
    const a = heuristicAnalyze(
      "The road has potholes.\n1. Repair the road surface.\n2. Replace the barrier.\n3. Confirm completion.",
      "Road repair has been initiated. The grievance is disposed."
    );
    const parsed = parseAnalysis(a);
    expect(parsed.ok).toBe(true);
  });

  it("A: completion wording -> addressed", () => {
    expect(statusOf("Repair the road.", "The road repair has been completed.")).toBe("addressed");
  });

  it("B: approved -> partial (not addressed)", () => {
    expect(statusOf("Repair the road.", "The road repair has been approved.")).toBe("partial");
  });

  it("D: 'will be taken up' -> partial (not addressed)", () => {
    expect(statusOf("Repair the road.", "The road repair will be taken up shortly.")).toBe("partial");
  });

  it("E: no matching mention -> not_addressed", () => {
    expect(statusOf("Replace the safety barrier.", "The road repair has been completed.")).toBe("not_addressed");
  });

  it("empty response -> not_addressed", () => {
    expect(statusOf("Repair the road.", "")).toBe("not_addressed");
  });

  it("never invents 'addressed' for progress-only wording", () => {
    for (const resp of [
      "The road repair has been initiated.",
      "The road repair has been forwarded to the agency.",
      "The road repair is under process.",
    ]) {
      expect(statusOf("Repair the road.", resp)).not.toBe("addressed");
    }
  });

  it("handles messy input without throwing and stays valid", () => {
    const a = heuristicAnalyze("!!!", "");
    expect(parseAnalysis(a).ok).toBe(true);
  });

  it("flags appeal-eligibility check when something is unresolved", () => {
    const a = heuristicAnalyze("Repair the road.", "The matter has been forwarded.");
    expect(a.policy_questions.needs_appeal_eligibility_check).toBe(true);
  });
});
