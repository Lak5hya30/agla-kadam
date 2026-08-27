/**
 * Agla Kadam — core domain types.
 *
 * These types describe SYNTHETIC demo data and the deterministic
 * (non-AI) parts of the product: case model, policy context, and
 * application state. AI output types live in `schema.ts`.
 */

// ---------------------------------------------------------------------------
// Case model
// ---------------------------------------------------------------------------

export type Jurisdiction = "central" | "state" | "ut" | "unknown";

export type GrievanceStatus = "pending" | "disposed";

/** Feedback the citizen has (or hasn't) given on the department response. */
export type FeedbackStatus = "none" | "satisfied" | "partly" | "poor";

/** A synthetic CPGRAMS-style grievance case. No real personal data. */
export interface DemoCase {
  id: string;
  /** Short label for the case-selector card. */
  label: string;
  /** One-line description of what this case demonstrates. */
  tagline: string;
  citizen: {
    name: string;
    /** Purely narrative context; never a real identifier. */
    context?: string;
  };
  grievance: {
    title: string;
    /** Optional simple-Hindi rendering of the title. */
    title_hi?: string;
    text: string;
    /** Optional simple-Hindi rendering of the grievance (meaning, not literal). */
    text_hi?: string;
    submittedAt: string; // ISO date
  };
  response: {
    text: string;
    /** Optional simple-Hindi rendering of the response (meaning, not literal). */
    text_hi?: string;
    receivedAt: string; // ISO date
  };
  caseContext: CaseContext;
  /**
   * Whether a live-AI analysis is meaningful for this case, or whether
   * the cached fixture is always authoritative. All demo cases ship with
   * a fixture so the demo never breaks (see §29).
   */
  hasCachedAnalysis: boolean;
}

/** Deterministic policy context — drives the rules engine, never the LLM. */
export interface CaseContext {
  jurisdiction: Jurisdiction;
  status: GrievanceStatus;
  /** ISO date the grievance was marked disposed, if applicable. */
  disposedAt?: string;
  feedback: FeedbackStatus;
}

// ---------------------------------------------------------------------------
// Policy engine
// ---------------------------------------------------------------------------

export type NextAction =
  | "WAIT"
  | "REVIEW_RESPONSE"
  | "GIVE_FEEDBACK"
  | "APPEAL_AVAILABLE"
  | "JOURNEY_COMPLETE"
  | "ALTERNATIVE_GUIDANCE"
  | "MANUAL_REVIEW_REQUIRED";

/** A single deterministic reason line shown to the citizen ("✓ Grievance disposed"). */
export interface PolicyCheck {
  /** Whether this precondition is currently met. */
  met: boolean;
  /** Human-readable label. */
  label: string;
}

export interface PolicyDecision {
  action: NextAction;
  /** Short citizen-facing headline for the next-step screen. */
  headline: string;
  /** Plain explanation of why this is the next step. */
  explanation: string;
  /** Ordered checklist shown to build trust in the deterministic decision. */
  checks: PolicyCheck[];
  /**
   * Alternative options offered when the standard Central appeal route
   * does not apply (state/ut/unknown cases).
   */
  alternatives?: string[];
}

// ---------------------------------------------------------------------------
// Application state machine (see §34)
// ---------------------------------------------------------------------------

export type AppState =
  | "PENDING"
  | "DISPOSED"
  | "ANALYSIS_REQUESTED"
  | "ANALYSED"
  | "CITIZEN_REVIEW"
  | "RESOLVED"
  | "UNRESOLVED"
  | "FEEDBACK_REQUIRED"
  | "FEEDBACK_SUBMITTED"
  | "POLICY_CHECK"
  | "APPEAL_ELIGIBLE"
  | "APPEAL_DRAFT"
  | "USER_VERIFIED"
  | "APPEAL_SUBMITTED"
  | "UNDER_REVIEW"
  | "DECISION";

// ---------------------------------------------------------------------------
// Mock backend records
// ---------------------------------------------------------------------------

export interface MockFeedbackRecord {
  mock: true;
  caseId: string;
  rating: FeedbackStatus;
  unresolvedPoints: string[];
  status: "feedback_recorded";
  next_state: "appeal_eligible" | "journey_complete";
  recordedAt: string;
}

export type MockAppealStage = "submitted" | "under_review" | "decision";

export interface MockAppealRecord {
  mock: true;
  appealId: string;
  caseId: string;
  appealText: string;
  stage: MockAppealStage;
  status: "submitted";
  submittedAt: string;
  /** Timeline of stage advances, for the tracking view. */
  history: { stage: MockAppealStage; at: string }[];
}
