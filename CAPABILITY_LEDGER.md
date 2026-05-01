# Anchor Capability Ledger

## Session Shell, Navigation, and Guided UX (complete)

- Frontend: `public/index.html` now starts in a checking-session state, adds a semantic authenticated shell with primary navigation, menu control, logout button, and a guided `Today` view.
- CSS: `public/css/app.css` styles the app shell, responsive nav/menu behavior, guided section transitions, and preserves reduced-motion handling.
- Client JS: `public/js/app.js` fetches authenticated bootstrap state before showing auth, uses no-store API fetches, switches one product section at a time, and logs out through the existing session route.
- Service worker: `public/service-worker.js` now uses `anchor-app-shell-v2`, deletes stale app-shell caches, keeps `/api/*` uncached, and uses network-first behavior for app-shell assets with offline fallback.
- Bun API: `GET /api/app/bootstrap` returns `Cache-Control: no-store`.
- UX: returning users no longer see account creation while bootstrap is pending; complete users land on `Today`, then intentionally navigate to Check-in, Reset, Diary, Skills, Coach, Chain, Voice, Insights, Exports, Privacy, or Offline.
- Tests:
  - `bun run db:reset` passed.
  - `bun run test` passed: 59 unit/API tests.
  - `PORT=3212 bun run test:browser` passed: 41 Playwright tests, 1 live OpenAI test skipped.
  - Manual smoke at `http://127.0.0.1:3210` passed for create-account, routine setup, Today nav, section switch, logout, and 0 console issues.
- Current blocker:
  - None. Live OpenAI browser coverage remains opt-in through `OPENAI_REALTIME_LIVE_TEST=1`.

## Pass 0: Walking Skeleton (complete)

- Frontend: `public/index.html` loads an Anchor shell, boundary notice, and Today snapshot region.
- CSS: `public/css/app.css` provides responsive Pass 0 styling and reduced-motion handling.
- Client JS: `public/js/app.js` calls `GET /api/today/snapshot`, renders success data, and renders safe error text.
- Bun API: `server/index.js` starts a `Bun.serve()` app from `server/app.js`.
- API routes:
  - `GET /api/health`
  - `GET /api/config/public`
  - `GET /api/today/snapshot`
- Database: PostgreSQL table `app_status_snapshots` exists in local `anchor_local` and has one seed row.
- Tests:
  - `bun run test` passed: 6 unit/API tests.
  - `bun run test:browser` passed: 4 Playwright browser tests.
- Manual browser verification:
  - URL: `http://127.0.0.1:3210`
  - Page rendered seeded PostgreSQL data.
  - `playwright-cli console` reported 0 errors and 0 warnings.
- Dashboard artifact:
  - `vertical-slice-dashboard-anchor-pass0.json` is importable into `vertical-slice-dashboard.html` with Pass 0 marked `done` across all layers.
- Current blocker before Pass 1:
  - None for Pass 0.
  - Continue with Safety and Consent Shell only after importing/updating the vertical-slice dashboard state.

## Pass 1: Safety and Consent Shell (complete)

- Frontend: `public/index.html` now includes a visible Safety and Consent region with crisis boundary language, 911/988 actions, account fields, and required consent checkboxes.
- CSS: `public/css/app.css` styles the consent card, crisis actions, form fields, validation errors, and success status.
- Client JS: `public/js/app.js` validates account/consent fields, creates an account, saves consent records, renders validation errors, and renders the saved-consent state.
- Bun API:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/me`
  - `POST /api/onboarding/consent`
- Database: PostgreSQL now has `users`, `sessions`, `consent_records`, and `safety_plans` tables.
- Security: passwords are hashed with Argon2 via `@node-rs/argon2`; sessions use an HTTP-only `anchor_session` cookie.
- Tests:
  - `bun run test` passed: 14 unit/API tests.
  - `bun run test:browser` passed: 7 Playwright browser tests.
- Manual browser verification:
  - URL: `http://127.0.0.1:3210`
  - Safety and consent shell rendered with 911/988 links.
  - Manual account creation saved all three required consent records.
  - Pass 0 Today snapshot still rendered from PostgreSQL.
  - `playwright-cli console` reported 0 errors and 0 warnings.
- Dashboard artifact:
  - `vertical-slice-dashboard-anchor-pass1.json` is importable into `vertical-slice-dashboard.html` with Pass 0 and Pass 1 marked `done` across all layers.
- Current blocker before Pass 2:
  - None for Pass 1.
  - Continue with Onboarding and Routine Setup only; do not start Quick Check-In or later slices.

## Pass 2: Onboarding and Routine Setup (complete)

- Frontend: `public/index.html` now includes a consent-gated onboarding section for wake/sleep rhythm, therapy status, top goals, hard moments, and three anchor times.
- CSS: `public/css/app.css` styles onboarding fields and routine results, and includes a global `[hidden]` guard so consent-gated UI stays hidden until enabled.
- Client JS: `public/js/app.js` validates onboarding inputs, saves the profile, creates the three routine anchors, and renders the returned daily setup.
- Bun API:
  - `POST /api/onboarding/profile`
  - `POST /api/onboarding/routines`
- Database: PostgreSQL now has `user_profiles`, `routine_templates`, `routine_instances`, and `daily_plans` tables.
- Reset tooling: `scripts/db-reset.js` drops Pass 0-2 tables in dependency order before reapplying migrations and seed data.
- Tests:
  - `bun run test` passed: 18 unit/API tests.
  - `bun run test:browser` passed: 10 Playwright browser tests.
- Manual browser verification:
  - URL: `http://127.0.0.1:3210`
  - Initial load kept onboarding hidden until all required consent records were saved.
  - Manual account creation revealed onboarding setup.
  - Manual routine creation rendered Morning, Midday, and Evening anchors plus the next step.
  - `playwright-cli console` reported 0 errors and 0 warnings.
- Dashboard artifacts:
  - `vertical-slice-dashboard-anchor-pass2.json` is importable into `vertical-slice-dashboard.html` with Pass 0, Pass 1, and Pass 2 marked `done` across all layers.
  - `vertical-slice-dashboard.html` embedded `DEFAULT_STATE` is also updated to the Pass 2 complete state.
- Current blocker before Pass 3:
  - None for Pass 2.
  - Continue with Morning Anchor and Quick Check-In only; do not start diary, coaching, or day-reset slices.

## Pass 3: Morning Anchor and Quick Check-In (complete)

- Frontend: `public/index.html` now includes a Morning quick check-in section that appears after routine setup.
- CSS: `public/css/app.css` styles the check-in card and Safety Mode interruption surface without hiding crisis actions.
- Client JS: `public/js/app.js` validates check-in fields, submits Quick Check-In data, completes the morning anchor, renders the suggested next action, and renders Safety Mode for elevated responses.
- Bun API:
  - `POST /api/check-ins`
  - `POST /api/today/anchors/:id/complete`
- Database: PostgreSQL now has `quick_check_ins` and `safety_events`; `routine_instances` now stores completed check-in linkage, and `daily_plans` stores next-action status.
- Safety/agents placeholder: Pass 3 uses deterministic local rules only. Urge score 5 or explicit unsafe/not-sure safety wording returns `riskTier: "elevated"` with Safety Mode payload and records a safety event. No OpenAI call is made.
- Tests:
  - `bun run test` passed: 22 unit/API tests.
  - `bun run test:browser` passed: 13 Playwright browser tests.
- Manual browser verification:
  - URL: `http://127.0.0.1:3210`
  - Account, consent, onboarding, routine setup, quick check-in, and morning anchor completion worked end to end.
  - Normal check-in rendered "Morning anchor complete.", "Choose one focus and cope ahead.", and "Midday anchor is next."
  - Elevated fixture rendered Safety Mode with 911/988 actions.
  - `playwright-cli console` reported 0 errors and 0 warnings.
- Dashboard artifacts:
  - `vertical-slice-dashboard-anchor-pass3.json` is importable into `vertical-slice-dashboard.html` with Pass 0 through Pass 3 marked `done` across all layers.
  - `vertical-slice-dashboard.html` embedded `DEFAULT_STATE` is also updated to the Pass 3 complete state.
- Current blocker before Pass 4:
  - None for Pass 3.
  - Continue with Day Reset and Minimum Viable Day only; do not start diary, skills library, coaching, chain analysis, voice, insights, exports, privacy controls, offline sync, or PWA hardening.

## Pass 4: Day Reset and Minimum Viable Day (complete)

- Frontend: `public/index.html` now includes a Planner / Day Reset section that appears after routine setup.
- UX guardrail: reset copy uses the non-shaming missed-anchor framing, "Missing an anchor is information, not failure."
- CSS: `public/css/app.css` includes the reset card in the existing vertical-slice card system.
- Client JS: `public/js/app.js` validates reset fields, submits the day-reset payload, and renders the updated minimum viable day plan while keeping the anchor list visible.
- Bun API:
  - `POST /api/today/reset`
- Database: `daily_plans` now stores reset mode, must-dos, deferred items, regulation action, and reset history.
- Safety/agents placeholder: Pass 4 uses deterministic local Structure Coach-style rules only. No OpenAI call is made.
- Tests:
  - `bun run test` passed: 25 unit/API tests.
  - `bun run test:browser` passed: 15 Playwright browser tests.
- Manual browser verification:
  - URL: `http://127.0.0.1:3210`
  - Account, consent, onboarding, routine setup, and minimum viable day reset worked end to end.
  - Manual reset rendered "Minimum viable day set.", "Minimum viable day set: do therapy, then take 10-min walk.", and deferred items.
  - Morning, Midday, and Evening anchors remained visible after reset.
  - `playwright-cli console` reported 0 errors and 0 warnings.
- Dashboard artifacts:
  - `vertical-slice-dashboard-anchor-pass4.json` is importable into `vertical-slice-dashboard.html` with Pass 0 through Pass 4 marked `done` across all layers.
  - `vertical-slice-dashboard.html` embedded `DEFAULT_STATE` is also updated to the Pass 4 complete state.
- Current blocker before Pass 5:
  - None for Pass 4.
  - Continue with Evening Diary Card only; do not start skills library, coaching, chain analysis, voice, insights, exports, privacy controls, offline sync, notifications, or PWA hardening.

## Pass 5: Evening Diary Card (complete)

- Frontend: `public/index.html` now includes a Full Diary Card section that appears after routine setup.
- UX/accessibility cleanup: quick check-in controls were renamed to "Primary urge" and "Check-in note" so the new diary-card urge and note fields do not create ambiguous accessible labels.
- CSS: `public/css/app.css` styles the diary card, fieldsets, selects, number inputs, and text areas in the existing vertical-slice card system.
- Client JS: `public/js/app.js` validates required stable 0-5 diary fields, submits the diary payload, and renders saved status, next step, and top target.
- Bun API:
  - `GET /api/diary/:date`
  - `PUT /api/diary/:date`
- Database: PostgreSQL now has `diary_schemas`, `behavior_targets`, and `diary_entries`; diary entries persist anchor completion, emotions, urges, target occurrence, skills used, overall difficulty, and optional first-party fields.
- Safety/agents placeholder: Pass 5 uses deterministic local insight seeding only. No OpenAI call is made.
- Tests:
  - `bun run test` passed: 29 unit/API tests.
  - `bun run test:browser` passed: 17 Playwright browser tests.
- Manual browser verification:
  - URL: `http://127.0.0.1:3210`
  - Account, consent, onboarding, routine setup, and Full Diary Card save worked end to end.
  - Manual diary save rendered "Diary card saved.", "Diary saved. Choose one small setup step for tomorrow.", and "Top target: isolate_avoid."
  - `playwright-cli console` reported 0 errors and 0 warnings.
- Dashboard artifacts:
  - `vertical-slice-dashboard-anchor-pass5.json` is importable into `vertical-slice-dashboard.html` with Pass 0 through Pass 5 marked `done` across all layers.
  - `vertical-slice-dashboard.html` embedded `DEFAULT_STATE` is also updated to the Pass 5 complete state.
- Current blocker before Pass 6:
  - None for Pass 5.
  - Continue with Skills Library and Guided Exercise only; do not start coaching, chain analysis, voice, insights, exports, privacy controls, offline sync, notifications, or PWA hardening.

## Pass 6: Skills Library and Guided Exercise (complete)

- Frontend: `public/index.html` now includes a Skills Library section that appears after routine setup.
- UI: users can browse seeded DBT skills, filter by module, search already-loaded skills, open a skill detail, start an exercise, and submit helpfulness.
- CSS: `public/css/app.css` styles module tabs, skill cards, skill detail, and exercise controls in the existing vertical-slice card system.
- Client JS: `public/js/app.js` loads skills, filters locally, fetches skill detail, validates helpfulness rating, saves the guided session, and renders the follow-up prompt plus recent skill state.
- Bun API:
  - `GET /api/skills`
  - `GET /api/skills/:id`
  - `POST /api/skills/:id/sessions`
- Database: PostgreSQL now has `skill_definitions` and `skill_sessions`; seed skills are `stop`, `paced_breathing`, and `opposite_action`.
- Safety/agents placeholder: Pass 6 uses deterministic seeded skill content only. No AI matching, coaching, or OpenAI call is made.
- Tests:
  - `bun run test` passed: 34 unit/API tests.
  - `bun run test:browser` passed: 19 Playwright browser tests.
- Manual browser verification:
  - URL: `http://127.0.0.1:3210`
  - Account, consent, onboarding, routine setup, Skills Library search, Paced Breathing detail, exercise completion, follow-up prompt, and recent skill state worked end to end.
  - Manual exercise rendered "Skill session saved.", "What changed after paced breathing?", and "Recent: paced_breathing."
  - `playwright-cli console` reported 0 errors and 0 warnings.
- Dashboard artifacts:
  - `vertical-slice-dashboard-anchor-pass6.json` is importable into `vertical-slice-dashboard.html` with Pass 0 through Pass 6 marked `done` across all layers.
  - `vertical-slice-dashboard.html` embedded `DEFAULT_STATE` is also updated to the Pass 6 complete state.
- Current blocker before Pass 7:
  - None for Pass 6.
  - Continue with Text Coach with Safety Gate only; do not start chain analysis, voice, insights, exports, privacy controls, offline sync, notifications, or PWA hardening.

## Pass 7: Text Coach with Safety Gate (complete)

- Frontend: `public/index.html` now includes a Text Coach section that appears after routine setup.
- UI: users can choose a coach mode, send one text message, receive a short structured reply with next action, and see the specialist used.
- Safety UI: elevated and acute messages render Coach Safety Mode instead of normal coaching; acute mode disables the coach controls for the session.
- CSS: `public/css/app.css` styles the coach card, thread, and scoped safety takeover in the existing vertical-slice card system.
- Client JS: `public/js/app.js` validates coach message text, submits to the coach route, renders normal replies, renders Safety Mode, and locks controls for acute responses.
- Bun API:
  - `POST /api/coach/messages`
- Database: PostgreSQL now has `agent_runs` and `coach_messages`; `safety_events` is reused for elevated and acute coach interruptions.
- Safety/agents placeholder: Pass 7 uses deterministic local safety classification and deterministic local coach replies. No OpenAI call is made yet; traces use sanitized `inputFingerprint` and context refs instead of raw message text.
- Tests:
  - `bun run test` passed: 38 unit/API tests.
  - `bun run test:browser` passed: 22 Playwright browser tests.
- Manual browser verification:
  - URL: `http://127.0.0.1:3210`
  - Account, consent, onboarding, routine setup, normal Text Coach reply, elevated Safety Mode, and acute coach lock worked end to end.
  - Manual normal coach rendered "Coach: Let's reduce the day to one must-do.", "Next action: Choose one must-do", and "Specialist: Structure Coach."
  - Manual elevated safety rendered "Are you safe right now?" and "Grounding skill: Paced Breathing."
  - Manual acute safety rendered "Emergency support now" and disabled Send.
  - `playwright-cli console` reported 0 errors and 0 warnings.
- Dashboard artifacts:
  - `vertical-slice-dashboard-anchor-pass7.json` is importable into `vertical-slice-dashboard.html` with Pass 0 through Pass 7 marked `done` across all layers.
  - `vertical-slice-dashboard.html` embedded `DEFAULT_STATE` is also updated to the Pass 7 complete state.
- Current blocker before Pass 8:
  - None for Pass 7.
  - Continue with Chain Analysis only; do not start voice, insights, exports, privacy controls, offline sync, notifications, or PWA hardening.

## Pass 8-13: Final Vertical Slices (complete)

- Pass 8 Chain Analysis:
  - Frontend: `public/index.html` now includes draft creation and completion forms for prompting event, vulnerabilities, links, consequences, alternatives, and prevention plan.
  - Bun API: `POST /api/chain-analyses`, `PATCH /api/chain-analyses/:id`.
  - Database: `chain_analyses` stores structured JSON sections, status, source refs, prevention plan, and ownership.
- Pass 9 Live Voice Coach:
  - Frontend: local voice-session surface supports Do Not Save, transcript preview status, start, and end controls.
  - Bun API: `POST /api/voice/client-secret`, `POST /api/voice/sessions/:id/end`.
  - Database: `voice_sessions` stores session metadata, retention flags, transcript opt-in, and summary only when opted in.
  - Safety/privacy: route returns deterministic local client-secret placeholder only; no `OPENAI_API_KEY`, real OpenAI call, or raw audio storage.
- Pass 10 Insights and Weekly Review:
  - Frontend: Insights and Weekly Review surface renders structure score, evidence-linked insight card, and weekly recommendation.
  - Bun API: `GET /api/insights`, `GET /api/weekly-review/:weekStart`.
  - Database: `weekly_reviews` stores weekly summary arrays and evidence refs; insights are deterministic synthesis for this slice.
- Pass 11 Session Prep Export:
  - Frontend: packet generation supports diary, skills, chain-analysis section toggles, redaction toggle, status, and local download link.
  - Bun API: `POST /api/session-packets`, `GET /api/session-packets/:id`.
  - Database: `session_packets` stores date range, included sections, redactions, share mode, and status.
- Pass 12 Privacy, Retention, and Data Controls:
  - Frontend: privacy settings, export request, and confirmed delete request flows are browser reachable.
  - Bun API: `PATCH /api/me/settings`, `POST /api/privacy/export`, `POST /api/privacy/delete-request`.
  - Database: `user_settings`, `privacy_exports`, and `delete_requests` persist retention, export, and scheduled deletion records.
- Pass 13 Notifications, Offline Capture, and PWA Hardening:
  - Frontend: notification opt-in, quiet hours, client mutation id, and offline queue sync flows are browser reachable.
  - Bun API: `POST /api/sync/offline-queue` plus settings reuse for notification preferences.
  - Database: `offline_mutations` persists idempotent client mutations and rejects duplicates.
- Tests:
  - RED verified before implementation: API suite failed on missing routes and browser suite failed on missing Pass 8-13 UI.
  - `bun run db:reset` passed with migrations 001-014 and seed load.
  - `bun run test` passed: 44 unit/API tests.
  - `bun run test:browser` passed: 28 Playwright browser tests.
- Manual browser verification:
  - URL: `http://127.0.0.1:3210`
  - Account, consent, onboarding, chain analysis, voice start/end, insights, packet export, privacy settings/export/delete, notification settings, and offline queue sync worked end to end.
  - Manual console check reported 0 errors and 0 warnings.
- Dashboard artifacts:
  - `vertical-slice-dashboard-anchor-pass13.json` is importable into `vertical-slice-dashboard.html` with Pass 0 through Pass 13 marked `done` across all layers.
  - `vertical-slice-dashboard.html` embedded `DEFAULT_STATE` is updated to the Pass 13 complete state.
- Current blocker:
  - None for the planned Pass 0-13 walking skeleton.
  - Remaining production work is hardening beyond MVP: real Realtime integration behind safe server-only configuration, clinician/legal copy review, true export file generation, service worker install/sync, and full privacy deletion execution.

## Production Hardening: Private Beta (complete)

- Security and production config:
  - `server/config.js` validates required production env vars for private beta.
  - API responses now include `x-request-id`.
  - Production session cookies use `HttpOnly`, `SameSite=Lax`, and `Secure`.
  - Production cookie-authenticated mutations require CSRF via `/api/csrf` and `x-csrf-token`.
- Real voice session setup:
  - Voice setup now supports server-mediated WebRTC using backend-owned Realtime call creation.
  - Browser sends SDP offer to Bun and receives SDP answer metadata; `OPENAI_API_KEY` remains backend-only.
  - Voice sessions persist `openai_call_id`; end route invokes hangup through the Realtime service boundary.
  - Local/test mode uses deterministic SDP answer unless production networking is explicitly enabled.
- Real export artifacts:
  - Session prep export now writes authenticated JSON artifacts and serves downloads through `/api/exports/:id/download`.
  - Export payloads respect redaction before writing artifact content.
  - Privacy export now creates artifact metadata and download URL.
- Privacy deletion execution:
  - Delete requests can be executed through `/api/privacy/delete-requests/:id/execute`.
  - Execution deletes product-side user data and export artifacts while keeping minimal delete request completion metadata.
- PWA install and offline capture:
  - Added `public/manifest.webmanifest` and `public/service-worker.js`.
  - Client registers service worker progressively and caches only app-shell assets, not API responses.
  - Offline sync failures store local queued mutations and retry through `/api/sync/offline-queue`.
- Observability and release checks:
  - Added `audit_events` table and redacted audit event persistence for voice, exports, deletion, and offline sync.
  - Added `server/readiness.js` and `bun run check:private-beta`.
- Tests:
  - RED verified before implementation: API failed on missing readiness/hardening modules; browser failed on voice/export/delete/PWA expectations.
  - `bun run db:reset` passed with migrations 001-015 and seed load.
  - `bun run test` passed: 50 unit/API tests.
  - `bun run test:browser` passed: 33 Playwright browser tests.
  - `bun run check:private-beta` passed with production-style env values.
- Manual browser verification:
  - URL: `http://127.0.0.1:3210`
  - Account, consent, onboarding, server-mediated voice setup/end, JSON packet export, delete execution, and PWA service worker registration worked end to end.
  - Manual console check reported 0 errors and 0 warnings.
- Dashboard artifacts:
  - `vertical-slice-dashboard-anchor-hardening.json` is importable into `vertical-slice-dashboard.html` with all six hardening passes marked `done` across all layers.
  - `vertical-slice-dashboard.html` embedded `DEFAULT_STATE` now reflects the production-hardening board.
- Current blocker:
  - None for private-beta hardening implementation.
  - Remaining non-code gates: clinical/legal review and deployment environment provisioning with real production secrets.

## Live OpenAI Full-Function Test Slice (complete)

- Frontend usability: Live Voice Coach now exposes a visible `Use real OpenAI voice agent` checkbox. It is enabled when `/api/config/public` reports `OPENAI_API_KEY` availability on the backend, giving users a clear way to turn the real Realtime agent on for a session.
- Frontend: `public/js/app.js` supports explicit live WebRTC mode with real `RTCPeerConnection`, generated/fake browser audio capture in Playwright, SDP answer application, Realtime data-channel event tracking, and voice cleanup on end.
- Bun API/config: `OPENAI_REALTIME_LIVE_TEST=1` or `FORCE_REALTIME_NETWORK=1` enables real Realtime network calls without requiring `APP_ENV=production`; default local/test behavior remains deterministic.
- OpenAI Realtime: `server/services/realtime.js` sends server-owned SDP/session config to `/v1/realtime/calls`, parses call ids from `Location`, applies timeouts, redacts secret-shaped error text, and checks hangup response status.
- Seed data: `bun run db:seed:live-test` creates repeatable generated prototype data for auth, consents, onboarding, routines, check-ins, diary, skills, coach, chain analysis, safety plan, voice sessions, weekly review, exports, offline mutations, privacy settings, and delete-request-ready state.
- Live tests: `bun run test:openai:live` seeds data, runs full seeded API feature coverage, performs a real OpenAI Realtime WebSocket smoke test, and runs live Playwright WebRTC with generated browser audio.
- Offline/deletion hardening: offline sync accepts generated routine completion and chain-analysis mutations; deletion execution order handles completed check-ins referenced by routine instances.
- Dashboard artifacts:
  - `vertical-slice-dashboard-anchor-hardening.json` now includes "Full-Function Live OpenAI Test Slice".
  - `vertical-slice-dashboard.html` embedded `DEFAULT_STATE` reflects the completed live-test slice.
- Tests:
  - `bun run db:reset` passed.
  - `bun run db:seed:live-test` passed.
  - `bun run test` passed: 54 unit/API tests.
  - `PORT=3212 bun run test:browser` passed: 33 Playwright browser tests plus 1 live OpenAI test skipped by default.
  - `OPENAI_REALTIME_LIVE_TEST=1 bun run test:openai:live` passed: 3 live Bun tests and 1 live Playwright WebRTC test.
- Current blocker:
  - None for the live-test slice. Live OpenAI verification consumes API quota and remains explicitly opt-in.

## Returning User Auth and Password Reset Slice (complete)

- Frontend: first screen now uses a semantic Account Access region with `Sign in` and `Create account` modes, explicit new-account consent, native `<dialog>` password reset, and calm transitions with reduced-motion support.
- Returning users: `GET /api/app/bootstrap` lets the browser resume saved state after sign-in or page reload, revealing consent completion, onboarding, or the main app based on server state.
- Password reset: local/test/dev flow creates one-time reset codes, stores only hashed reset tokens, locks tokens after repeated bad attempts, updates the password, consumes the token, and invalidates existing sessions. Production responses do not expose reset codes.
- Database/readiness: migration `016_password_reset_tokens.sql` adds reset-token persistence, and private-beta readiness includes the table.
- Tests:
  - RED verified before implementation: API failed on missing bootstrap/reset routes; browser failed on missing segmented auth/reset UI.
  - `bun run db:reset` passed with migrations 001-016 and seed load.
  - `bun run test` passed: 58 unit/API tests.
  - `PORT=3212 bun run test:browser` passed: 35 Playwright browser tests plus 1 live OpenAI test skipped by default.
- Manual browser verification:
  - URL: `http://127.0.0.1:3210`
  - Created account, completed onboarding, cleared cookies, signed back in with the same account, resumed the main app, and saw 0 console/page errors.
- Dashboard artifacts:
  - `vertical-slice-dashboard-anchor-hardening.json` and `vertical-slice-dashboard.html` include "Returning User Auth and Password Reset" marked `done` across all layers.
- Current blocker:
  - None for returning-user auth/reset. Real email delivery remains deferred; local/dev reset code flow is intentional for the prototype.
