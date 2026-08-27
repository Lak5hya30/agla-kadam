/**
 * Analysis loader for synthetic cases (server-oriented; pulls in zod).
 * Case listing/lookup lives in `caseData.ts` (client-safe).
 *
 * All data here is SYNTHETIC. No real citizens, grievance IDs, or
 * government records. Cached analyses are validated at load time so a
 * corrupted fixture is caught early (§29, §46).
 */
import { parseAnalysis, type ResolutionAnalysis } from "./schema";

import partialAnalysis from "@/fixtures/analyses/partial-resolution.json";
import resolvedAnalysis from "@/fixtures/analyses/fully-resolved.json";
import stateAnalysis from "@/fixtures/analyses/state-jurisdiction.json";

export { listCases, getCase } from "./caseData";

const CACHED_ANALYSES: Record<string, unknown> = {
  "DEMO-001": partialAnalysis,
  "DEMO-002": resolvedAnalysis,
  "DEMO-003": stateAnalysis,
};

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
