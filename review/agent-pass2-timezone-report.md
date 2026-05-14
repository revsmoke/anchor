# Pass 2 Date And Timezone Contract - Pre-Task Verification

## Current Timezone Source Of Truth

- Intended source: authenticated user profile timezone, per `IMPLEMENTATION_PLAN.md:180`.
- Current persisted sources:
  - `users.timezone` is required at signup: `db/migrations/002_auth_consent.sql:3-10`, `server/app.js:279-297`, `server/db.js:54-60`.
  - `user_profiles.timezone` is separately required during onboarding: `db/migrations/003_onboarding_routines.sql:1-11`, `server/db.js:265-295`.
- Current behavior gap: daily-state DB methods do not read either timezone when choosing the user day. They use PostgreSQL `current_date`, so the effective source of truth is the database server date.
- Frontend currently infers timezone only during signup/profile submission with `Intl.DateTimeFormat().resolvedOptions().timeZone`: `public/js/app.js:447-453`, `public/js/app.js:729-741`.

## Daily-State Routes And DB Methods Using Dates

- `GET /api/app/bootstrap` -> `db.getAppBootstrap(user.id)`: reads `routine_instances.instance_date = current_date`, `daily_plans.plan_date = current_date`, and calls `getTodayFocusPlan(userId)`: `server/app.js:99-101`, `server/db.js:138-190`.
- `POST /api/onboarding/routines` -> `db.saveRoutineSetup(user.id, anchors)`: deletes/inserts routine instances and daily plan with `current_date`: `server/app.js:535-550`, `server/db.js:298-357`.
- `POST /api/today/anchors/:id/complete` -> `db.completeRoutineInstance(user.id, anchorId, completion)`: completes by anchor id without date guard, then upserts `daily_plans.plan_date = current_date`: `server/app.js:220-223`, `server/app.js:590-611`, `server/db.js:422-461`.
- `POST /api/today/reset` -> `db.resetTodayPlan(user.id, reset)`: selects/upserts `daily_plans.plan_date = current_date` and reads anchors with `instance_date = current_date`: `server/app.js:119-121`, `server/app.js:614-628`, `server/db.js:464-565`.
- `GET /api/today/focus-plan` -> `db.getTodayFocusPlan(user.id)`: reads `daily_focus_plans.plan_date = current_date`: `server/app.js:123-125`, `server/app.js:630-637`, `server/db.js:568-585`.
- `POST /api/today/focus-plan` -> `db.saveTodayFocusPlan(user.id, focusPlan)`: inserts `daily_focus_plans.plan_date = current_date`: `server/app.js:127-129`, `server/app.js:640-656`, `server/db.js:588-620`.
- `GET/PUT /api/diary/:date` -> `db.getDiaryEntry(user.id, entryDate)` / `db.saveDiaryEntry(...)`: explicit URL date controls `diary_entries.entry_date`; no default user-local date is applied: `server/app.js:131-138`, `server/app.js:659-680`, `server/db.js:627-685`.
- `POST /api/check-ins` -> `db.saveQuickCheckIn(user.id, checkIn, recommendation)`: stores client-supplied `createdAt` as `timestamptz`; it does not assign a daily date directly but participates in anchor completion flow: `server/app.js:552-588`, `server/db.js:361-405`.
- `GET /api/today` is absent but planned as canonical Pass 3 API: `IMPLEMENTATION_PLAN.md:188-207`.

## Migration/Schema Notes

- `routine_instances.instance_date`, `daily_plans.plan_date`, and `diary_entries.entry_date` are plain `date` columns with unique daily constraints where expected: `db/migrations/003_onboarding_routines.sql:23-42`, `db/migrations/006_diary_card.sql:16-30`.
- `daily_focus_plans.plan_date` has `default current_date`, which should be removed or ignored by all application writes after Pass 2: `db/migrations/017_daily_focus_plans.sql:1-10`.
- Date serialization uses `Date#toISOString().slice(0, 10)` in row mappers, which can shift a `date` if the driver materializes it as a local-midnight `Date` in a non-UTC timezone: `server/db.js:1495-1528`, `server/db.js:1560-1565`.

## Safest Helper/API Design

- Add a small server date service, e.g. `server/services/user-day.js`, with:
  - `resolveUserTimezone({ user, profile, explicitTimezone })`: prefer `user_profiles.timezone`, fall back to `users.timezone`, allow explicit request timezone only for pre-profile onboarding.
  - `localDateForTimezone(now, timezone) -> YYYY-MM-DD`: use `Intl.DateTimeFormat` with `timeZone`, not database time.
  - `resolveUserDate({ requestedDate, timezone, now })`: validate optional `date=YYYY-MM-DD`; otherwise derive user-local date.
- Thread `userDate` into DB methods explicitly: `getAppBootstrap(userId, userDate)`, `saveRoutineSetup(userId, anchors, userDate)`, `completeRoutineInstance(userId, anchorId, completion, userDate)`, `resetTodayPlan(userId, reset, userDate)`, `getTodayFocusPlan(userId, userDate)`, `saveTodayFocusPlan(userId, focusPlan, userDate)`.
- Add a date guard to anchor completion so completing yesterday's or tomorrow's anchor cannot upsert today's daily plan by accident.
- Prefer SQL parameters (`${userDate}`) for `date` columns and remove reliance on table defaults for daily app writes.
- Keep instant timestamps (`createdAt`, `completedAt`, `resetAt`, password/session expirations) as UTC instants; only daily bucket keys should use the user-local date contract.

## Red Tests To Add First

- Unit test `localDateForTimezone()` at one UTC instant that is different dates in `America/Detroit` and `Pacific/Honolulu`.
- Unit test a DST boundary, e.g. `2026-03-08T06:30:00Z` and `2026-11-01T05:30:00Z` for `America/Detroit`, proving the date stays user-local.
- API test: `POST /api/onboarding/routines` creates routine instances and daily plan for the resolved profile/user timezone date, not DB `current_date`.
- API test: `GET /api/app/bootstrap` reads anchors/daily plan/focus plan from the same resolved user date.
- API test: `POST /api/today/focus-plan` followed by `GET /api/today/focus-plan` uses one resolved date and does not collide across two timezones at the same `now`.
- API test: `POST /api/today/reset` updates the plan for the resolved user date and returns anchors from that same date.
- API test: `POST /api/today/anchors/:id/complete` refuses or ignores an anchor outside the resolved user date.
- Future `GET /api/today?date=YYYY-MM-DD` red test: explicit date overrides derived today, omitted date derives from profile timezone, invalid date returns `400`.
- Browser test with mocked clock/timezone or route assertions: signup/profile submits a timezone, Today load and diary default date do not use `new Date().toISOString().slice(0, 10)` as the user-local date.

## Risks

- There are two timezone stores (`users.timezone` and `user_profiles.timezone`) that can diverge; Pass 2 needs a documented precedence rule and probably profile-update behavior.
- In-memory API test doubles currently hard-code `2026-04-26`, so tests can pass while real PostgreSQL still uses `current_date`: `tests/api/pass2-onboarding-routines.test.js:98-123`, `tests/api/pass3-check-ins.test.js:110-197`, `tests/api/pass4-day-reset.test.js:91-148`.
- Existing frontend diary defaults use UTC date slicing, which is wrong near local midnight: `public/js/app.js:897-901`, `public/js/app.js:1228-1231`.
- SQL row mappers may have off-by-one serialization risk if PostgreSQL `date` values arrive as JS `Date` objects: `server/db.js:1495-1528`, `server/db.js:1560-1565`.
- Pass 3 canonical Today API depends on this contract; implementing `GET /api/today` before replacing `current_date` will spread the bug.
