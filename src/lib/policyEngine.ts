/**
 * Deterministic policy engine (§16, §40).
 *
 * This module — and ONLY this module — decides workflow availability:
 * whether the citizen should wait, give feedback, or has a (synthetic)
 * appeal route available. The LLM never makes these decisions. Appeal
 * eligibility, jurisdiction handling and deadlines all live here in
 * plain, testable code.
 */
import type {
  CaseContext,
  NextAction,
  PolicyCheck,
  PolicyDecision,
} from "./types";

export interface PolicyOptions {
  /** Demo appeal window in days. Defaults to 30. */
  appealWindowDays?: number;
  /** "Now", injectable for deterministic tests. Defaults to Date.now(). */
  now?: Date;
}

const DEFAULT_APPEAL_WINDOW_DAYS = 30;

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return ms / (1000 * 60 * 60 * 24);
}

/**
 * Compute the citizen's next allowed action from the deterministic case context.
 *
 * Rules (demo):
 *   - pending                                   -> REVIEW_RESPONSE / WAIT
 *   - disposed + satisfied                      -> JOURNEY_COMPLETE
 *   - disposed + central + feedback=none        -> GIVE_FEEDBACK
 *   - disposed + central + feedback=poor + in-window -> APPEAL_AVAILABLE
 *   - disposed + central + feedback=poor + out-of-window -> ALTERNATIVE_GUIDANCE
 *   - state | ut                                -> ALTERNATIVE_GUIDANCE (never Central appeal)
 *   - unknown jurisdiction                      -> MANUAL_REVIEW_REQUIRED
 */
export function decideNextAction(
  ctx: CaseContext,
  opts: PolicyOptions = {}
): PolicyDecision {
  const appealWindowDays = opts.appealWindowDays ?? DEFAULT_APPEAL_WINDOW_DAYS;
  const now = opts.now ?? new Date();

  // 1. Unknown jurisdiction is always a manual-review safeguard.
  if (ctx.jurisdiction === "unknown") {
    return {
      action: "MANUAL_REVIEW_REQUIRED",
      headline: "This case needs a manual review path.",
      explanation:
        "We could not confidently determine the jurisdiction for this demo case, so we are not showing an automated appeal route.",
      checks: [
        { met: false, label: "Jurisdiction identified" },
        { met: ctx.status === "disposed", label: "Grievance disposed" },
      ],
      alternatives: [
        "Review the department response again",
        "Prepare a follow-up summary",
        "Check official guidance for the correct authority",
      ],
    };
  }

  // 2. Still pending — nothing to appeal yet.
  if (ctx.status === "pending") {
    return {
      action: "REVIEW_RESPONSE",
      headline: "This grievance is still in progress.",
      explanation:
        "The grievance has not been disposed yet. You can review any interim response, or wait for the department to respond.",
      checks: [
        { met: true, label: "Grievance received" },
        { met: false, label: "Grievance disposed" },
      ],
    };
  }

  // From here on: status === "disposed".

  // 3. Citizen already satisfied — journey is complete.
  if (ctx.feedback === "satisfied") {
    return {
      action: "JOURNEY_COMPLETE",
      headline: "No further action is needed.",
      explanation:
        "You indicated the response resolved your problem. In this demo, the journey is complete.",
      checks: [
        { met: true, label: "Grievance disposed" },
        { met: true, label: "You are satisfied with the response" },
      ],
    };
  }

  // 4. State / UT cases never get the Central CPGRAMS appeal route (§11).
  if (ctx.jurisdiction === "state" || ctx.jurisdiction === "ut") {
    return {
      action: "ALTERNATIVE_GUIDANCE",
      headline: "This case needs a different follow-up path.",
      explanation:
        ctx.jurisdiction === "state"
          ? "This demo grievance is configured as a State-level case, so we are not showing the Central CPGRAMS appeal workflow."
          : "This demo grievance is configured as a Union-Territory case, so we are not showing the Central CPGRAMS appeal workflow.",
      checks: [
        { met: true, label: "Grievance disposed" },
        {
          met: false,
          label: "Central Government case (required for the Central appeal route)",
        },
      ],
      alternatives: [
        "Review the department response",
        "Prepare a follow-up summary",
        "Check official guidance for the correct authority",
      ],
    };
  }

  // 5. Central + disposed. Decide by feedback state.
  const withinWindow =
    ctx.disposedAt !== undefined &&
    daysBetween(new Date(ctx.disposedAt), now) <= appealWindowDays;

  if (ctx.feedback === "none" || ctx.feedback === "partly") {
    // Feedback must be given (and reflect dissatisfaction) before an appeal.
    return {
      action: "GIVE_FEEDBACK",
      headline: "The next step is to record your feedback.",
      explanation:
        "Before an appeal becomes available, the demo asks you to record how satisfied you are with the response and what remains unresolved.",
      checks: [
        { met: true, label: "Grievance disposed" },
        { met: true, label: "Central Government demo case" },
        { met: withinWindow, label: "Within the configured demo appeal period" },
        { met: false, label: "Feedback recorded" },
      ],
    };
  }

  // feedback === "poor"
  if (!withinWindow) {
    return {
      action: "ALTERNATIVE_GUIDANCE",
      headline: "The demo appeal period has passed.",
      explanation:
        "This disposed case is outside the configured demo appeal window, so the appeal route is not shown. You can still review the response or prepare a follow-up.",
      checks: [
        { met: true, label: "Grievance disposed" },
        { met: true, label: "Central Government demo case" },
        { met: false, label: "Within the configured demo appeal period" },
        { met: true, label: "Feedback recorded" },
      ],
      alternatives: [
        "Review the department response",
        "Prepare a follow-up summary",
        "Check official guidance",
      ],
    };
  }

  return {
    action: "APPEAL_AVAILABLE",
    headline: "An appeal is available for this demo case.",
    explanation:
      "Because this disposed Central Government demo case is within the configured appeal period and you recorded that the response was not satisfactory, the demo appeal route is now available.",
    checks: [
      { met: true, label: "Grievance disposed" },
      { met: true, label: "Central Government demo case" },
      { met: true, label: "Within the configured demo appeal period" },
      { met: true, label: "Feedback recorded (not satisfied)" },
    ],
  };
}

/** Convenience predicate used by UI guards. */
export function isAppealAvailable(
  ctx: CaseContext,
  opts?: PolicyOptions
): boolean {
  return decideNextAction(ctx, opts).action === "APPEAL_AVAILABLE";
}

export const POLICY_DEFAULTS = {
  appealWindowDays: DEFAULT_APPEAL_WINDOW_DAYS,
} as const;

export type { NextAction, PolicyCheck };
