# What is real and what is mocked

Honesty about this boundary is a core design goal. The same table is shown to
users in-app at `/how`.

| Capability | Status |
| --- | --- |
| Citizen UI | **Real** |
| OpenAI grievance-response comparison | **Real** |
| Request extraction | **Real** |
| Evidence highlighting | **Real** |
| Hindi explanation | **Real** |
| Deterministic policy engine | **Real** |
| Application state machine | **Real** |
| Accessibility / mobile / read-aloud | **Real** |
| Feedback submission | **Mock** |
| Appeal submission | **Mock** |
| Appeal tracking | **Mock** |
| CPGRAMS login | **Not used** |
| Government API integration | **Not used** |
| Citizen data | **Synthetic** |

## Real, in detail

- **Web experience** — the full citizen journey is implemented and navigable.
- **OpenAI analysis** — when `OPENAI_API_KEY` is set, the app calls the model to
  compare the grievance and response and returns a validated structured analysis.
  Without a key it uses cached fixtures and labels them "Cached demo analysis".
- **User grievance filing** — the "Lodge a grievance" form lets a citizen enter
  their own grievance (and optional department response) and run the checker.
  With a key this uses OpenAI; without a key it falls back to a deterministic
  **offline keyword comparison**, clearly labelled "Offline comparison" and never
  presented as AI. Collects no personal identifiers.
- **Structured output** — enforced by a Zod schema plus cross-reference checks.
- **Policy logic** — jurisdiction, appeal window, feedback gating, availability.
- **State machine** — invalid transitions (e.g. DISPOSED → APPEAL_SUBMITTED) are
  rejected.
- **Evidence mapping** — every finding links to a verbatim source span.
- **Language generation** — plain-English and simple-Hindi summaries.

## Mock, in detail

Backed by an in-memory store (`src/lib/mockStore.ts`). Nothing reaches a real
system. Every record is tagged `mock: true`.

- **Feedback submission** — `POST /api/mock/feedback` records a synthetic rating
  and returns `{ mock: true, status: "feedback_recorded", next_state: ... }`.
- **Appeal submission** — `POST /api/mock/appeals` issues a demo reference like
  `AGLA-DEMO-2026-0042`.
- **Appeal tracking** — `POST /api/mock/appeals/:id/advance` moves a synthetic
  status through Submitted → Under review → Decision (a judges-only control).

## Not used

- **CPGRAMS account / login** — none. There is no field to enter one.
- **Government API integration** — none. No live government system is contacted.
- **Real citizen identity** — none. All data is synthetic.

## API surface

```
GET  /api/demo/cases
GET  /api/demo/cases/:id
POST /api/analyze-resolution      (real: OpenAI or cached fallback)
POST /api/mock/feedback           (mock)
POST /api/appeals/preview         (real: deterministic, source-mapped compose)
POST /api/mock/appeals            (mock)
GET  /api/mock/appeals/:id        (mock)
POST /api/mock/appeals/:id/advance (mock)
```
