## Anchor Wayfinding, Focus Plan, and Midday Anchor — 2026-05-01

### Phase
implementation

### Summary
Implemented the guided wayfinding slice requested after the Morning quick check-in. Anchor now replaces passive result text with explicit actions, stores a daily focus/cope-ahead plan, adds a real Midday anchor view, and uses hash routes so browser Back/Forward works across guided app sections.

### Files Created/Modified

| File | Purpose |
|------|---------|
| `db/migrations/017_daily_focus_plans.sql` | Added one focus plan per user/day. |
| `server/app.js` | Added authenticated focus-plan routes and changed Morning action copy. |
| `server/db.js` | Added focus-plan persistence, bootstrap inclusion, and privacy-delete cleanup. |
| `server/auth/validation.js` | Added focus-plan validation. |
| `public/index.html` | Added action panel, Today progress rail, Focus view, and Midday view. |
| `public/css/app.css` | Styled result actions, progress rail, and focus/Midday task surfaces. |
| `public/js/app.js` | Added focus-plan save, Midday completion, anchor progress rendering, and hash history routing. |
| `tests/api/pass3-check-ins.test.js` | Added focus-plan API/bootstrap tests and updated Morning action expectations. |
| `tests/browser/pass3-check-in.spec.js` | Added browser coverage for Morning result actions, focus plan, Midday, and Back/Forward. |
| `README.md` | Documented day navigation, Focus, Midday, and hash-based history. |
| `CAPABILITY_LEDGER.md` | Recorded the completed slice and verification evidence. |
| `vertical-slice-dashboard-anchor-hardening.json` | Added the hardening dashboard pass for this slice. |
| `vertical-slice-dashboard.html` | Synced embedded dashboard default state. |

### Key Decisions
- Used hash routes instead of path routing so the existing Bun static app shell needs no server fallback changes.
- Kept Midday lightweight: it posts a `midday` quick check-in and completes the existing Midday routine instance instead of duplicating the full Morning flow.
- Kept "cope ahead" as DBT language but added plain-language helper copy directly in the action panel.
- Stored focus plans as user/day upserts so saving the form is repeatable and Today always shows the current plan.

### Technical Details
- Valid guided hashes include `#today`, `#check-in`, `#focus-plan`, `#midday`, `#reset`, and the other existing app sections.
- `GET /api/app/bootstrap` now includes `focusPlan`, and client bootstrap honors a valid hash after authentication.
- Privacy deletion removes `daily_focus_plans` alongside other user-owned product data.
- Accessible-label collisions were avoided by scoping browser tests to the active section where labels repeat between Morning and Midday.

### Testing/Verification
- `bun run db:reset` passed.
- `bun test tests/api/pass3-check-ins.test.js` passed: 5 tests.
- `PORT=3212 bun run test:browser -- tests/browser/pass3-check-in.spec.js` passed: 6 tests.
- `bun run test` passed: 60 tests.
- `PORT=3212 bun run test:browser` passed: 44 Playwright tests, 1 live OpenAI test skipped.
- Manual smoke at `http://127.0.0.1:3210` passed for create account, routine setup, Morning action panel, focus-plan save, Midday completion, Today progress rail, and a console-clean load.

### State
completed

### Next Steps
- Consider splitting `public/js/app.js` before the next substantial guided-flow slice.

### Related Files
- `PLAN.md`
- `SPEC.md`
- `CAPABILITY_LEDGER.md`
