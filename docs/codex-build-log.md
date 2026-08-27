# AI-assisted build log

This project was built with an AI coding assistant (pair-programming style). The
log below records **actual** work performed, not fabricated history. It also
records where human/product judgement overrode or corrected the initial output.

The runtime itself **meaningfully uses an OpenAI model** for the resolution
analysis — the hard semantic problem of matching arbitrary natural-language
requests to arbitrary natural-language responses (see `src/lib/analyze.ts`,
`src/lib/prompt.ts`, `src/lib/schema.ts`).

---

## Feature: Domain model, policy engine, schema (Phase 1)

**AI contribution**
- Authored TypeScript domain types, the Zod structured-output schema with
  cross-reference validation, the deterministic policy engine, and the state
  machine.
- Generated the unit tests (policy branches, schema validator, state machine,
  fixture integrity).

**Human review**
- Required State/UT jurisdiction cases to **never** expose the Central appeal
  route; added the explicit safeguard branch and its test.
- Made appeal-window boundary inclusive and injectable (`now`) for deterministic
  tests.

## Feature: Resolution comparison engine (Phase 3)

**AI contribution**
- Built `POST /api/analyze-resolution`, the server-only OpenAI call with strict
  structured output, and re-validation via `parseAnalysis`.
- Implemented the cached-fixture fallback path.

**Human review**
- Insisted the UI **never** presents cached content as live AI — added the
  explicit "Cached demo analysis" badge and fallback banner.
- Tuned the confidence handling (mid-band caution, low-confidence → Unclear) so
  the product does not overstate certainty.

## Feature: Evidence UX & request–response comparison (Phase 4)

**AI contribution**
- Built the comparison cards, the "Show me where" evidence highlighter, and the
  source-span marking.

**Human review**
- Enforced neutral, non-accusatory language throughout (no "ignored", "failed",
  "negligent"); verified via `tests/appeal.test.ts`.

## Feature: Grounded appeal workflow (Phase 5)

**AI contribution**
- Implemented the unresolved-item selector and the appeal composer.

**Human review**
- Made appeal drafting **deterministic and source-mapped by construction** rather
  than free-form generation, so it cannot invent dates, events, losses or
  accusations — every paragraph carries a source reference.
- Ensured a fully-resolved case yields **no** unresolved items, so the product
  never encourages an unnecessary appeal.

## Feature: Accessibility, Hindi, low-bandwidth (Phase 6)

**AI contribution**
- Added the bilingual dictionary, read-aloud (browser speech synthesis),
  language switcher, skip link, and status-by-icon+label.

**Human review**
- Removed colour-only status signalling; every status pairs an icon and a text
  label.

## QA fixes found during live testing

- **sessionStorage hydration bug:** checkbox state on the feedback and appeal
  screens initialised from journey state before hydration completed, leaving the
  "Generate appeal draft" button disabled. Fixed by switching to
  default-checked ("included unless explicitly unchecked") semantics.
- Verified the full journey end-to-end in a browser across all three cases and
  both languages before shipping.

## Injection safety

- Added an explicit rule that grievance/response text is untrusted data, wrapped
  the documents in delimiters, and added `tests/prompt.test.ts` coverage.
