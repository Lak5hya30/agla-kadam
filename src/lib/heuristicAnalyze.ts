/**
 * Deterministic OFFLINE analyzer (no LLM).
 *
 * Produces a valid ResolutionAnalysis from raw grievance + response text
 * using sentence extraction and keyword-overlap matching. Used as a
 * graceful fallback for user-filed (ad-hoc) grievances when no OpenAI key
 * is configured, so the filing → checker flow still works end-to-end. It
 * is clearly labelled in the UI as a basic offline analysis, never as AI.
 *
 * Output is grounded (every source_span is a verbatim substring) and
 * passes the same Zod + cross-reference validation as AI output.
 */
import type { ResolutionAnalysis } from "./schema";
import type { CoverageStatus } from "./schema";

const STOPWORDS = new Set([
  "the", "a", "an", "of", "to", "and", "or", "is", "are", "was", "were", "be",
  "been", "being", "has", "have", "had", "in", "on", "for", "that", "this",
  "these", "those", "my", "our", "your", "their", "i", "we", "you", "it",
  "at", "by", "with", "as", "from", "into", "please", "kindly", "sir", "madam",
  "request", "requested", "grievance", "complaint", "also", "should", "would",
  "shall", "will", "may", "there", "here", "which", "who", "whom", "not",
  "so", "such", "any", "all", "some", "more", "very", "than", "then", "but",
]);

const COMPLETION_MARKERS = [
  "completed", "complete", "corrected", "resolved", "done", "rectified",
  "replaced", "repaired", "issued", "provided", "fixed", "closed", "granted",
  "refunded", "settled", "installed", "delivered",
];
const PROGRESS_MARKERS = [
  "initiated", "started", "begun", "approved", "sanctioned", "forwarded",
  "under", "process", "processing", "will", "shall", "being", "ongoing",
  "planned", "examined", "inspection", "inspected", "considered",
  "consideration", "noted", "registered", "transferred", "referred",
];
const REQUEST_CUES = [
  "request", "repair", "replace", "correct", "provide", "confirm", "refund",
  "issue", "fix", "remove", "install", "investigate", "action", "resolve",
  "return", "restore", "compensate", "reimburse", "update", "cancel", "grant",
];

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function sentences(text: string): string[] {
  return text
    .split(/\n+|(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.replace(/[^a-z0-9]/gi, "").length >= 3);
}

/** Extract citizen requests, preferring numbered list items. */
function extractRequests(grievance: string): { text: string; span: string }[] {
  const lines = grievance.split(/\n+/).map((l) => l.trim());
  const numbered: { text: string; span: string }[] = [];
  for (const line of lines) {
    const m = line.match(/^\d+[.)]\s+(.*)$/);
    if (m && m[1].trim().length > 0) {
      const span = m[1].trim();
      // Ensure verbatim presence (it is, as a substring of the line).
      numbered.push({ text: span, span });
    }
  }
  if (numbered.length > 0) return numbered;

  const sents = sentences(grievance);
  const cued = sents.filter((s) =>
    tokens(s).some((w) => REQUEST_CUES.includes(w))
  );
  const chosen = (cued.length > 0 ? cued : sents).slice(0, 6);
  return chosen.map((s) => ({ text: s, span: s }));
}

function classify(
  reqTokens: string[],
  actionTokens: string[][],
  actionTexts: string[]
): { status: CoverageStatus; evidenceIdx: number[]; confidence: number } {
  // Score each action by shared content words.
  let bestIdx = -1;
  let bestScore = 0;
  actionTokens.forEach((at, i) => {
    const set = new Set(at);
    const shared = reqTokens.filter((w) => set.has(w)).length;
    if (shared > bestScore) {
      bestScore = shared;
      bestIdx = i;
    }
  });

  if (bestIdx === -1 || bestScore === 0) {
    return { status: "not_addressed", evidenceIdx: [], confidence: 0.7 };
  }

  const overlapRatio = bestScore / Math.max(reqTokens.length, 1);
  const actionLower = actionTexts[bestIdx].toLowerCase();
  const hasCompletion = COMPLETION_MARKERS.some((m) => actionLower.includes(m));
  const hasProgress = PROGRESS_MARKERS.some((m) => actionLower.includes(m));

  let status: CoverageStatus;
  if (hasCompletion && !hasProgress) status = "addressed";
  else if (hasProgress) status = "partial";
  else if (hasCompletion) status = "addressed";
  else status = "unclear";

  const confidence = Math.min(
    0.85,
    0.55 + overlapRatio * 0.4 + (status === "unclear" ? -0.1 : 0)
  );
  return { status, evidenceIdx: [bestIdx], confidence: Math.max(0.5, confidence) };
}

export function heuristicAnalyze(
  grievance: string,
  response: string
): ResolutionAnalysis {
  let requests = extractRequests(grievance);
  if (requests.length === 0) {
    // Guarantee at least one request so the analysis is always well-formed.
    const fallback = grievance.trim().slice(0, 280) || "My grievance";
    requests = [{ text: fallback, span: fallback }];
  }
  const respSents = response.trim() ? sentences(response) : [];

  const original_requests = requests.map((r, i) => ({
    id: `r${i + 1}`,
    request: r.text,
    source_span: r.span,
  }));

  const response_actions = respSents.map((s, i) => ({
    id: `a${i + 1}`,
    action: s,
    source_span: s,
  }));

  const actionTokens = respSents.map((s) => tokens(s));

  const coverage = original_requests.map((req) => {
    const { status, evidenceIdx, confidence } = classify(
      tokens(req.request),
      actionTokens,
      respSents
    );
    const reason =
      status === "addressed"
        ? "The response appears to confirm this request was completed."
        : status === "partial"
          ? "The response mentions related action, but does not clearly confirm completion."
          : status === "not_addressed"
            ? "I could not find a matching statement about this request in the response."
            : "It is unclear from the response whether this request was addressed.";
    return {
      request_id: req.id,
      status,
      reason,
      response_evidence_ids: evidenceIdx.map((i) => `a${i + 1}`),
      confidence,
    };
  });

  const counts = coverage.reduce(
    (acc, c) => {
      acc[c.status] += 1;
      return acc;
    },
    { addressed: 0, partial: 0, not_addressed: 0, unclear: 0 } as Record<
      CoverageStatus,
      number
    >
  );
  const anyUnresolved =
    counts.partial + counts.not_addressed + counts.unclear > 0;

  const plain_language = anyUnresolved
    ? "Based on a basic offline comparison, the response does not fully confirm every request. Review the request-by-request assessment below."
    : "Based on a basic offline comparison, the response appears to address the requests made.";
  const plain_language_hi = anyUnresolved
    ? "एक बुनियादी ऑफ़लाइन तुलना के आधार पर, जवाब हर माँग की पूरी पुष्टि नहीं करता। नीचे माँग-दर-माँग आकलन देखें।"
    : "एक बुनियादी ऑफ़लाइन तुलना के आधार पर, जवाब माँगों को पूरा करता प्रतीत होता है।";

  const avgConf =
    coverage.reduce((s, c) => s + c.confidence, 0) /
    Math.max(coverage.length, 1);

  return {
    summary: {
      plain_language,
      plain_language_hi,
      confidence: Number(avgConf.toFixed(2)),
    },
    original_requests,
    response_actions,
    coverage,
    policy_questions: { needs_appeal_eligibility_check: anyUnresolved },
    unsupported_claims: [],
  };
}
