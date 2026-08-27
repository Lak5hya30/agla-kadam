import { describe, it, expect } from "vitest";
import {
  canTransition,
  transition,
  isTerminal,
  InvalidTransitionError,
} from "@/lib/stateMachine";

describe("application state machine", () => {
  it("allows the happy-path resolved journey", () => {
    expect(canTransition("PENDING", "DISPOSED")).toBe(true);
    expect(canTransition("DISPOSED", "ANALYSIS_REQUESTED")).toBe(true);
    expect(canTransition("ANALYSED", "CITIZEN_REVIEW")).toBe(true);
    expect(canTransition("CITIZEN_REVIEW", "RESOLVED")).toBe(true);
  });

  it("allows the full appeal journey", () => {
    const path = [
      "CITIZEN_REVIEW",
      "UNRESOLVED",
      "FEEDBACK_REQUIRED",
      "FEEDBACK_SUBMITTED",
      "POLICY_CHECK",
      "APPEAL_ELIGIBLE",
      "APPEAL_DRAFT",
      "USER_VERIFIED",
      "APPEAL_SUBMITTED",
      "UNDER_REVIEW",
      "DECISION",
    ] as const;
    for (let i = 0; i < path.length - 1; i++) {
      expect(canTransition(path[i], path[i + 1])).toBe(true);
    }
  });

  it("rejects skipping straight from DISPOSED to APPEAL_SUBMITTED", () => {
    expect(canTransition("DISPOSED", "APPEAL_SUBMITTED")).toBe(false);
    expect(() => transition("DISPOSED", "APPEAL_SUBMITTED")).toThrow(
      InvalidTransitionError
    );
  });

  it("rejects going backwards", () => {
    expect(canTransition("APPEAL_SUBMITTED", "APPEAL_DRAFT")).toBe(false);
  });

  it("RESOLVED and DECISION are terminal", () => {
    expect(isTerminal("RESOLVED")).toBe(true);
    expect(isTerminal("DECISION")).toBe(true);
    expect(isTerminal("PENDING")).toBe(false);
  });

  it("transition returns the target state on a valid edge", () => {
    expect(transition("PENDING", "DISPOSED")).toBe("DISPOSED");
  });
});
