import { describe, it, expect } from "vitest";
import { decideNextAction, isAppealAvailable, localizePolicyDecision } from "@/lib/policyEngine";
import type { CaseContext } from "@/lib/types";

const NOW = new Date("2026-08-27T00:00:00Z");

function ctx(partial: Partial<CaseContext>): CaseContext {
  return {
    jurisdiction: "central",
    status: "disposed",
    disposedAt: "2026-08-12",
    feedback: "none",
    ...partial,
  };
}

describe("policy engine — deterministic next action", () => {
  it("pending grievance -> REVIEW_RESPONSE (never appeal)", () => {
    const d = decideNextAction(ctx({ status: "pending" }), { now: NOW });
    expect(d.action).toBe("REVIEW_RESPONSE");
  });

  it("central + disposed + no feedback -> GIVE_FEEDBACK", () => {
    const d = decideNextAction(ctx({ feedback: "none" }), { now: NOW });
    expect(d.action).toBe("GIVE_FEEDBACK");
  });

  it("central + disposed + partly feedback -> GIVE_FEEDBACK (not yet appeal)", () => {
    const d = decideNextAction(ctx({ feedback: "partly" }), { now: NOW });
    expect(d.action).toBe("GIVE_FEEDBACK");
  });

  it("central + disposed + poor feedback + within window -> APPEAL_AVAILABLE", () => {
    const d = decideNextAction(ctx({ feedback: "poor" }), { now: NOW });
    expect(d.action).toBe("APPEAL_AVAILABLE");
    expect(isAppealAvailable(ctx({ feedback: "poor" }), { now: NOW })).toBe(true);
  });

  it("central + disposed + poor feedback + OUT of window -> ALTERNATIVE_GUIDANCE", () => {
    const d = decideNextAction(
      ctx({ feedback: "poor", disposedAt: "2026-01-01" }),
      { now: NOW, appealWindowDays: 30 }
    );
    expect(d.action).toBe("ALTERNATIVE_GUIDANCE");
  });

  it("central + disposed + satisfied -> JOURNEY_COMPLETE (no unnecessary appeal)", () => {
    const d = decideNextAction(ctx({ feedback: "satisfied" }), { now: NOW });
    expect(d.action).toBe("JOURNEY_COMPLETE");
  });

  it("state jurisdiction -> ALTERNATIVE_GUIDANCE, never Central appeal", () => {
    const d = decideNextAction(
      ctx({ jurisdiction: "state", feedback: "poor" }),
      { now: NOW }
    );
    expect(d.action).toBe("ALTERNATIVE_GUIDANCE");
    expect(d.action).not.toBe("APPEAL_AVAILABLE");
  });

  it("ut jurisdiction -> ALTERNATIVE_GUIDANCE, never Central appeal", () => {
    const d = decideNextAction(
      ctx({ jurisdiction: "ut", feedback: "poor" }),
      { now: NOW }
    );
    expect(d.action).toBe("ALTERNATIVE_GUIDANCE");
  });

  it("unknown jurisdiction -> MANUAL_REVIEW_REQUIRED", () => {
    const d = decideNextAction(
      ctx({ jurisdiction: "unknown", feedback: "poor" }),
      { now: NOW }
    );
    expect(d.action).toBe("MANUAL_REVIEW_REQUIRED");
  });

  it("appeal window boundary is inclusive at exactly N days", () => {
    // disposed exactly 30 days before NOW, window = 30 -> still available
    const d = decideNextAction(
      ctx({ feedback: "poor", disposedAt: "2026-07-28" }),
      { now: NOW, appealWindowDays: 30 }
    );
    expect(d.action).toBe("APPEAL_AVAILABLE");
  });

  it("every decision returns a headline and at least one check", () => {
    const contexts: CaseContext[] = [
      ctx({ status: "pending" }),
      ctx({ feedback: "none" }),
      ctx({ feedback: "poor" }),
      ctx({ feedback: "satisfied" }),
      ctx({ jurisdiction: "state", feedback: "poor" }),
      ctx({ jurisdiction: "unknown" }),
    ];
    for (const c of contexts) {
      const d = decideNextAction(c, { now: NOW });
      expect(d.headline.length).toBeGreaterThan(0);
      expect(d.checks.length).toBeGreaterThan(0);
    }
  });

  it("localizes citizen-facing guidance without changing the decision", () => {
    const decision = decideNextAction(ctx({ feedback: "none" }), { now: NOW });
    const localized = localizePolicyDecision(decision, "hi");
    expect(localized.action).toBe(decision.action);
    expect(localized.headline).toContain("प्रतिक्रिया");
    expect(localized.checks.every((check) => !check.label.includes("Grievance"))).toBe(true);
  });
});
