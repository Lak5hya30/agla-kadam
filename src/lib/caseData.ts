/**
 * Client-safe case registry (no zod, no analyses).
 * Safe to import into client components without bloating the bundle.
 */
import type { DemoCase } from "./types";

import partialCase from "@/fixtures/cases/partial-resolution.json";
import resolvedCase from "@/fixtures/cases/fully-resolved.json";
import stateCase from "@/fixtures/cases/state-jurisdiction.json";

const CASES: DemoCase[] = [
  partialCase as DemoCase,
  resolvedCase as DemoCase,
  stateCase as DemoCase,
];

export function listCases(): DemoCase[] {
  return CASES;
}

export function getCase(id: string): DemoCase | undefined {
  return CASES.find((c) => c.id === id);
}
