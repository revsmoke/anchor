# Tests, Ledger, and Artifact QA Report

Date: 2026-05-12
Lane: tests/ledger/artifact QA review
Scope: `CAPABILITY_LEDGER.md`, `tests/unit`, `tests/api`, `tests/browser`, Playwright configs, `README.md`, `context_history`, and vertical-slice JSON artifacts.

## Executive Summary

The repo has broad nominal coverage and the ledger/dashboard are mostly synchronized at the artifact level: `vertical-slice-dashboard.html` embeds the same 10-pass hardening state as `vertical-slice-dashboard-anchor-hardening.json`, and every hardening cell is marked `done`.

The largest QA risk is not missing test files. It is that several "complete" capabilities are proven by shallow browser assertions or in-memory API fakes rather than durable behavior against the real PostgreSQL/export/cache/runtime boundaries the ledger claims. The next implementation plan should add red tests that fail on missing persisted side effects, real artifact content, service-worker cache boundaries, and cross-session reload/resume behavior.

## Top 3 Concerns

1. **Browser tests for Pass 8-13 and hardening are often text-success checks, not functional proof.** Examples: packet generation only checks "Packet ready" / "Download packet" in `tests/browser/pass8-13-final-slices.spec.js:69-81`; privacy export/delete only checks status copy in `tests/browser/pass8-13-final-slices.spec.js:84-99`; voice local flow only checks visible text in `tests/browser/pass8-13-final-slices.spec.js:42-54`.

2. **API tests cover behavior through injected in-memory fakes, so database/migration/deletion claims are not continuously tested by `bun run test`.** The final-slice and hardening API suites define Maps/Sets as fake stores in `tests/api/pass8-13-final-slices.test.js:23-29` and `tests/api/production-hardening.test.js:25-32`. That is useful unit-style coverage, but it does not prove PostgreSQL migrations, reset order, FK deletion ordering, artifact file cleanup, or service-worker/runtime behavior.

3. **Ledger/dashboard/docs say everything is done, but some completion claims still need richer verification.** The ledger marks hardening and live OpenAI complete in `CAPABILITY_LEDGER.md:291-353`; README says exports are generated and deletion removes user-owned product data in `README.md:242-251`; the hardening dashboard marks all 60 cells done. Existing default browser coverage does not download and inspect generated packet/privacy export content, verify no API responses enter Cache Storage, or re-authenticate after deletion to prove data/session invalidation.

## Coverage Notes

### Ledger Claims With Meaningful Coverage

- Auth, consent, bootstrap, password reset, and session invalidation have decent API coverage: `tests/api/pass1-auth-consent.test.js:315-430` exercises reset-code visibility, password change, old-session invalidation, old-password rejection, token reuse rejection, production dev-code omission, and bad-code lockout.
- Focus plan and Midday have both API and browser coverage: `tests/api/pass3-check-ins.test.js:353-390` covers focus-plan auth/validation/upsert/bootstrap; `tests/browser/pass3-check-in.spec.js:51-111` covers focus-plan save, hash routing, Midday completion, and Today progress text.
- Live OpenAI has opt-in coverage that is more functional than most browser tests: `tests/browser/live-openai-full-function.spec.js:99-107` waits for WebRTC-ready UI and polls `window.anchorVoiceEvents`, while `tests/live/openai-websocket-live.test.js:6-12` checks a real Realtime WebSocket event when enabled.

### Claimed-Complete Capabilities Lacking Meaningful Default Tests

- **Dashboard artifact importability.** The ledger repeatedly claims dashboard artifacts are importable, but I found no test that loads `vertical-slice-dashboard.html`, imports each JSON artifact, and asserts pass/layer/status integrity. A local Node parse confirms the JSON shapes are valid, but that is not an automated test.
- **PostgreSQL migrations and reset drop order.** Ledger entries claim specific tables exist and `bun run db:reset` passed. The default `bun run test` suite uses fake DB interfaces for API behavior and does not prove real migrations apply cleanly.
- **Session packet/privacy export content from the browser.** API hardening inspects a downloaded JSON artifact with redaction at `tests/api/production-hardening.test.js:413-448`, but browser tests only check the link shape or status text, not the actual download body.
- **Privacy deletion execution across persisted data.** API hardening checks fake deletion side effects at `tests/api/production-hardening.test.js:451-471`; browser hardening checks "Deletion completed." at `tests/browser/production-hardening.spec.js:54-63`. Neither default browser test proves the user is logged out, product data is gone after reload, or export artifacts are inaccessible.
- **PWA/offline app-shell cache policy.** Browser hardening verifies service-worker registration and offline queue retry in `tests/browser/production-hardening.spec.js:66-78`, but does not inspect Cache Storage to prove `/api/*` responses are not cached or that offline app-shell navigation works after a reload.
- **README current-state accuracy.** README still says "The current target is private beta hardening" in `README.md:359-361`, while the ledger and dashboard also include later "Session Shell" and "Wayfinding, Focus Plan, and Midday Anchor" passes as complete. This is low risk operational drift, but it can mislead the next planner about what phase the repo is in.

## Text-Only Or Shallow Browser Assertions

- `tests/browser/pass8-13-final-slices.spec.js:57-67` loads insights and asserts fixed strings: "Structure score: 72", "Structure supports mood", and "Keep morning anchor small." It does not seed or mutate inputs to prove the insight is derived from evidence.
- `tests/browser/pass8-13-final-slices.spec.js:69-81` checks packet status/link text without following the link or inspecting redaction.
- `tests/browser/pass8-13-final-slices.spec.js:84-99` checks settings/export/delete status copy without reloading, fetching settings, verifying export metadata, or proving delete-request persistence.
- `tests/browser/pass8-13-final-slices.spec.js:104-115` accepts one offline mutation and checks "Accepted", but does not assert duplicate rejection, supported entity routing, or persisted queue behavior after reload.
- `tests/browser/production-hardening.spec.js:29-41` starts/ends voice and checks "Server-mediated WebRTC connected" / "Voice session ended"; it does not inspect network calls, persisted `openai_call_id`, or hangup side effects in the browser lane.
- `tests/browser/production-hardening.spec.js:81-91` is a useful console-health test, but it can pass while core behaviors are shallowly mocked or only status-rendered.

## Ledger / Dashboard / Context Drift

- `vertical-slice-dashboard.html` and `vertical-slice-dashboard-anchor-hardening.json` are synchronized for the active hardening board: both have 10 passes and identical pass names, and the hardening JSON contains 60 `done` statuses.
- Historical product dashboard artifacts are coherent: pass0 through pass7 show incremental done/todo counts, and pass13 is 84/84 done across 14 passes and 6 layers.
- The ledger is ahead of README phrasing. README's "current target is private beta hardening" wording should become "completed private-beta hardening; current board also includes session shell and wayfinding follow-up passes" or similar.
- Context history records the same known future gaps that tests should now target: Pass 8-13 context says real export artifacts, service worker install/offline capture, and deletion execution were future work at `context_history/contexts/2026-04-28_anchor-pass8-13-final-slices.md:69-73`; hardening later claims those were implemented, but the default browser checks are still not deep enough.

## Next Red / Green / Refactor Test Plan Items

1. **Dashboard artifact contract test**
   - RED: add a unit test that loads `vertical-slice-dashboard.html`, extracts `DEFAULT_STATE`, imports each `vertical-slice-dashboard-anchor-*.json`, and fails if pass/layer/status dimensions are invalid or active dashboard JSON diverges from embedded state.
   - GREEN: normalize any stale artifacts or dashboard embedding.
   - REFACTOR: add a small dashboard-state parser helper for test reuse.

2. **Browser export download and redaction test**
   - RED: extend `tests/browser/production-hardening.spec.js` to click/download the packet link, parse JSON, assert selected sections exist, and assert notes are redacted.
   - GREEN: wire browser download route/content until the JSON body passes.
   - REFACTOR: share export assertion helpers between API and browser tests.

3. **Browser privacy deletion persistence test**
   - RED: after executing delete in the browser, reload and assert authenticated product surfaces are unavailable, old session bootstrap is rejected or signed out, and prior export download URL returns unauthorized/not found.
   - GREEN: fix deletion/session/artifact cleanup if the test fails.
   - REFACTOR: centralize delete-flow setup and artifact URL capture.

4. **Service worker cache-boundary test**
   - RED: in Playwright, register the service worker, trigger app/API fetches, inspect Cache Storage keys/requests, and fail if any `/api/*` URL is cached.
   - GREEN: adjust service-worker fetch/cache rules if needed.
   - REFACTOR: expose a test-only cache inspection helper from the page context.

5. **Offline queue durability and duplicate rejection test**
   - RED: abort sync to queue a mutation, reload, restore the route, sync, then resubmit the same client mutation id and assert duplicate/needs-review behavior rather than a second accept.
   - GREEN: ensure local queue and backend idempotency survive reload.
   - REFACTOR: reduce repeated setup in offline browser tests.

6. **Real PostgreSQL migration smoke in CI/default plan**
   - RED: add a focused integration command or test that runs migrations against a disposable test database and validates required tables from readiness, including the latest `daily_focus_plans`.
   - GREEN: fix migration/reset drift if present.
   - REFACTOR: keep mocked API tests fast; run DB smoke as a separate named script.

7. **Insight derivation test**
   - RED: seed contrasting diary/check-in/skill data and assert insights/weekly review output changes with evidence refs, not just fixed "Structure score: 72" text.
   - GREEN: implement deterministic derivation or explicitly downgrade the claim to static prototype copy.
   - REFACTOR: isolate insight calculation for unit tests.

## Verification Performed

- Read-only inspection of requested files and directories.
- Parsed all `vertical-slice-dashboard-anchor-*.json` files with Node to verify JSON shape/counts.
- Compared `vertical-slice-dashboard.html` embedded `DEFAULT_STATE` against `vertical-slice-dashboard-anchor-hardening.json`.
- Did not run the full test suites and did not modify source code.
