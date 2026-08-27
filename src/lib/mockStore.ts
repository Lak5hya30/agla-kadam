/**
 * In-memory MOCK backend (§32).
 *
 * Simulates feedback recording and appeal submission/tracking. Nothing
 * here touches a real government system. Records live in server memory
 * for the life of the process — perfect for a demo, no database needed.
 * Every record is explicitly tagged `mock: true`.
 */
import type {
  FeedbackStatus,
  MockAppealRecord,
  MockAppealStage,
  MockFeedbackRecord,
} from "./types";

const feedbackByCase = new Map<string, MockFeedbackRecord>();
const appealsById = new Map<string, MockAppealRecord>();
const appealIdByCase = new Map<string, string>();

let appealCounter = 41; // first issued id will be ...-0042

function nowIso(): string {
  return new Date().toISOString();
}

function nextAppealId(): string {
  appealCounter += 1;
  const seq = String(appealCounter).padStart(4, "0");
  const year = new Date().getFullYear();
  return `AGLA-DEMO-${year}-${seq}`;
}

export function recordFeedback(
  caseId: string,
  rating: FeedbackStatus,
  unresolvedPoints: string[]
): MockFeedbackRecord {
  const record: MockFeedbackRecord = {
    mock: true,
    caseId,
    rating,
    unresolvedPoints,
    status: "feedback_recorded",
    next_state:
      rating === "satisfied" ? "journey_complete" : "appeal_eligible",
    recordedAt: nowIso(),
  };
  feedbackByCase.set(caseId, record);
  return record;
}

export function getFeedback(caseId: string): MockFeedbackRecord | undefined {
  return feedbackByCase.get(caseId);
}

export function submitAppeal(
  caseId: string,
  appealText: string
): MockAppealRecord {
  const at = nowIso();
  const appealId = nextAppealId();
  const record: MockAppealRecord = {
    mock: true,
    appealId,
    caseId,
    appealText,
    stage: "submitted",
    status: "submitted",
    submittedAt: at,
    history: [{ stage: "submitted", at }],
  };
  appealsById.set(appealId, record);
  appealIdByCase.set(caseId, appealId);
  return record;
}

export function getAppeal(appealId: string): MockAppealRecord | undefined {
  return appealsById.get(appealId);
}

export function getAppealByCase(caseId: string): MockAppealRecord | undefined {
  const id = appealIdByCase.get(caseId);
  return id ? appealsById.get(id) : undefined;
}

const STAGE_ORDER: MockAppealStage[] = ["submitted", "under_review", "decision"];

/** Advance the mock appeal to the next tracking stage (judges-only control). */
export function advanceAppeal(appealId: string): MockAppealRecord | undefined {
  const record = appealsById.get(appealId);
  if (!record) return undefined;
  const idx = STAGE_ORDER.indexOf(record.stage);
  if (idx < STAGE_ORDER.length - 1) {
    const next = STAGE_ORDER[idx + 1];
    record.stage = next;
    record.history.push({ stage: next, at: nowIso() });
  }
  return record;
}

/** Test/demo helper to reset state between runs. */
export function __resetMockStore(): void {
  feedbackByCase.clear();
  appealsById.clear();
  appealIdByCase.clear();
  appealCounter = 41;
}
