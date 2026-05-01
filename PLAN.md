# Anchor Session Shell, Navigation, and Guided UX Plan

## Current Execution Scope

Fix refresh/login-state confusion, add an authenticated app shell with navigation and logout, and replace the current post-login long card list with a guided one-section-at-a-time experience.

## Checklist

- [x] Delegate pre-task verification to an Agent Team member and review the report. Attempted new delegation but the thread limit was reached; QA review was delegated to an existing agent after implementation.
- [x] Write RED browser tests for authenticated refresh, app shell navigation, logout, and guided section visibility.
- [x] Write RED API/cache tests for bootstrap no-cache behavior if server headers are needed.
- [x] Update service-worker app-shell caching to network-first, versioned, and old-cache-cleaning.
- [x] Add page boot/checking-session state so auth is shown only after unauthenticated bootstrap is confirmed.
- [x] Add semantic authenticated header/nav/menu/logout controls.
- [x] Add guided client-side section routing with only one active product section visible.
- [x] Preserve consent, onboarding, returning-user, password-reset, and crisis/help flows.
- [x] Add peaceful transitions and reduced-motion handling for shell/view state.
- [x] Update README, CAPABILITY_LEDGER, context history, NotebookLM memory, and vertical-slice dashboard artifacts.
- [x] Run `bun run db:reset`.
- [x] Run `bun run test`.
- [x] Run `PORT=3212 bun run test:browser`.
- [x] Perform manual smoke at `http://127.0.0.1:3210`.
- [x] Delegate QA review to an Agent Team member and resolve findings.

# Anchor Returning User Auth and Password Reset Plan

## Current Execution Scope

Implement the returning-user authentication slice: first-screen Sign in/Create account modes, session bootstrap for returning users, dev/test password reset code flow, semantic `<dialog>` reset UX, peaceful motion, tests, docs, dashboard/ledger/history updates.

## Checklist

- [x] Delegate pre-task verification to an Agent Team member and review the report.
- [x] Write RED API tests for bootstrap and password reset behavior.
- [x] Write RED browser tests for sign-in/create-account/reset UX and returning-user resume.
- [x] Add database migration and DB methods for password reset tokens and bootstrap state.
- [x] Add backend validation/routes for password reset request/confirm and authenticated bootstrap.
- [x] Replace first-screen signup-only UI with segmented auth card and semantic reset dialogs.
- [x] Wire frontend sign-in, create-account consent, bootstrap, reset request, and reset confirm behavior.
- [x] Add calm transitions/animations with reduced-motion support.
- [x] Update README, CAPABILITY_LEDGER, context history, NotebookLM memory, and vertical-slice dashboard artifacts.
- [x] Run `bun run db:reset`.
- [x] Run `bun run test`.
- [x] Run `PORT=3212 bun run test:browser`.
- [x] Perform manual smoke at `http://127.0.0.1:3210`.
- [x] Delegate QA review to an Agent Team member and resolve findings.

# Anchor README Documentation Plan

## Current Execution Scope

Create a repo-level `README.md` that explains what Anchor is, how to set up and run it locally, how to use the app workflows, and how to enable/test Realtime and agent-style features.

## Checklist

- [x] Inspect current package scripts, environment variables, product spec, and implemented Realtime/live-test behavior.
- [x] Draft `README.md` with setup, usage, Realtime agent, seed data, testing, dashboard, and troubleshooting sections.
- [x] Re-read and verify the README against the current repo.
- [x] Update project history/memory with the documentation addition.

# Anchor Full-Function Live OpenAI Test Implementation Plan

## Current Execution Scope

Add an opt-in, generated-data live test track that verifies Anchor end to end with real OpenAI Realtime calls where the product depends on them.

Target decisions:

- Release/test target: prototype/private beta verification.
- Live test command: `OPENAI_REALTIME_LIVE_TEST=1 bun run test:openai:live`.
- Seed command: `bun run db:seed:live-test`.
- Default tests stay deterministic and do not call OpenAI.
- Test data is generated prototype data. There are no real users in this environment.
- Live tests may exercise audio, transcripts, diary, coach, safety-plan, chain-analysis, export, deletion, offline, and PWA flows.

## Strict Guardrails

- Do not expose `OPENAI_API_KEY` to the browser, API responses, logs, generated artifacts, or test output.
- Do not require `APP_ENV=production` to force real OpenAI network calls.
- Keep normal `bun run test` and `bun run test:browser` runnable without OpenAI.
- Keep the app runnable at `http://127.0.0.1:3210`.
- Keep every implementation step vertical-slice testable.

## Checklist

- [x] Delegate pre-task verification to Agent Team and review reports.
- [x] Write RED tests for live-test env gating, `forceRealtimeNetwork`, and secret redaction.
- [x] Write RED tests for repeatable generated live-test seed data.
- [x] Write RED API tests for seeded auth, consent, onboarding, routines, check-ins, diary, skills, coach, chain analysis, safety plan, exports, offline sync, deletion, and audit events.
- [x] Write RED tests for live Realtime WebSocket opt-in behavior.
- [x] Write RED browser tests for seeded workflow navigation, PWA/offline checks, and live WebRTC voice setup with generated audio.
- [x] Implement live-test env helper and config wiring.
- [x] Implement `scripts/db-seed-live-test.js` and `bun run db:seed:live-test`.
- [x] Implement generated audio/test data fixtures for live tests.
- [x] Implement `bun run test:openai:live` runner.
- [x] Implement WebSocket live test path.
- [x] Implement WebRTC live browser test path through Anchor's server-mediated voice route.
- [x] Harden Realtime error handling, timeouts, hangup status checks, and secret redaction as needed.
- [x] Update `vertical-slice-dashboard-anchor-hardening.json` and embedded `vertical-slice-dashboard.html` state with the live-test slice.
- [x] Update `CAPABILITY_LEDGER.md`.
- [x] Update local context history and NotebookLM memory.
- [x] Run `bun run db:reset`.
- [x] Run `bun run db:seed:live-test`.
- [x] Run `bun run test`.
- [x] Run `bun run test:browser`.
- [x] Run `OPENAI_REALTIME_LIVE_TEST=1 bun run test:openai:live` when `OPENAI_API_KEY` is available.
- [x] Perform manual browser smoke at `http://127.0.0.1:3210` with seeded test user.
- [x] Delegate QA review to Agent Team and resolve findings.
