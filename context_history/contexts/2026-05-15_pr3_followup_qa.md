# PR #3 Follow-up QA - 2026-05-15

Role: QA reviewer for local PR #3 comment-resolution follow-up.

Scope reviewed:
- `context_history/contexts/2026-05-14_universal-tool-layer-slice1-3-implementation.md`
- `db/migrations/018_safety_episodes.sql`
- `public/js/app.js`
- `server/app.js`
- `server/db.js`
- `tests/api/pass2-timezone-contract.test.js`
- `tests/browser/pass3-check-in.spec.js`
- `tests/browser/safety-plan.spec.js`

## Result

No blockers found.

## Issue-by-issue review

| Issue | QA result |
| --- | --- |
| Context-history absolute paths/table spacing | Addressed. The Slice 1-3 context file now uses repo-relative paths, and the table has a blank line before it. A scoped absolute-path scan found no user-specific workspace paths in that file. |
| Stale Safety resolution UI clearing | Addressed. `loadOpenSafetyEpisode()` now clears `activeSafetyEventId`, hides the resolution form, clears the note, and hides/clears status and error text when no open acute event remains. Browser coverage now reloads after resolution and asserts the stale form/status/note are gone. |
| Duplicated Today state helper reuse | Addressed. `buildTodayStateFromBootstrap` is exported from `server/db.js`; `server/app.js` imports it for the fallback path instead of carrying a duplicate local helper. |
| Stale-anchor test `checkInId` | Addressed. The SQL-backed stale-anchor request now sends `checkInId: null`, so the test targets the stale anchor behavior instead of accidentally coupling to an anchor id as a check-in id. |
| Browser `/api/today` successful response assertion | Addressed. The browser test now waits for a `/api/today` response with status `200` and asserts the authenticated session payload. |
| `safety_episode` FK migration | Addressed. Migration 018 adds the FK with `on delete set null`; the existence check is now scoped to `safety_events` via `conrelid`, avoiding false positives from same-named constraints on other tables. |
| `GET /api/today` active acute safety status | Addressed. `db.getToday()` fetches the active safety episode and the shared Today builder returns `riskTier: "acute"` with the active episode when present. The route fallback also includes `getActiveSafetyEpisode()` when available. In-memory API coverage and the newly added SQL-backed persistence test cover this behavior. |

## Verification run

- `bun test tests/api/pass2-timezone-contract.test.js tests/api/safety-routes.test.js`
  - Result: 9 pass, 7 skip, 0 fail.
  - Note: SQL-backed Pass 2 cases, including the newly added persisted active-acute test, skipped because `TEST_DATABASE_URL` was not set.
- `pg_isready`
  - Result: no local PostgreSQL response on port 5432, so I did not run the SQL-backed test path.
- `bunx playwright test tests/browser/pass3-check-in.spec.js tests/browser/safety-plan.spec.js`
  - Result: 9 passed.
- `git diff --check`
  - Result: passed with no whitespace errors.
- Scoped absolute-path/table scan of `context_history/contexts/2026-05-14_universal-tool-layer-slice1-3-implementation.md`
  - Result: only table rows were returned; no absolute workspace paths were found.

## Residual risk

The SQL-backed active acute `/api/today` test was added and appears aligned with the implementation, but it was not executed in this local run because PostgreSQL was unavailable and `TEST_DATABASE_URL` was unset.
