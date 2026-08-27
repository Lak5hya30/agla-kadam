"use client";

/**
 * Renders a block of text, optionally highlighting one or more verbatim
 * source spans (§42). Used to make AI findings explainable: "Show me where"
 * highlights the exact passage the assessment came from.
 */
import { useMemo } from "react";

interface Segment {
  text: string;
  highlight: boolean;
}

function buildSegments(text: string, spans: string[]): Segment[] {
  const active = spans.filter((s) => s && text.includes(s));
  if (active.length === 0) return [{ text, highlight: false }];

  // Find all match ranges, then merge/sort.
  const ranges: { start: number; end: number }[] = [];
  for (const span of active) {
    let from = 0;
    let idx = text.indexOf(span, from);
    while (idx !== -1) {
      ranges.push({ start: idx, end: idx + span.length });
      from = idx + span.length;
      idx = text.indexOf(span, from);
    }
  }
  ranges.sort((a, b) => a.start - b.start);

  const segments: Segment[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start < cursor) continue; // overlapping, skip
    if (r.start > cursor) {
      segments.push({ text: text.slice(cursor, r.start), highlight: false });
    }
    segments.push({ text: text.slice(r.start, r.end), highlight: true });
    cursor = r.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlight: false });
  }
  return segments;
}

export function EvidenceText({
  text,
  highlights = [],
  className = "",
}: {
  text: string;
  highlights?: string[];
  className?: string;
}) {
  const segments = useMemo(
    () => buildSegments(text, highlights),
    [text, highlights]
  );
  return (
    <p className={`whitespace-pre-line leading-relaxed ${className}`}>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <mark key={i} className="evidence-mark">
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </p>
  );
}
