## Anchor V1 Gap Review and Implementation Plan — 2026-05-12 12:07

### Phase
planning

### Summary
Completed an agent-team review of Anchor against `PRD.md`, `SPEC.md`, `vertical-slice-dashboard.html`, vertical-slice JSON artifacts, `CAPABILITY_LEDGER.md`, and the current codebase. The result is `IMPLEMENTATION_PLAN.md`, a revised vertical-slice plan for converting prototype-only or UI-only surfaces into real V1 functionality.

### Files Created/Modified

| File | Purpose |
|------|---------|
| `PLAN.md` | Root execution checklist for this review session |
| `IMPLEMENTATION_PLAN.md` | New V1 completion plan with Gate 0, dependency rules, and 16 vertical slices |
| `agent-pretask-verification.md` | Repository shape, stack, test command, and risk verification |
| `review/agent-requirements-report.md` | PRD/SPEC requirement extraction and required/optional/ambiguous classification |
| `review/agent-ui-pseudo-report.md` | UI/dashboard pseudo-functionality review |
| `review/agent-backend-report.md` | Backend/data route, database, placeholder, and test review |
| `review/agent-qa-report.md` | Tests, ledger, and artifact QA review |
| `review/agent-final-plan-qa-report.md` | Final QA of the drafted implementation plan |
| `context_history/context_index.md` | Indexed this session summary |

### Key Decisions
- Treat Anchor as a strong runnable prototype, not V1-complete: Several dashboard/ledger `done` states are deterministic, fixture-bound, JSON-only, settings-only, or UI-only.
- Start implementation with truthful status artifacts: Pass 1 should add label-aware dashboard/artifact tests and downgrade misleading `done` states before building more product behavior.
- Add non-code Gate 0 before V1 completion claims: clinical, legal, retention, sharing, account-mode, and diary-default decisions need owner/evidence.
- Enforce dependencies before parallel work: Safety Plan before Safety Guardian; Safety Guardian before Coach/Voice; Diary Target Hierarchy before Insights/Packets; Chain Analysis before Session Packets; Coach/Voice/Packets before Privacy Export/Delete.
- Keep vertical-slice execution strict: each pass must have red tests first, browser coverage, data/API behavior where needed, dashboard/ledger updates, and verified runnable state.

### Technical Details
High-priority gaps identified: missing `GET /api/today`, `GET/PUT /api/safety-plan`, and `POST /api/safety-events`; deterministic text coach, safety classifier, voice client-secret, insights, weekly review, and offline sync; incomplete privacy export/delete with stale hard-coded deletion date `2026-05-05T00:00:00.000Z`; notification UI that only saves preferences; offline capture that uses a synthetic mutation tester; fixed April 2026 dates for insights/exports; JSON-only session packet exports with no scoped share links; narrow diary target schema; and insufficient browser evidence for export downloads, deletion persistence, PWA cache boundaries, and fast-use acceptance.

The final `IMPLEMENTATION_PLAN.md` contains Gate 0 plus these vertical slices: truthful status/evidence baseline, Today command API, Safety Plan/Safety Events, Safety Guardian state machine, Text Coach orchestration, Voice client-secret/retention/controls, Diary target hierarchy, Derived Insights, Chain Analysis completion, Session Packet PDF/sharing, Complete Privacy Export/Delete, Real Offline Capture/App Shell, Notifications, Skills Library completion, Accessibility/Fast-Use QA, and Production Readiness/Abuse Controls.

### Testing/Verification
- Used NotebookLM cross-notebook query and found `Project Memory - dbt - local` with prior project decisions and risks.
- Delegated five review lanes and read their reports.
- Final plan QA initially found seven required fixes; those were incorporated into `IMPLEMENTATION_PLAN.md`.
- Did not run the full product test suite in the lead lane because this was a planning/review task. The backend review agent separately ran `bun test tests/api` and reported 53 passing tests.

### State
completed

### Next Steps
- Start `IMPLEMENTATION_PLAN.md` Pass 1: add label-aware dashboard artifact tests, downgrade misleading `done` states, and update ledger/README wording.
- Keep Gate 0 visible until clinical/legal/retention/sharing decisions have owner/evidence.
- Do not implement export/privacy assertions in Pass 1; reserve full export body, redaction, deletion persistence, and artifact invalidation tests for the relevant later vertical slices.

### Related Files
- `IMPLEMENTATION_PLAN.md`
- `review/agent-requirements-report.md`
- `review/agent-ui-pseudo-report.md`
- `review/agent-backend-report.md`
- `review/agent-qa-report.md`
- `review/agent-final-plan-qa-report.md`
