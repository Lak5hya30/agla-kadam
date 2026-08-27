/**
 * Explicit application state machine (§34).
 *
 * The frontend must never skip invalid transitions. This module defines
 * the allowed edges and a guard used by both UI navigation and tests.
 */
import type { AppState } from "./types";

/** Allowed transitions. Each key lists the states reachable from it. */
const TRANSITIONS: Record<AppState, AppState[]> = {
  PENDING: ["DISPOSED"],
  DISPOSED: ["ANALYSIS_REQUESTED"],
  ANALYSIS_REQUESTED: ["ANALYSED"],
  ANALYSED: ["CITIZEN_REVIEW"],
  CITIZEN_REVIEW: ["RESOLVED", "UNRESOLVED"],
  RESOLVED: [], // terminal — happy path complete
  UNRESOLVED: ["FEEDBACK_REQUIRED"],
  FEEDBACK_REQUIRED: ["FEEDBACK_SUBMITTED"],
  FEEDBACK_SUBMITTED: ["POLICY_CHECK"],
  POLICY_CHECK: ["APPEAL_ELIGIBLE", "RESOLVED"], // policy may close the journey
  APPEAL_ELIGIBLE: ["APPEAL_DRAFT"],
  APPEAL_DRAFT: ["USER_VERIFIED"],
  USER_VERIFIED: ["APPEAL_SUBMITTED"],
  APPEAL_SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["DECISION"],
  DECISION: [], // terminal
};

export function canTransition(from: AppState, to: AppState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export class InvalidTransitionError extends Error {
  constructor(
    public readonly from: AppState,
    public readonly to: AppState
  ) {
    super(`Invalid state transition: ${from} -> ${to}`);
    this.name = "InvalidTransitionError";
  }
}

/**
 * Assert-and-return the next state. Throws InvalidTransitionError on a
 * disallowed edge so callers cannot silently corrupt the journey.
 */
export function transition(from: AppState, to: AppState): AppState {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
  return to;
}

export function nextStates(from: AppState): AppState[] {
  return TRANSITIONS[from] ?? [];
}

export function isTerminal(state: AppState): boolean {
  return (TRANSITIONS[state] ?? []).length === 0;
}
