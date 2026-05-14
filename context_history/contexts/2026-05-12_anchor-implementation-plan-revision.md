## Anchor Implementation Plan Revision — 2026-05-12

### Phase
planning

### Summary
Revised `IMPLEMENTATION_PLAN.md` from the agent-team gap review so it is more decision-complete for execution. The update keeps the V1 completion direction but fixes dashboard status compatibility, Gate 0 decision records, oversized pass sequencing, SQL-backed verification, browser proof requirements, frontend modularization, and cross-pass data ownership.

### Files Created/Modified

| File | Purpose |
|------|---------|
| `IMPLEMENTATION_PLAN.md` | Rewritten execution-ready V1 completion plan with 25 smaller passes |
| `context_history/contexts/2026-05-12_anchor-implementation-plan-revision.md` | Session summary for this plan revision |
| `context_history/context_index.md` | Indexed this session summary |

### Key Decisions
- Preserved dashboard `status` values as `todo`, `active`, and `done`; prototype/fixture/blocking detail now belongs in metadata, task notes, or ledger evidence unless `SPEC.md` is revised.
- Expanded Gate 0 into an auditable decision table with owner/reviewer/date/evidence/blocking fields and defaults for calendar scope, streaks/rewards, therapist sharing, PDF/export, transcript retention, and notification delivery.
- Split oversized passes: Today is now date contract, canonical API, and frontend migration; Offline is queue wrapper, backend applicator, conflict/idempotency, and PWA shell; Notifications is permission UI, scheduling, and optional Web Push delivery.
- Added SQL-backed verification and red/green/refactor evidence requirements to every persistence-changing pass.
- Added a cross-pass data ownership matrix so new tables/artifacts cannot be introduced without export/delete/retain/anonymize/audit behavior.

### Technical Details
The revised plan now has 25 passes. It adds concrete interface defaults for `GET /api/today`, safety plan/event routes, support-contact normalization, safety episodes, session export artifacts, scoped sharing if approved, offline mutation replay, notification delivery, and frontend module boundaries. It also moves privacy/export/delete obligations from one late pass into a matrix that every schema-changing pass must update.

### Testing/Verification
- Re-read the revised plan and checked pass structure with `rg '^### Pass ' IMPLEMENTATION_PLAN.md`.
- Ran `git diff --check -- IMPLEMENTATION_PLAN.md`; no whitespace errors were reported.
- No product tests were run because this was a documentation/planning-only change.

### State
completed

### Next Steps
- Start Pass 1 from `IMPLEMENTATION_PLAN.md`: dashboard artifact contract tests, metadata-aware evidence labels, and ledger/README truthfulness cleanup.
- Keep Gate 0 visible until owner/evidence exists for product, clinical, legal, retention, sharing, and notification decisions.

### Related Files
- `IMPLEMENTATION_PLAN.md`
- `review/agent-final-plan-qa-report.md`
- `context_history/contexts/2026-05-12_anchor-v1-gap-review-plan.md`
