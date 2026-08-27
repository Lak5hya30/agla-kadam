"use client";

/**
 * Resolve a case by id for client pages: a curated fixture case, or the
 * ad-hoc user-filed case (USER-DRAFT) from sessionStorage. Avoids a
 * hydration mismatch by loading the ad-hoc case only after mount.
 */
import { useEffect, useState } from "react";
import { getCase } from "./caseData";
import { ADHOC_ID, loadAdhocCase } from "./adhocCase";
import type { DemoCase } from "./types";

export function useResolvedCase(id: string): {
  demoCase: DemoCase | undefined;
  ready: boolean;
} {
  const fixture = getCase(id);
  const [demoCase, setDemoCase] = useState<DemoCase | undefined>(fixture);
  const [ready, setReady] = useState<boolean>(Boolean(fixture));

  useEffect(() => {
    const f = getCase(id);
    if (f) {
      setDemoCase(f);
      setReady(true);
      return;
    }
    if (id === ADHOC_ID) {
      setDemoCase(loadAdhocCase() ?? undefined);
    }
    setReady(true);
  }, [id]);

  return { demoCase, ready };
}
