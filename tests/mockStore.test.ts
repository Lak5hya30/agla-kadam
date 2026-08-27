import { describe, it, expect, beforeEach } from "vitest";
import {
  recordFeedback,
  getFeedback,
  submitAppeal,
  getAppeal,
  advanceAppeal,
  __resetMockStore,
} from "@/lib/mockStore";

describe("mock backend store", () => {
  beforeEach(() => __resetMockStore());

  it("records feedback and marks appeal_eligible for poor rating", () => {
    const rec = recordFeedback("DEMO-001", "poor", ["a", "b"]);
    expect(rec.mock).toBe(true);
    expect(rec.status).toBe("feedback_recorded");
    expect(rec.next_state).toBe("appeal_eligible");
    expect(getFeedback("DEMO-001")?.rating).toBe("poor");
  });

  it("marks journey_complete for satisfied rating", () => {
    const rec = recordFeedback("DEMO-002", "satisfied", []);
    expect(rec.next_state).toBe("journey_complete");
  });

  it("issues a demo appeal id in AGLA-DEMO-YYYY-NNNN format", () => {
    const rec = submitAppeal("DEMO-001", "some appeal text");
    expect(rec.mock).toBe(true);
    expect(rec.appealId).toMatch(/^AGLA-DEMO-\d{4}-\d{4}$/);
    expect(rec.stage).toBe("submitted");
    expect(getAppeal(rec.appealId)?.caseId).toBe("DEMO-001");
  });

  it("advances stages submitted -> under_review -> decision and stops", () => {
    const rec = submitAppeal("DEMO-001", "text");
    const id = rec.appealId;
    expect(advanceAppeal(id)?.stage).toBe("under_review");
    expect(advanceAppeal(id)?.stage).toBe("decision");
    // no further stage
    expect(advanceAppeal(id)?.stage).toBe("decision");
    expect(getAppeal(id)?.history.length).toBe(3);
  });

  it("returns undefined when advancing an unknown appeal", () => {
    expect(advanceAppeal("NOPE")).toBeUndefined();
  });
});
