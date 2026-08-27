import { describe, it, expect } from "vitest";
import { unresolvedItems, composeAppeal } from "@/lib/appeal";
import { getCachedAnalysis } from "@/lib/cases";

describe("appeal composer — grounding & no unnecessary appeals", () => {
  const analysis = getCachedAnalysis("DEMO-001");

  it("includes partial, not_addressed and unclear (excludes addressed)", () => {
    const items = unresolvedItems(analysis);
    const ids = items.map((i) => i.requestId);
    expect(ids).toContain("r1"); // partial
    expect(ids).toContain("r2"); // not_addressed
    expect(ids).toContain("r3"); // unclear
  });

  it("a fully-resolved case yields NO unresolved items (no appeal encouraged)", () => {
    const resolved = getCachedAnalysis("DEMO-002");
    expect(unresolvedItems(resolved)).toHaveLength(0);
  });

  it("composes an appeal only from selected items", () => {
    const appeal = composeAppeal(analysis, ["r2"]);
    // barrier request appears; road/completion sentences do not
    expect(appeal.plainText).toContain("roadside barrier".toLowerCase());
    // Only one grounded item sentence besides fixed opening/requests/closing
    const itemSentences = appeal.paragraphs.filter((p) =>
      p.text.startsWith("Regarding")
    );
    expect(itemSentences).toHaveLength(1);
  });

  it("every paragraph carries a source reference", () => {
    const appeal = composeAppeal(analysis, ["r1", "r2", "r3"]);
    for (const p of appeal.paragraphs) {
      expect(p.source.length).toBeGreaterThan(0);
    }
  });

  it("does not convert 'initiated' into 'completed' language", () => {
    const appeal = composeAppeal(analysis, ["r1"]);
    expect(appeal.plainText.toLowerCase()).not.toContain("completed the");
    // partial item is described as 'does not confirm completion'
    expect(appeal.plainText).toContain("does not confirm completion");
  });

  it("never invents accusatory language", () => {
    const appeal = composeAppeal(analysis, ["r1", "r2", "r3"]);
    const lower = appeal.plainText.toLowerCase();
    for (const banned of ["ignored", "negligent", "illegal", "failed", "unlawful"]) {
      expect(lower).not.toContain(banned);
    }
  });
});
