## Anchor Pass 2 Onboarding Routine Setup - 2026-04-26

### Phase
implementation

### Summary
Implemented Pass 2: consented users can enter basic profile rhythm and care-context data, create morning/midday/evening anchor templates, generate today's routine instances, and receive a daily plan next step.

### Files Created/Modified

| File | Purpose |
| --- | --- |
| `server/app.js` | Added profile and routine onboarding routes with required-consent gating. |
| `server/db.js` | Added profile and routine persistence methods and response mappers. |
| `server/auth/validation.js` | Added profile/routine payload validation and normalization. |
| `db/migrations/003_onboarding_routines.sql` | Created user profile, routine template, routine instance, and daily plan tables. |
| `scripts/db-reset.js` | Updated local reset to drop Pass 0-2 tables in dependency order. |
| `public/index.html` | Added consent-gated onboarding and routine setup UI. |
| `public/css/app.css` | Added onboarding styles and a global `[hidden]` rule for gated UI. |
| `public/js/app.js` | Added onboarding validation, profile save, routine save, and result rendering. |
| `tests/api/pass2-onboarding-routines.test.js` | Added API tests for profile save, consent preconditions, routine creation, and routine validation. |
| `tests/browser/pass2-onboarding.spec.js` | Added browser tests for gated onboarding, routine setup, and validation. |
| `CAPABILITY_LEDGER.md` | Added Pass 2 capability evidence. |
| `vertical-slice-dashboard-anchor-pass2.json` | Dashboard import/export state with Pass 0, Pass 1, and Pass 2 complete. |
| `vertical-slice-dashboard.html` | Embedded dashboard default state updated through Pass 2. |

### Key Decisions

- Kept Pass 2 focused on onboarding and routine setup only.
- Required all three Pass 1 consent records before saving profile or routines.
- Created exactly three routine anchors for this slice: morning, midday, and evening.
- Stored both reusable routine templates and today's routine instances so later passes can complete/check in against instances without changing Pass 2 behavior.
- Added `[hidden] { display: none !important; }` after browser testing showed component-level display styles could override gated hidden state.

### Technical Details

- Routes added:
  - `POST /api/onboarding/profile`
  - `POST /api/onboarding/routines`
- Tables added:
  - `user_profiles`
  - `routine_templates`
  - `routine_instances`
  - `daily_plans`
- Routine setup returns the profile, created templates, today's instances, and the daily plan.

### Testing/Verification

- RED phase:
  - API tests failed with 404 for missing onboarding profile/routine routes.
  - Browser tests failed because the onboarding UI did not exist.
  - A later browser regression correctly failed when the onboarding section was visible before consent.
- GREEN phase:
  - `bun run test` passed: 18 unit/API tests.
  - `bun run test:browser` passed: 10 Playwright browser tests.
  - Manual `playwright-cli` verification showed onboarding hidden on first load, visible after consent, and rendering the three anchors after routine creation.
  - `playwright-cli console` reported 0 errors and 0 warnings.
  - `vertical-slice-dashboard-anchor-pass2.json` and `vertical-slice-dashboard.html` validated as 6 layers x 14 passes, with Pass 0-2 done.

### State
completed

### Next Steps

- Begin Pass 3 only: Morning Anchor and Quick Check-In.
- Pass 3 should let the user start or complete a morning anchor and submit the first quick check-in against a routine instance.
- Do not start diary, coaching, distress analysis, day reset, or export features until their later vertical slices.
