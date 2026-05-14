## Anchor Pass 2 Date and Timezone Contract — 2026-05-12 14:05 EDT

### Phase
implementation

### Summary
Implemented `IMPLEMENTATION_PLAN.md` Pass 2 so daily-state routes use one user-local date contract instead of PostgreSQL `current_date`. Added date/timezone helper coverage, route-to-DB contract tests, and SQL-backed persistence evidence for routine instances, daily plans, and daily focus plans.

### Files Created/Modified

| File | Purpose |
|------|---------|
| `PLAN.md` | Pass 2 execution checklist |
| `server/dates.js` | Shared date and timezone validation/resolution helper |
| `server/app.js` | Resolves daily date options per authenticated daily route |
| `server/db.js` | Uses supplied `localDate` for daily routine, plan, and focus-plan queries/writes |
| `tests/unit/date-contract.test.js` | Timezone, explicit-date, and DST unit coverage |
| `tests/api/pass2-timezone-contract.test.js` | Route contract and SQL-backed daily persistence tests |
| `review/agent-pass2-timezone-PLAN.md` | Agent pre-task verification plan |
| `review/agent-pass2-timezone-report.md` | Agent pre-task verification report |
| `CAPABILITY_LEDGER.md` | Pass 2 capability and evidence record |
| `context_history/context_index.md` | Indexed this session summary |
| `context_history/contexts/2026-05-12_anchor-pass2-date-timezone-contract.md` | Session summary and handoff |

### Key Decisions
- `user_profiles.timezone` is the source of truth once onboarding profile exists.
- `users.timezone` is the fallback; explicit request timezone is only a fallback before profile timezone exists.
- `date=YYYY-MM-DD` can override the derived local date for supported daily routes.
- Daily bucket dates are plain `YYYY-MM-DD` values passed into SQL parameters; instant timestamps remain UTC instants.
- Direct `server/db.js` method calls keep backward compatibility by falling back to SQL `current_date` only when no date options are supplied.

### Technical Details
`server/dates.js` validates real calendar dates, validates IANA timezones, resolves timezone precedence, and derives local dates with `Intl.DateTimeFormat` so the same UTC instant can map to different user-local dates. `server/app.js` resolves `{ localDate, timezone }` once per daily route and threads it into bootstrap, routine setup, anchor completion, reset, and focus-plan handlers. `server/db.js` now parameterizes daily `date` columns through those options for `routine_instances.instance_date`, `daily_plans.plan_date`, and `daily_focus_plans.plan_date`.

### Testing/Verification
- RED: `bun test tests/unit/date-contract.test.js tests/api/pass2-timezone-contract.test.js` failed on missing `server/dates.js` and missing date options passed to DB helpers.
- GREEN targeted: `bun test tests/unit/date-contract.test.js tests/api/pass2-timezone-contract.test.js` passed: 6 tests, with 3 SQL-backed tests skipped when `TEST_DATABASE_URL` was not set.
- SQL-backed: `createdb anchor_pass2_timezone_test && TEST_DATABASE_URL=postgres://localhost:5432/anchor_pass2_timezone_test bun test tests/api/pass2-timezone-contract.test.js` passed: 3 tests. The disposable database was dropped afterward.
- Broader unit/API: `bun run test` passed: 69 tests, 3 SQL-backed tests skipped without `TEST_DATABASE_URL`.
- Broader browser: `PORT=3212 bun run test:browser` passed: 45 tests, 1 live OpenAI test skipped by default.

### State
completed

### Next Steps
- Start `IMPLEMENTATION_PLAN.md` Pass 3: Canonical `GET /api/today`.
- Pass 3 should reuse the Pass 2 helper and DB date options instead of reintroducing `current_date`.
- Consider adding explicit `400` handling for malformed `date` query params when canonical Today route is added.

### Related Files
- `IMPLEMENTATION_PLAN.md`
- `server/dates.js`
- `tests/api/pass2-timezone-contract.test.js`
