## Universal Agent Tool Layer Slices 1-3 — 2026-05-14 15:20

### Phase
implementation

### Summary
Implemented the first runnable vertical slices of the universal agent-accessible tool layer plan. The work added a capability matrix, canonical `/api/today`, Today UI use of that canonical endpoint, safety plan/event APIs, persisted safety episodes, acute safety lock enforcement, and a Safety Plan / Help Now UI that can save plans, append acute events, discover open acute episodes, and resolve them.

### Files Created/Modified
| File | Purpose |
|------|---------|
| `/Users/twoedge/Dev/dbt/PLAN.md` | Added and updated the universal tool-layer execution checklist. |
| `/Users/twoedge/Dev/dbt/CAPABILITY_TOOL_MATRIX.md` | Inventory of user/admin/server capabilities, voice availability, safety eligibility, consent, and parity status. |
| `/Users/twoedge/Dev/dbt/tests/unit/capability-tool-matrix.test.js` | Matrix shape and critical-gap validation. |
| `/Users/twoedge/Dev/dbt/server/app.js` | Added canonical Today route and safety plan/event routes. |
| `/Users/twoedge/Dev/dbt/server/db.js` | Added `getToday`, safety plan methods, safety event list/resolve, acute safety episode persistence, and local-date anchor completion scoping. |
| `/Users/twoedge/Dev/dbt/server/auth/validation.js` | Added safety plan/event/resolution validators. |
| `/Users/twoedge/Dev/dbt/public/js/app.js` | Added canonical Today refresh after bootstrap/onboarding. |
| `/Users/twoedge/Dev/dbt/public/index.html` | Added signed-in Safety Plan / Help Now view and nav entry. |
| `/Users/twoedge/Dev/dbt/public/css/app.css` | Added Safety view to the existing card styling set. |
| `/Users/twoedge/Dev/dbt/tests/api/pass2-timezone-contract.test.js` | Added canonical Today, invalid date/timezone, SQL lazy creation, and cross-date anchor completion coverage. |
| `/Users/twoedge/Dev/dbt/tests/api/safety-routes.test.js` | Added safety plan/event route coverage. |
| `/Users/twoedge/Dev/dbt/tests/browser/pass3-check-in.spec.js` | Added browser coverage proving Today uses `/api/today`. |
| `/Users/twoedge/Dev/dbt/tests/browser/safety-plan.spec.js` | Added Safety Plan / Help Now browser coverage, including Coach-created acute episode resolution. |
| `/Users/twoedge/Dev/dbt/db/migrations/018_safety_episodes.sql` | Added safety event resolution fields and `safety_episodes`. |
| `/Users/twoedge/Dev/dbt/context_history/contexts/2026-05-14_universal-tool-layer-slice1-slice2-qa.md` | QA report from the review agent. |
| `/Users/twoedge/Dev/dbt/context_history/contexts/2026-05-14_slice3_pretask_verification.md` | Pre-task verification report for remaining Slice 3 gaps. |
| `/Users/twoedge/Dev/dbt/context_history/contexts/2026-05-14_slice3_qa_review.md` | Final Slice 3 QA report and evidence. |

### Key Decisions
- Reused `getAppBootstrap` for `db.getToday` so canonical Today and app bootstrap share the existing lazy routine/daily-plan creation logic.
- Kept `/api/today` consent-gated and `cache-control: no-store`, matching protected daily-state semantics.
- Added `safety_episodes` as a persisted acute-mode record created from acute safety events and resolved through event resolution.
- Enforced acute lock at the app route layer for normal mutating actions while allowing safety event append, safety episode resolution through event resolution, voice end, and logout.
- Mapped `safety.resources.read` to `GET /api/safety-plan` crisis resources and `safety.episode.resolve` to the linked episode update inside `PUT /api/safety-events/:id/resolution`.
- Added Safety UI discovery for open acute events so episodes created by Coach Safety Mode can be resolved from the Help Now surface.
- Scoped `completeRoutineInstance` by `instance_date` to prevent a stale anchor ID from completing a different local day while updating today's plan.
- Left stronger matrix validation and full post-mutation canonical refresh assertions for later slices because they are tool-catalog/parity hardening work, not blockers for the current read/safety API slices.

### Technical Details
`GET /api/today` returns `{ date, timezone, dailyPlan, anchors, nextBestStep, focusPlan, diaryStatus, recommendedSkill, safetyStatus, session }`. Invalid Today date/timezone input now returns `400 invalid_today_date` instead of throwing. Safety routes added: `GET|POST|PUT /api/safety-plan`, `GET|POST /api/safety-events`, and `PUT /api/safety-events/:id/resolution`. The Safety view uses `GET /api/safety-plan` for plan/resources, `POST /api/safety-events` for Help Now, `GET /api/safety-events` to find open acute events, and `PUT /api/safety-events/:id/resolution` to resolve the linked episode.

### Testing/Verification
- `bun test tests/unit/capability-tool-matrix.test.js tests/api/pass2-timezone-contract.test.js`
- `TEST_DATABASE_URL=postgres://localhost:5432/<tempdb> bun test tests/api/pass2-timezone-contract.test.js`
- `bun test tests/api/safety-routes.test.js tests/api/pass3-check-ins.test.js tests/api/pass7-coach.test.js tests/api/pass2-timezone-contract.test.js tests/unit/capability-tool-matrix.test.js`
- `bun run db:migrate`
- `bun run test:browser -- tests/browser/pass3-check-in.spec.js`
- `bun run test:browser -- tests/browser/safety-plan.spec.js`
- `bun run test:browser -- tests/browser/safety-plan.spec.js tests/browser/pass7-coach.spec.js tests/browser/pass3-check-in.spec.js`
- `APP_ENV=test NODE_ENV=test OPENAI_API_KEY= REALTIME_MODEL=gpt-realtime bun run test`
- `git diff --check`

### State
completed through Slice 3

### Next Steps
- Start Slice 4: privacy/export retention decisions for sensitive and destructive tool exposure.
- Add explicit browser assertions that `/api/today`-backed state stays current after check-in, focus-plan save, reset, and anchor completion.
- Tighten matrix validation in Slice 7 so `covered` rows prove route/service/tool mappings and deferred rows include explicit reasons.
- Convert the route-level acute safety policy into a catalog/tool-name keyed policy during Slice 7.

### Related Files
- `/Users/twoedge/Dev/dbt/PLAN.md`
- `/Users/twoedge/Dev/dbt/context_history/contexts/2026-05-14_universal-tool-layer-slice1-slice2-qa.md`
- `/Users/twoedge/Dev/dbt/context_history/contexts/2026-05-14_slice3_pretask_verification.md`
- `/Users/twoedge/Dev/dbt/context_history/contexts/2026-05-14_slice3_qa_review.md`
