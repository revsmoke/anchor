## Anchor Pass 3 Morning Quick Check-In - 2026-04-26

### Phase
implementation

### Summary
Implemented Pass 3: onboarded users can submit a Quick Check-In, receive a deterministic next action, complete the morning routine instance, and see the daily plan advance to the midday anchor. Elevated check-in fixtures interrupt normal flow with Safety Mode and create a safety event.

### Files Created/Modified

| File | Purpose |
| --- | --- |
| `server/app.js` | Added check-in and anchor-completion routes plus deterministic risk/next-action rules. |
| `server/db.js` | Added quick check-in, safety event, and routine completion persistence methods. |
| `server/auth/validation.js` | Added Quick Check-In and anchor-completion payload validation. |
| `db/migrations/004_quick_check_ins.sql` | Added quick_check_ins, safety_events, routine completion linkage, and daily-plan next-action status. |
| `scripts/db-reset.js` | Updated local reset to drop Pass 3 tables in dependency order. |
| `public/index.html` | Added Morning quick check-in UI and Safety Mode interruption surface. |
| `public/css/app.css` | Added check-in card and Safety Mode styles. |
| `public/js/app.js` | Added check-in submission, anchor completion, result rendering, and Safety Mode rendering. |
| `tests/api/pass3-check-ins.test.js` | Added API tests for normal check-in, elevated safety fixture, anchor completion, and validation. |
| `tests/browser/pass3-check-in.spec.js` | Added browser tests for under-30-second happy path, validation, and Safety Mode rendering. |
| `CAPABILITY_LEDGER.md` | Added Pass 3 capability evidence. |
| `vertical-slice-dashboard-anchor-pass3.json` | Dashboard state with Pass 0 through Pass 3 complete. |
| `vertical-slice-dashboard.html` | Embedded dashboard default state updated through Pass 3. |

### Key Decisions

- Kept Pass 3 limited to Morning Anchor and Quick Check-In.
- Used deterministic local recommendation/risk rules rather than introducing OpenAI or full coach orchestration.
- Classified urge score 5 or explicit unsafe/not-sure safety wording as elevated for this slice.
- Elevated responses return Safety Mode and preserve 911/988 actions; normal responses complete the anchor.
- Anchor completion links a routine instance to the saved check-in and advances the daily plan to "Midday anchor is next."

### Technical Details

- Routes added:
  - `POST /api/check-ins`
  - `POST /api/today/anchors/:id/complete`
- Tables/columns added:
  - `quick_check_ins`
  - `safety_events`
  - `routine_instances.completed_check_in_id`
  - `daily_plans.next_action_status`
- Quick Check-In validates score ranges, anchor context, energy state, next-action status, optional note length, and optional location context.

### Testing/Verification

- RED phase:
  - API tests failed with 404 for missing Pass 3 routes.
  - Browser tests failed because the Morning quick check-in UI did not exist.
- GREEN phase:
  - `bun run db:reset` applied migrations 001 through 004 and seed successfully.
  - `bun run test` passed: 22 unit/API tests.
  - `bun run test:browser` passed: 13 Playwright browser tests.
  - Manual `playwright-cli` verification completed account creation, consent, routine setup, quick check-in, and morning anchor completion.
  - Manual elevated fixture rendered Safety Mode with 911/988 links.
  - `playwright-cli console` reported 0 errors and 0 warnings.
  - `vertical-slice-dashboard-anchor-pass3.json` and `vertical-slice-dashboard.html` validated as 6 layers x 14 passes, with Pass 0-3 done.

### State
completed

### Next Steps

- Begin Pass 4 only: Day Reset and Minimum Viable Day.
- Pass 4 should handle disrupted-day recovery, must-do/defer/regulation action data, and non-shaming missed-anchor states.
- Do not start evening diary, skills library, coaching, chain analysis, voice, insights, exports, privacy controls, offline sync, or PWA hardening until their later vertical slices.
