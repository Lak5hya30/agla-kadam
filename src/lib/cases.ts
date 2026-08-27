/**
 * Synthetic case registry + cached-analysis loader.
 *
 * All data here is SYNTHETIC. No real citizens, grievance IDs, or
 * government records. Cases and their cached analyses are validated at
 * load time so a corrupted fixture is caught early (§29, §46).
 */
import type { DemoCase } from "./types";
import { parseAnalysis, type ResolutionAnalysis } from "./schema";

import partialCase from "@/fixtures/cases/partial-resolution.json";
import resolvedCase from "@/fixtures/cases/fully-resolved.json";
import stateCase from "@/fixtures/cases/state-jurisdiction.json";

import partialAnalysis from "@/fixtures/analyses/partial-resolution.json";
import resolvedAnalysis from "@/fixtures/analyses/fully-resolved.json";
import stateAnalysis from "@/fixtures/analyses/state-jurisdiction.json";

const CASES: DemoCase[] = [
  partialCase as DemoCase,
  resolvedCase as DemoCase,
  stateCase as DemoCase,
];

const CACHED_ANALYSES: Record<string, unknown> = {
  "DEMO-001": partialAnalysis,
  "DEMO-002": resolvedAnalysis,
  "DEMO-003": stateAnalysis,
};

export function listCases(): DemoCase[] {
  return CASES;
}

export function getCase(id: string): DemoCase | undefined {
  return CASES.find((c) => c.id === id);
}

/**
 * Load and validate the cached analysis for a case. Throws if the fixture
 * is missing or fails schema validation — this is caught by the API layer
 * and surfaced as a polished error, never a raw stack trace.
 */
export function getCachedAnalysis(id: string): ResolutionAnalysis {
  const raw = CACHED_ANALYSES[id];
  if (raw === undefined) {
    throw new Error(`No cached analysis fixture for case "${id}"`);
  }
  const parsed = parseAnalysis(raw);
  if (!parsed.ok) {
    throw new Error(`Corrupted analysis fixture for case "${id}": ${parsed.error}`);
  }
  return parsed.analysis;
}
