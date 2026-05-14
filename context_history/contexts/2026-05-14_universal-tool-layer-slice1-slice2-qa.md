## Universal Tool Layer Slice 1/Slice 2 QA — 2026-05-14

### Scope
Reviewed the current Slice 1/Slice 2 implementation for:

- `CAPABILITY_TOOL_MATRIX.md`
- `tests/unit/capability-tool-matrix.test.js`
- `tests/api/pass2-timezone-contract.test.js`
- `tests/browser/pass3-check-in.spec.js`
- `public/js/app.js`
- `server/app.js`
- `server/db.js`

No product code changes were made.

### Findings

1. **Canonical `GET /api/today` behavior is broadly correct for the intended read model.**
   - `server/app.js` registers `GET /api/today`, requires an authenticated user and required consents, resolves the user-local date/timezone through `dailyDateOptions`, and returns `db.getToday(user.id, dateOptions)` with `cache-control: no-store`.
   - `server/db.js` implements `getToday` through `getAppBootstrap`, so canonical Today reuses the existing lazy daily-plan/routine-instance creation path.
   - SQL-backed tests confirm a returning user gets one daily plan and three routine instances for the requested local date, with no duplicate daily plan after repeated `GET /api/today` calls.

2. **Mutation date scoping has a real coverage gap around anchor completion.**
   - `completeRoutineInstance` accepts `options.localDate` and uses it when upserting the daily plan, but the `update routine_instances` query does not constrain `ri.instance_date = localDate`.
   - Current tests only verify that date options are passed and that the daily plan uses the supplied local date. They do not prove that an anchor from another date cannot be completed while creating/updating today’s plan.
   - Recommendation: before later tool-dispatcher exposure, add a red SQL-backed API/DB test for stale/cross-date anchor IDs and then scope the update by `instance_date`.

3. **Frontend migration is safe for initial Today load, but incomplete for canonical refresh after mutations.**
   - `bootstrapAuthenticatedUser` still loads `/api/app/bootstrap`, then calls `refreshTodayState`, which fetches `/api/today`; the Pass 3 browser test proves the Today surface calls the canonical endpoint.
   - Morning and midday completion mutate local anchor state from the completion response instead of re-fetching `/api/today`.
   - Focus-plan save updates the visible focus summary from the save response and navigates to Today without a canonical refresh.
   - Day reset renders the reset result but does not update the shared Today state or re-fetch `/api/today`, so the Today tab can remain stale until another bootstrap/refresh path runs.
   - Recommendation: add browser assertions that check-in, focus save, reset, and anchor completion leave the `/api/today`-backed Today state current. This is already called out as unchecked in `PLAN.md`.

4. **Capability matrix tests are useful smoke checks but too weak to prevent misleading parity claims.**
   - The test validates required columns, row width, allowed statuses, and a few critical strings.
   - It does not verify that route/service values exist in `server/app.js`, that tool names are unique, that `covered` means a current route/UI/service actually exists, or that `deferred with reason` rows include an explicit reason.
   - Several rows have `deferred with reason` status without a separate reason field or explanatory text in the row, which makes the status less auditable.
   - Recommendation: tighten the matrix validator before Slice 7 so it catches duplicate tool names, missing route references for concrete HTTP rows, missing reasons for deferred rows, and unsupported voice/status values.

5. **Malformed date/timezone errors are not covered for canonical Today.**
   - `dailyDateOptions` calls `resolveUserLocalDate` and `resolveUserTimezone`, which throw on invalid input.
   - The current API tests cover valid explicit dates and timezone precedence, but not the response contract for malformed `date` or `timezone` query params.
   - Recommendation: add explicit `400` API tests for invalid `date` and invalid fallback `timezone` before exposing these contracts to tools.

### Commands Run

```bash
bun test tests/unit/capability-tool-matrix.test.js tests/api/pass2-timezone-contract.test.js
```

Result: 6 pass, 5 skip, 0 fail. SQL-backed tests skipped because `TEST_DATABASE_URL` was not set.

```bash
playwright-cli open http://127.0.0.1:3700
playwright-cli snapshot
playwright-cli console
```

Result: Anchor loaded at `http://127.0.0.1:3700/`; console log showed 0 errors and 0 warnings.

```bash
PORT=3712 bun run test:browser -- tests/browser/pass3-check-in.spec.js
```

Result: 7 passed.

```bash
qa_db="anchor_qa_slice12_$(date +%Y%m%d%H%M%S)"
createdb "$qa_db" && TEST_DATABASE_URL="postgres://localhost:5432/$qa_db" bun test tests/api/pass2-timezone-contract.test.js
```

Result: SQL-backed test body passed: 7 pass, 0 fail. The wrapper exited nonzero afterward because `status` is a read-only zsh variable in the attempted cleanup assignment, so cleanup was run separately.

```bash
psql -Atqc "select datname from pg_database where datname like 'anchor_qa_slice12_%'" postgres | while read dbname; do [ -n "$dbname" ] && dropdb --if-exists "$dbname"; done
```

Result: temporary QA database cleaned up.

### Recommendation

Do not block Slice 1/Slice 2 on the canonical Today read path itself; the read model and lazy creation behavior are passing targeted and SQL-backed checks. Do block tool-dispatcher exposure of Today mutations until tests cover cross-date anchor completion, post-mutation canonical refresh behavior, invalid date/timezone errors, and stronger matrix validation.
