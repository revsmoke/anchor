# Anchor

Anchor is a DBT daily-structure companion prototype. It helps a user build a simple daily rhythm around morning, midday, and evening anchors; capture check-ins and diary-card data; practice DBT skills; run chain analysis; prepare session exports; manage privacy controls; and test a server-mediated OpenAI Realtime voice coach.

Anchor is not therapy and is not emergency care. The app keeps U.S. crisis resources visible in the product shell and safety states: call `911` for immediate danger, or call/text `988` for crisis support in the United States.

## Tech Stack

- Frontend: HTML5, CSS, and vanilla JavaScript in `public/`
- Backend: Bun and JavaScript in `server/`
- Database: PostgreSQL migrations and seed scripts in `db/` and `scripts/`
- Browser testing: Playwright
- Realtime voice: server-mediated OpenAI Realtime WebRTC calls
- Project tracking: vertical-slice dashboard artifacts in `vertical-slice-dashboard.html` and `vertical-slice-dashboard-anchor-hardening.json`

## Repository Layout

- `public/index.html`: the single-page Anchor application
- `public/css/app.css`: app styling
- `public/js/app.js`: browser behavior, API calls, offline queue, and Realtime WebRTC setup
- `public/manifest.webmanifest`: PWA manifest
- `public/service-worker.js`: app-shell service worker; sensitive API responses are not cached
- `server/index.js`: Bun server entrypoint
- `server/app.js`: API routes and static file handling
- `server/config.js`: local, production, and public config
- `server/db.js`: PostgreSQL data access
- `server/auth/`: password and request validation helpers
- `server/http/`: cookie and response helpers
- `server/services/`: export, audit, and Realtime integration services
- `db/migrations/`: schema migrations by vertical slice
- `db/seeds/`: base seed data
- `scripts/`: migration, reset, seed, readiness, and live OpenAI test utilities
- `tests/unit/`: unit tests
- `tests/api/`: API tests
- `tests/browser/`: Playwright browser tests
- `tests/live/`: opt-in live OpenAI tests
- `SPEC.md`: detailed product and engineering specification
- `PLAN.md`: active and completed implementation plans
- `CAPABILITY_LEDGER.md`: implemented capability ledger
- `context_history/`: local project handoff and session notes

## Prerequisites

Install or provide:

- Bun
- PostgreSQL
- A local PostgreSQL database, normally `anchor_local`
- Playwright browsers for browser tests
- An OpenAI API key only if you want to use real Realtime voice or live OpenAI tests

Create a local database if it does not exist:

```bash
createdb anchor_local
```

Install dependencies:

```bash
bun install
```

## Environment

Copy the example file and edit local values:

```bash
cp .env.example .env
```

Important variables:

```bash
APP_ENV=local
APP_ORIGIN=http://127.0.0.1:3210
PORT=3210
DATABASE_URL=postgres://localhost:5432/anchor_local
SESSION_SECRET=replace-me-for-local-development
OPENAI_API_KEY=replace-me
REALTIME_MODEL=gpt-realtime
TEXT_MODEL=gpt-4.1-mini
TRACE_RETENTION_DAYS=30
TRANSCRIPT_RETENTION_DAYS=30
```

Notes:

- Do not commit `.env`.
- `OPENAI_API_KEY` is never sent to the browser. The backend uses it when creating Realtime calls.
- `REALTIME_MODEL` defaults to `gpt-realtime` when not set.
- In `APP_ENV=production`, the server validates required production env vars and enables secure cookie behavior.

## Database Setup

Reset the database and apply all migrations:

```bash
bun run db:reset
```

Seed base data:

```bash
bun run db:seed
```

Seed the complete generated live-test prototype user:

```bash
bun run db:seed:live-test
```

The live-test seed command recreates a repeatable prototype account and data set:

- Email: `anchor-live-test@example.test`
- Password: `anchor-live-test-passphrase-123`

It creates consents, onboarding state, routines, check-ins, diary entries, DBT skills sessions, coach prompts, chain analysis, safety plan data, weekly review inputs, export candidates, offline queue rows, and voice-session-ready state.

## Run The App

Start the Bun server:

```bash
PORT=3210 bun run dev
```

Open:

[http://127.0.0.1:3210](http://127.0.0.1:3210)

If port `3210` is busy, choose another port and update `APP_ORIGIN` to match:

```bash
PORT=3212 APP_ORIGIN=http://127.0.0.1:3212 bun run dev
```

## Using Anchor

The current app is a prototype single-page workflow with a guided app shell. After sign-in and routine setup, Anchor opens to the `Today` view and shows one main task surface at a time. Use the primary navigation or `Menu` button to move between tools.

1. Choose `Sign in` if you already have an account, or `Create account` if you are starting fresh.
2. For a new account, check the crisis, privacy, and voice consent boxes, then save consent.
3. For a returning account, sign in with the same email and password; Anchor resumes onboarding or the main app based on saved state.
4. Complete routine setup with wake/sleep times, therapy status, goals, hard moments, and anchor times.
5. Use `Today` to review the Morning, Midday, and Evening progress rail and choose the next action.
6. Open `Check-in` to save a morning quick check-in. After it is saved, use the action panel to pick a focus, go to Midday, practice a skill, or reset today.
7. Open `Focus` to save one focus, one likely hard moment, and the skill or support step you will use before it happens. Anchor calls this a cope-ahead plan and shows the saved plan on `Today`.
8. Open `Midday` after Morning is complete to save a lightweight status check with mood, urge, energy, and a note.
9. Open `Reset` to reduce the day to a workable plan.
10. Open `Diary` to complete emotions, urges, skills, and notes.
11. Open `Skills` to practice DBT skills and compare before/after ratings.
12. Open `Coach` for prototype DBT coaching prompts.
13. Open `Chain` for chain analysis with prompting event, vulnerabilities, links, consequences, and repair plan.
14. Open `Voice` for local or real OpenAI Realtime voice.
15. Open `Insights` for insights and weekly review data.
16. Open `Exports` and `Privacy` for session-prep exports, privacy exports, delete requests, and deletion execution.
17. Open `Offline` for supported local queue workflows.

## Account Access

The first screen has two modes:

- `Sign in`: returning users enter the same email and password and resume their saved Anchor state.
- `Create account`: new users create credentials and save required crisis, privacy, and voice consent.

Use `Forgot password?` to open the native password-reset dialog. In local/test/dev environments, Anchor shows a prototype reset code in the dialog so the full reset flow can be tested without email infrastructure. Production does not return reset codes in API responses.

Successful password reset invalidates existing sessions for that account. Sign in again with the new password. Repeated invalid reset-code attempts lock the active reset token; request a new code if that happens.

## Navigation And Sessions

When a returning user loads the app, Anchor first shows `Checking your Anchor session...` while it asks the backend for authenticated bootstrap state. It only shows the account card after the backend confirms there is no active session.

After login, the authenticated shell includes:

- `Today`: the default guided view with anchors and suggested next steps.
- `Check-in`: the Morning anchor quick check-in. Completing it marks Morning complete and changes the next waypoint to Midday.
- `Focus`: the focus and cope-ahead plan. Use it to choose one focus, name a likely hard moment, and pick the skill or support step to use before that moment happens.
- `Midday`: a lightweight anchor check with mood, urge, energy, and note fields. Completing it marks Midday complete and offers Reset, Skills, or a return to Today.
- Primary navigation: one active product section is visible at a time.
- `Menu`: compact navigation control for smaller screens.
- `Log out`: clears the current session cookie and returns to the Sign in screen without deleting account data.

Guided views use URL hashes such as `#today`, `#check-in`, `#focus-plan`, `#midday`, `#reset`, and `#skills`. Browser Back and Forward move between Anchor views after you navigate inside the app, so users can return from Midday to the completed Morning result or back to Today without losing the session.

The service worker uses a network-first app-shell strategy for HTML, CSS, JavaScript, and manifest files, then falls back to cached files when offline. API responses are not cached.

## Realtime Voice Agent

Anchor includes a Live Voice Coach section. It has two modes:

- Local prototype mode: deterministic local setup used when the real OpenAI voice agent is not selected.
- Real OpenAI Realtime mode: browser WebRTC is mediated through the Bun backend and OpenAI Realtime.

To enable the real voice agent:

1. Set `OPENAI_API_KEY` in `.env` or in the server environment.
2. Set `REALTIME_MODEL=gpt-realtime` or another supported Realtime model.
3. Restart the Bun server.
4. Open the app and complete consent/onboarding.
5. In Live Voice Coach, check `Use real OpenAI voice agent`.
6. Start the voice session and allow microphone access.
7. End the session with the `End Voice Session` button.

What happens in real Realtime mode:

- The browser creates a WebRTC SDP offer.
- Anchor posts that SDP offer to `/api/voice/client-secret`.
- The Bun backend sends the SDP plus server-owned session config to OpenAI `/v1/realtime/calls`.
- The backend returns the SDP answer to the browser.
- The browser applies the SDP answer with `RTCPeerConnection.setRemoteDescription`.
- Audio and data-channel events flow through the WebRTC session.
- Ending the session calls Anchor's end route, which also attempts OpenAI call hangup when an OpenAI call id exists.

Security and privacy behavior:

- The OpenAI API key stays on the backend.
- Raw audio is not persisted by Anchor.
- The `Do not save this voice session` checkbox records the no-save preference for the session.
- Transcript/summary persistence is explicit in the voice end payload and tested in the live-test path.
- The service worker caches the app shell only, not sensitive API responses.

Developer toggles:

- The UI checkbox is the normal way to use the real agent.
- `?liveWebrtc=1` in the URL can force the browser path for development.
- `localStorage.setItem("anchor_live_webrtc", "1")` can also preselect the real-agent checkbox when the server reports OpenAI availability.

If `Use real OpenAI voice agent` is disabled, the server does not currently report OpenAI availability. Set `OPENAI_API_KEY`, restart the server, and refresh the page.

## Agent-Style Features

Anchor currently has two agent-style surfaces:

- Text Coach: `prototype` deterministic DBT coaching behavior that accepts a goal, context, and risk tier. It uses the app safety gate before returning coaching output; production-grade specialist orchestration remains deferred.
- Live Voice Coach: the OpenAI Realtime-backed voice agent path described above. The opt-in live OpenAI path is `verified`; fuller V1 controls such as mute, reconnect, and listening-state UI remain deferred.

The text coach should be treated as prototype product behavior. The live voice coach is the main OpenAI-backed interactive agent feature in this repo.

## Exports And Privacy

Anchor can generate JSON artifacts for:

- Session-prep export data
- Privacy export data

Exports are generated on the backend and served through authenticated download routes. Redaction rules are tested so fields marked as redacted do not appear in generated artifacts.

Evidence label: `prototype` with partial `verified` backend artifact behavior. Authenticated JSON export artifacts are implemented; clinician-ready PDF and scoped therapist share links are deferred or blocked pending Gate 0 decisions in `IMPLEMENTATION_PLAN.md`.

Privacy deletion execution exists for current product tables/artifacts, but V1-complete deletion requires recent-auth, full data ownership matrix coverage, session invalidation proof, and retention policy decisions.

## Offline And PWA

Anchor includes a PWA manifest and service worker.

- The app shell can be cached for offline loading.
- Sensitive API responses are not cached.
- Notification settings are `settings-only`: preferences and quiet hours are saved, but browser permission, push subscription, scheduling, and delivery are not implemented yet.
- Offline queue support is currently a `demo-fixture`: the UI exercises a synthetic mutation sync path, not automatic capture of real check-ins, diary entries, routine completions, or chain-analysis drafts.
- Queued demo mutations sync through `/api/sync/offline-queue`.
- Help Now/crisis resources remain visible in the offline app shell.

## Testing

Run deterministic unit and API tests:

```bash
bun run test
```

Run browser tests:

```bash
bun run test:browser
```

If the app is already running on `3210`, use a separate port for Playwright:

```bash
PORT=3212 bun run test:browser
```

Run private-beta readiness checks:

```bash
bun run check:private-beta
```

Run the full opt-in OpenAI live test suite:

```bash
OPENAI_REALTIME_LIVE_TEST=1 bun run test:openai:live
```

The live OpenAI suite:

- Resets and seeds generated prototype data.
- Runs live-gated API tests.
- Connects to OpenAI Realtime over WebSocket from Bun.
- Starts a real browser WebRTC Realtime voice session through Anchor.
- Uses generated browser audio for microphone input in Playwright.
- Verifies exports, deletion, offline sync, audit events, and console behavior around the live path.

Live tests consume OpenAI API quota and only run when `OPENAI_REALTIME_LIVE_TEST=1` and `OPENAI_API_KEY` are present.

## Vertical Slice Dashboard

Anchor is developed by vertical slice. The repo includes:

- `vertical-slice-dashboard.html`: browser-viewable project dashboard
- `vertical-slice-dashboard-anchor-hardening.json`: hardening-phase dashboard state
- `CAPABILITY_LEDGER.md`: ledger of implemented capabilities
- `context_history/`: durable local session history

Open the dashboard file directly in a browser or serve the repo locally and inspect it from the app environment.

## Common Troubleshooting

Database connection fails:

```bash
createdb anchor_local
bun run db:reset
```

Port is already in use:

```bash
PORT=3212 APP_ORIGIN=http://127.0.0.1:3212 bun run dev
```

The real voice-agent checkbox is disabled:

```bash
OPENAI_API_KEY=your-key REALTIME_MODEL=gpt-realtime PORT=3210 bun run dev
```

Then refresh the browser.

Browser microphone access is blocked:

- Allow microphone access for `127.0.0.1`.
- Use Playwright live tests for generated fake-audio verification.

OpenAI live tests do not run:

- Confirm `OPENAI_REALTIME_LIVE_TEST=1`.
- Confirm `OPENAI_API_KEY` is present in the shell running the test.
- Confirm `REALTIME_MODEL` is set or allow the default `gpt-realtime`.

Unexpected browser behavior:

```bash
PORT=3212 bun run test:browser
```

Then inspect Playwright output and browser console failures.

## Production-Hardening Notes

Private-beta hardening has been implemented locally. Current work is V1 truthfulness and completion gaps tracked in `IMPLEMENTATION_PLAN.md`.

Production mode requires explicit environment configuration, secure cookies, CSRF protection on cookie-authenticated mutating routes, request ids on API responses, redacted logs/errors, authenticated export downloads, deletion execution, PWA app-shell caching, audit events, and readiness checks.

Run this before private-beta verification:

```bash
bun run db:reset
bun run test
PORT=3212 bun run test:browser
bun run check:private-beta
```

Then run live verification when OpenAI quota and credentials are available:

```bash
OPENAI_REALTIME_LIVE_TEST=1 bun run test:openai:live
```
