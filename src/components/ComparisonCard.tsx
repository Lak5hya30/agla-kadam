"use client";

import { useState } from "react";
import { useLang } from "./LanguageProvider";
import { StatusBadge } from "./StatusBadge";
import { EvidenceText } from "./EvidenceText";
import type { DisplayCoverage } from "@/lib/schema";
import type { OriginalRequest, ResponseAction } from "@/lib/schema";

export function ComparisonCard({
  index,
  coverage,
  request,
  actions,
  responseText,
  grievanceText,
}: {
  index: number;
  coverage: DisplayCoverage;
  request: OriginalRequest;
  actions: ResponseAction[];
  responseText: string;
  grievanceText: string;
}) {
  const { t, lang } = useLang();
  const [show, setShow] = useState<"none" | "response" | "request">("none");

  const hasResponseEvidence = actions.length > 0;
  const responseSpans = actions.map((a) => a.source_span);
  const hi = lang === "hi";
  const requestText = hi && request.request_hi ? request.request_hi : request.request;
  const reasonText = hi && coverage.reason_hi ? coverage.reason_hi : coverage.reason;

  return (
    <article className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-ink">
          <span className="text-ink-faint">{index}. </span>
          {requestText}
        </h3>
        <StatusBadge status={coverage.displayStatus} className="shrink-0" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-surface-soft p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("analysis.youAsked")}
          </p>
          <p className="text-sm text-ink">{requestText}</p>
        </div>
        <div className="rounded-xl bg-surface-soft p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("analysis.theySaid")}
          </p>
          {hasResponseEvidence ? (
            <ul className="space-y-1 text-sm text-ink">
              {actions.map((a) => (
                <li key={a.id}>• {hi && a.action_hi ? a.action_hi : a.action}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm font-medium text-status-missing">
              {t("analysis.noMatch")}
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {t("analysis.why")}
        </p>
        <p className="text-sm text-ink-soft">{reasonText}</p>
        {coverage.caution && (
          <p className="mt-1 text-xs font-medium text-status-partial">
            ⚠ {t("status.caution")}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {hasResponseEvidence ? (
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() =>
              setShow((s) => (s === "response" ? "none" : "response"))
            }
            aria-expanded={show === "response"}
          >
            {show === "response" ? t("analysis.hideEvidence") : t("analysis.showWhere")}
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() =>
              setShow((s) => (s === "request" ? "none" : "request"))
            }
            aria-expanded={show === "request"}
          >
            {show === "request" ? t("analysis.hideEvidence") : t("analysis.showRequest")}
          </button>
        )}
      </div>

      {show === "response" && (
        <div className="rounded-xl border border-black/5 bg-white p-3 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("case.response")}
          </p>
          <EvidenceText text={responseText} highlights={responseSpans} className="text-ink" />
        </div>
      )}
      {show === "request" && (
        <div className="rounded-xl border border-black/5 bg-white p-3 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {t("case.grievance")}
          </p>
          <EvidenceText
            text={grievanceText}
            highlights={[request.source_span]}
            className="text-ink"
          />
        </div>
      )}
    </article>
  );
}
