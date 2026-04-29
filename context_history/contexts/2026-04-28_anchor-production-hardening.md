## Anchor Production Hardening — 2026-04-28 16:45 EDT

### Phase
implementation

### Summary
Implemented the private-beta production-hardening track for Anchor. The app now has production env validation, secure cookie/CSRF support, request ids, server-mediated Realtime voice setup boundary, authenticated JSON export artifacts, executable privacy deletion, app-shell PWA registration, offline retry storage, audit events, and a private-beta readiness check.

### Files Created/Modified
| File | Purpose |
|------|---------|
| `/Users/twoedge/Dev/dbt/PLAN.md` | Replaced completed Pass 8-13 plan with active production-hardening checklist. |
| `/Users/twoedge/Dev/dbt/tests/api/production-hardening.test.js` | API tests for config, cookies, CSRF, voice, exports, deletion, audit, and readiness. |
| `/Users/twoedge/Dev/dbt/tests/browser/production-hardening.spec.js` | Browser tests for hardening voice, exports, deletion, PWA, offline retry, and console health. |
| `/Users/twoedge/Dev/dbt/server/config.js` | Added production env validation and hardening config defaults. |
| `/Users/twoedge/Dev/dbt/server/http/cookies.js` | Added secure cookie options and CSRF cookie helpers. |
| `/Users/twoedge/Dev/dbt/server/http/response.js` | Added request-id response headers. |
| `/Users/twoedge/Dev/dbt/server/app.js` | Added CSRF route/enforcement, voice Realtime boundary, export downloads, deletion execution, and audit calls. |
| `/Users/twoedge/Dev/dbt/server/db.js` | Added hardening persistence methods for required tables, export artifacts, deletion execution, audit events, and voice call id. |
| `/Users/twoedge/Dev/dbt/server/readiness.js` | Added private-beta readiness checks. |
| `/Users/twoedge/Dev/dbt/server/services/realtime.js` | Added server-mediated Realtime call and hangup service. |
| `/Users/twoedge/Dev/dbt/server/services/export-service.js` | Added JSON artifact writing/reading and redaction helper. |
| `/Users/twoedge/Dev/dbt/server/services/audit.js` | Added audit metadata redaction. |
| `/Users/twoedge/Dev/dbt/db/migrations/015_production_hardening.sql` | Added hardening schema changes, export artifacts, and audit events. |
| `/Users/twoedge/Dev/dbt/public/index.html` | Added manifest link and delete execution control. |
| `/Users/twoedge/Dev/dbt/public/js/app.js` | Added CSRF usage, service worker registration, voice SDP setup, export link handling, deletion execution, and offline retry storage. |
| `/Users/twoedge/Dev/dbt/public/manifest.webmanifest` | Added PWA manifest. |
| `/Users/twoedge/Dev/dbt/public/service-worker.js` | Added app-shell caching without API response caching. |
| `/Users/twoedge/Dev/dbt/scripts/private-beta-check.js` | Added readiness-check CLI. |
| `/Users/twoedge/Dev/dbt/package.json` | Added `check:private-beta` script. |
| `/Users/twoedge/Dev/dbt/vertical-slice-dashboard-anchor-hardening.json` | Added completed hardening dashboard artifact. |
| `/Users/twoedge/Dev/dbt/vertical-slice-dashboard.html` | Embedded the production-hardening dashboard state. |
| `/Users/twoedge/Dev/dbt/CAPABILITY_LEDGER.md` | Added production-hardening capability ledger entry. |

### Key Decisions
- Kept therapist sharing out of hardening scope. Session prep is export-only.
- Used server-mediated Realtime call setup with backend-owned API key. Local/test mode returns deterministic SDP unless production networking is enabled.
- Production CSRF enforcement is gated by production config to preserve local developer/browser-test ergonomics while verifying the private-beta behavior in focused tests.
- JSON artifacts are required for this phase; PDF remains optional/future.
- Service worker caches app-shell assets only and ignores `/api/*` requests.

### Technical Details
- New endpoints:
  - `GET /api/csrf`
  - `GET /api/exports/:artifactId/download`
  - `POST /api/privacy/delete-requests/:deleteRequestId/execute`
- Hardened endpoints:
  - `POST /api/voice/client-secret` now accepts `sdpOffer` and returns `sdpAnswer` plus `openAiCallId`.
  - `POST /api/session-packets` now creates a JSON artifact and authenticated download URL.
  - `POST /api/privacy/export` now creates a JSON artifact and download URL.
- New private-beta CLI:
  - `bun run check:private-beta`
- The app server is running in tmux session `anchor-hardening` on `http://127.0.0.1:3210`.

### Testing/Verification
- Verified RED before implementation:
  - `bun run test` failed on missing `server/readiness.js`.
  - `bun run test:browser` failed on hardening voice/export/delete/PWA expectations.
- Verified GREEN after implementation:
  - `bun run db:reset` passed with migrations 001-015 and seed data.
  - `bun run test` passed: 50 tests, 149 expect calls.
  - `bun run test:browser` passed: 33 browser tests.
  - `bun run check:private-beta` passed with production-style env values.
  - Manual browser smoke passed at `http://127.0.0.1:3210`; console checks reported 0 errors and 0 warnings.

### State
completed

### Next Steps
- Provision deployment environment variables and real `OPENAI_API_KEY`/model values.
- Run clinical/legal review for DBT copy, safety copy, retention, deletion, and export behavior.
- Add deployment pipeline checks around `bun run check:private-beta`.
- Decide whether PDF exports and therapist share links are V1 or post-beta.

### Related Files
- `/Users/twoedge/Dev/dbt/PLAN.md`
- `/Users/twoedge/Dev/dbt/SPEC.md`
- `/Users/twoedge/Dev/dbt/CAPABILITY_LEDGER.md`
- `/Users/twoedge/Dev/dbt/vertical-slice-dashboard.html`
- `/Users/twoedge/Dev/dbt/vertical-slice-dashboard-anchor-hardening.json`
