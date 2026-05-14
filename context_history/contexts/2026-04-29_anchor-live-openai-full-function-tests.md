## Anchor Full-Function Live OpenAI Tests - 2026-04-29 01:25 EDT

### Phase
production-hardening verification

### Summary
Implemented an opt-in live OpenAI verification slice for Anchor. The new workflow creates generated prototype seed data, exercises seeded API flows, makes a real OpenAI Realtime WebSocket smoke call, and runs a live browser WebRTC voice workflow through Anchor's server-mediated `/api/voice/client-secret` route.

### Files Created/Modified

| File | Purpose |
| --- | --- |
| `PLAN.md` | Active checklist for the full-function live OpenAI test slice. |
| `package.json` | Added `db:seed:live-test` and `test:openai:live`. |
| `server/config.js` | Added explicit live-test Realtime network opt-in. |
| `server/services/realtime.js` | Added timeout, safe error text, SDP normalization, call-id parsing preservation, and hangup status checks. |
| `server/app.js` | Updated Realtime session config to GA-style `audio.output.voice`. |
| `server/auth/validation.js` | Allowed offline routine completion and chain-analysis mutation types. |
| `server/db.js` | Fixed deletion order for completed check-ins referenced by routine instances. |
| `public/index.html` | Updated voice copy and added remote audio element. |
| `public/js/app.js` | Added explicit live WebRTC mode, data channel event capture, generated-audio/mic flow, and cleanup. |
| `scripts/*live*` | Added env loading, seed generation, audio fixture generation, WebSocket smoke, and live test runner. |
| `tests/live/*` | Added opt-in live env, seeded API full-function, and Realtime WebSocket tests. |
| `tests/browser/live-openai-full-function.spec.js` | Added live browser WebRTC full-function workflow. |
| `playwright.config.js` | Made default browser verification port-aware. |
| `playwright.live.config.js` | Added Chromium live-test project with fake microphone/audio fixture flags. |
| `vertical-slice-dashboard-anchor-hardening.json` | Added completed live OpenAI test slice. |
| `vertical-slice-dashboard.html` | Embedded updated dashboard state. |
| `CAPABILITY_LEDGER.md` | Added live OpenAI full-function test slice entry. |

### Key Decisions

- Live OpenAI verification remains opt-in via `OPENAI_REALTIME_LIVE_TEST=1`.
- Normal `bun run test` and `bun run test:browser` never require OpenAI network access.
- Real browser WebRTC is enabled only by explicit live test flag/localStorage/query behavior; default browser tests keep deterministic local SDP.
- Seed data is generated prototype data because there are no real users in this environment.
- The live browser test uses Playwright Chromium fake microphone flags and a generated WAV fixture.
- Realtime WebSocket coverage is server-side smoke coverage; WebRTC remains the primary app voice path.

### Technical Details

- `bun run db:seed:live-test` creates `anchor-live-test@example.test` with password `anchor-live-test-passphrase-123` and generated data across all major product surfaces.
- `bun run test:openai:live` runs seed, live Bun tests, and live Playwright WebRTC tests.
- WebRTC browser mode creates `RTCPeerConnection`, captures audio, creates `oai-events`, posts SDP through Anchor, applies the SDP answer, sends generated Realtime events, and ends with transcript opt-in enabled.
- OpenAI API key stays server-side; route responses and tests assert no key leakage.

### Testing/Verification

- RED tests failed before implementation for missing `forceRealtimeNetwork`, missing live helpers, and missing hangup status behavior.
- `bun run db:reset` passed.
- `bun run db:seed:live-test` passed and reported 1 user, 2 diary entries, 1 skill session, 1 chain analysis, 2 voice sessions, and 4 offline mutations.
- `bun run test` passed: 54 tests, 162 expect calls.
- `PORT=3212 bun run test:browser` passed: 33 tests, 1 live OpenAI browser test skipped by default.
- `OPENAI_REALTIME_LIVE_TEST=1 bun run test:openai:live` passed: 3 live Bun tests and 1 live Playwright WebRTC test.
- Manual smoke at `http://127.0.0.1:3210` passed with seeded user API login and 0 browser console errors/warnings on load.

### State
completed

### Next Steps

- Keep live OpenAI tests out of default CI unless a deliberate opt-in job is configured with budget/rate-limit expectations.
- Consider adding a dedicated login UI if seeded-user manual browser workflows become a regular QA requirement.
- Keep clinical/legal review and deployment secret provisioning as separate non-code gates.
