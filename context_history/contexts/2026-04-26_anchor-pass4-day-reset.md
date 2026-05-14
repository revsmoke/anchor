## Anchor Pass 4 Day Reset - 2026-04-26

### Phase
implementation

### Summary
Implemented Pass 4: onboarded users can apply a Planner / Day Reset, choose minimum viable day mode, preserve existing anchors, and see the daily plan reframed as recoverable. The slice remains deterministic and does not introduce coaching, diary, skills, or later surfaces.

### Files Created/Modified

| File | Purpose |
| --- | --- |
| `server/app.js` | Added `POST /api/today/reset` route. |
| `server/db.js` | Added daily-plan reset persistence, anchor preservation return, reset history handling, and deterministic reset next-step rules. |
| `server/auth/validation.js` | Added day-reset payload validation. |
| `db/migrations/005_day_reset.sql` | Added reset mode, must-dos, deferred items, regulation action, and reset history fields to `daily_plans`. |
| `public/index.html` | Added Planner / Day Reset UI with non-shaming missed-anchor copy. |
| `public/css/app.css` | Added reset card to existing card styling. |
| `public/js/app.js` | Added reset validation, submit handler, and reset result rendering. |
| `tests/api/pass4-day-reset.test.js` | Added API tests for minimum viable day reset, validation, active session, and preserved anchors. |
| `tests/browser/pass4-day-reset.spec.js` | Added browser tests for missed-anchor copy, reset flow, and validation. |
| `CAPABILITY_LEDGER.md` | Added Pass 4 capability evidence. |
| `vertical-slice-dashboard-anchor-pass4.json` | Dashboard state with Pass 0 through Pass 4 complete. |
| `vertical-slice-dashboard.html` | Embedded dashboard default state updated through Pass 4. |

### Key Decisions

- Kept Pass 4 limited to Day Reset and Minimum Viable Day.
- Used deterministic Structure Coach-style next-step text rather than adding AI coach orchestration.
- Stored reset history on `daily_plans` so minimum viable day does not delete prior plan state.
- Returned the existing anchor instances after reset to prove Morning, Midday, and Evening history remain intact.
- Changed ambiguous labels to "Deferred items" and "Reset mode" after browser tests exposed accessible-name collisions.

### Technical Details

- Route added:
  - `POST /api/today/reset`
- Request shape:
  - `{ "mode", "mustDos", "defer", "regulationAction" }`
- New daily-plan fields:
  - `mode`
  - `must_dos`
  - `deferred_items`
  - `regulation_action`
  - `reset_history`

### Testing/Verification

- RED phase:
  - API tests failed with 404 for missing `POST /api/today/reset`.
  - Browser tests failed because the Reset Today UI did not exist.
- GREEN phase:
  - `bun run db:reset` applied migrations 001 through 005 and seed successfully.
  - `bun run test` passed: 25 unit/API tests.
  - `bun run test:browser` passed: 15 Playwright browser tests.
  - Manual `playwright-cli` verification completed account creation, consent, routine setup, and minimum viable day reset.
  - Manual reset showed the non-shaming copy, updated next step, deferred items, and preserved Morning/Midday/Evening anchors.
  - `playwright-cli console` reported 0 errors and 0 warnings.
  - `vertical-slice-dashboard-anchor-pass4.json` and `vertical-slice-dashboard.html` validated as 6 layers x 14 passes, with Pass 0-4 done.

### State
completed

### Next Steps

- Begin Pass 5 only: Evening Diary Card.
- Pass 5 should introduce stable diary-card fields, save/load behavior, and next-step rendering from diary completion.
- Do not start skills library, coaching, chain analysis, voice, insights, exports, privacy controls, offline sync, notifications, or PWA hardening until their later vertical slices.
