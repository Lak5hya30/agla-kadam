"use client";

/**
 * Client-side journey state (§34).
 *
 * Mirrors the citizen's progress through one case so the flow is smooth
 * and reliable even on serverless hosting where in-memory server state may
 * not persist across requests. Persisted to sessionStorage per case.
 * Transitions are guarded by the shared state machine.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ResolutionAnalysis } from "@/lib/schema";
import type { AnalysisSource } from "@/lib/analyze";
import type { FeedbackStatus, MockAppealStage } from "@/lib/types";

export interface JourneyState {
  caseId: string;
  analysis?: ResolutionAnalysis;
  analysisSource?: AnalysisSource;
  fallbackReason?: string;
  resolvedChoice?: "resolved" | "unresolved";
  feedbackRating?: FeedbackStatus;
  unresolvedPoints?: string[];
  selectedRequestIds?: string[];
  appealText?: string;
  appealId?: string;
  appealStage?: MockAppealStage;
  appealHistory?: { stage: MockAppealStage; at: string }[];
}

interface JourneyContextValue {
  state: JourneyState;
  update: (patch: Partial<JourneyState>) => void;
  reset: () => void;
}

const JourneyContext = createContext<JourneyContextValue | null>(null);

function storageKey(caseId: string) {
  return `agla-kadam.journey.${caseId}`;
}

export function JourneyProvider({
  caseId,
  children,
}: {
  caseId: string;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<JourneyState>({ caseId });

  // Hydrate from sessionStorage on mount.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey(caseId));
      if (raw) {
        const parsed = JSON.parse(raw) as JourneyState;
        if (parsed.caseId === caseId) setState(parsed);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const persist = useCallback((next: JourneyState) => {
    try {
      sessionStorage.setItem(storageKey(next.caseId), JSON.stringify(next));
    } catch {
      /* ignore quota / privacy mode */
    }
  }, []);

  const update = useCallback(
    (patch: Partial<JourneyState>) => {
      setState((prev) => {
        const next = { ...prev, ...patch, caseId };
        persist(next);
        return next;
      });
    },
    [caseId, persist]
  );

  const reset = useCallback(() => {
    const fresh = { caseId };
    setState(fresh);
    persist(fresh);
  }, [caseId, persist]);

  const value = useMemo(
    () => ({ state, update, reset }),
    [state, update, reset]
  );

  return (
    <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
  );
}

export function useJourney(): JourneyContextValue {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney must be used within JourneyProvider");
  return ctx;
}
