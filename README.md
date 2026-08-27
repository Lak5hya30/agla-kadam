# Agla Kadam

**Disposed doesn't always mean resolved.**

> Agla Kadam compares a citizen's grievance with the department's response, explains what was actually addressed, identifies what remains unclear, and safely guides the citizen toward the correct next step.

**Understand the response. Know your next step.**

> ⚠️ **Hackathon demo using synthetic grievance data. Not affiliated with CPGRAMS or the Government of India.**

---

## Problem

CPGRAMS (the Centralised Public Grievance Redress and Monitoring System) already
has sophisticated grievance **intake and routing**. The gap is not filing a
grievance — it is what happens **after the reply arrives**.

A citizen sees:

```
STATUS: DISPOSED
```

…but still does not know: *Did they actually solve my problem? What exactly did
they respond to? What did they not respond to? Do I need to wait, give feedback,
appeal, or file fresh?*

That decision gap is the product.

## Why CPGRAMS

CPGRAMS processes millions of grievances. "Disposed" is a database state, not an
explanation. The response text is often bureaucratic and hard to map back to the
original request. This is exactly where a language model's semantic understanding
helps — and exactly where deterministic rules must stay in charge of workflow.

## Product insight

The memorable screen is **"What you asked vs what they answered"** — a
request-by-request comparison:

```
YOU ASKED             DEPARTMENT SAID            ASSESSMENT
Repair the road       "repair work initiated"    ◐ Partly addressed
Replace barrier       (no matching response)     ! Not addressed
Confirm completion    (no completion date)       ? Unclear
```

Every assessment links back to the exact source passage ("Show me where").

## Citizen journey

```
Landing → Choose demo case → Grievance marked DISPOSED → Read grievance + reply
→ Check resolution (OpenAI) → Request-by-request comparison + evidence
→ "Resolved?" → deterministic Next Action → Feedback → Appeal eligibility
→ Source-backed appeal draft → Human verification → Mock submission
→ Reference number → Tracking timeline
```

The complete journey works. No dead-end buttons.

## OpenAI role (what the model does)

The OpenAI model performs **semantic** work only:

- decompose the grievance into individual requests
- extract the department's actions/statements
- match requests to responses
- classify coverage as exactly one of `addressed | partial | not_addressed | unclear`
- preserve qualifiers (never turns "initiated" into "completed")
- produce a citizen-friendly summary in English **and** simple Hindi
- attach a verbatim `source_span` to every finding

Output is forced into a **strict Zod schema** and re-validated with
cross-reference checks before the UI trusts it.

## Deterministic safeguards (what the model never decides)

A plain, unit-tested **policy engine** — not the LLM — decides workflow:

- jurisdiction handling (State/UT cases never get the Central appeal route)
- appeal window / deadlines
- feedback state
- whether the appeal button is even available
- reference-number issuance and case state

The appeal **draft** is composed deterministically from validated, source-mapped
structured data, so it is grounded by construction and cannot hallucinate facts.

## Architecture

```
OpenAI  →  semantic understanding (compare documents, extract, classify)
Rules   →  deterministic policy (jurisdiction, deadlines, availability, state)
Citizen →  reviews every finding and confirms
Mock    →  simulates the government action (feedback / appeal / tracking)
```

- **Next.js 14 (App Router) + TypeScript + Tailwind**
- Server-only OpenAI calls (`src/lib/analyze.ts`)
- Zod structured-output validation (`src/lib/schema.ts`)
- Deterministic policy engine (`src/lib/policyEngine.ts`)
- Explicit application state machine (`src/lib/stateMachine.ts`)
- In-memory mock backend (`src/lib/mockStore.ts`)

## Synthetic data

Three synthetic cases live in `src/fixtures/cases/`, each with a cached analysis
in `src/fixtures/analyses/`:

| Case | Scenario | Demonstrates |
| --- | --- | --- |
| DEMO-001 | Road repair & barrier | Partial / not-addressed / unclear → appeal path |
| DEMO-002 | Service record correction | Genuinely resolved → **no appeal encouraged** |
| DEMO-003 | Street lighting (State) | Jurisdiction safeguard → no Central appeal |

## What is real

Citizen UI · OpenAI grievance-response comparison · request extraction ·
evidence highlighting · Hindi explanation · deterministic policy engine ·
state machine · accessibility · evidence mapping.

## What is mocked

Feedback submission · appeal submission · appeal tracking. **Not used:** CPGRAMS
login, any government API, any real citizen data. See
[`docs/mock-vs-real.md`](docs/mock-vs-real.md).

## Safety / privacy

No government API access, no real grievance IDs, no Aadhaar/PAN/OTP/payment, no
government credentials, no autonomous government actions. The model makes no legal
determinations. See [`docs/safety.md`](docs/safety.md).

## Accessibility

Mobile-first (360px+), 44px touch targets, 16px+ body text, keyboard navigation,
visible focus, semantic headings, skip link, status communicated by **icon +
label** (never colour alone), reduced-motion support, English/Hindi, read-aloud.

## Codex / AI-assisted development

The runtime **meaningfully uses an OpenAI model** for the resolution analysis
(the hard semantic problem). Development was AI-assisted; see
[`docs/codex-build-log.md`](docs/codex-build-log.md) for an honest log.

## Running locally

```bash
npm install
npm run dev
# open http://localhost:3000  (or ?demo=1 to jump straight into DEMO-001)
```

The demo works **without an OpenAI key** — it falls back to cached analysis
fixtures and clearly labels them as such. To enable live analysis:

```bash
cp .env.example .env.local
# set OPENAI_API_KEY=sk-...
```

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `OPENAI_API_KEY` | Enables live analysis (server-side only). Omit to use fixtures. | — |
| `OPENAI_MODEL` | Model id for analysis. | `gpt-4o-mini` |
| `DEMO_APPEAL_WINDOW_DAYS` | Demo appeal window used by the policy engine. | `30` |

The key is used **only** server-side and is never sent to the browser.

## Testing

```bash
npm test         # unit tests: policy engine, schema validator, state machine,
                 # fixtures, appeal composer, mock store, prompt/injection safety
npm run typecheck
npm run lint
npm run build
```

## Deployment

Deploy to Vercel (or any Node host). Set `OPENAI_API_KEY` as an environment
variable for live analysis; without it the demo still works via fixtures. The
demo needs no authentication and works in incognito. Add `?demo=1` for a
zero-config judge entry point.
