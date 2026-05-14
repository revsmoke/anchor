## Live Voice Regression Fix — 2026-05-14 11:25

### Phase
debugging

### Summary
Fixed the live voice startup regression where placeholder OpenAI realtime configuration made the browser expose the real voice agent path, then `POST /api/voice/client-secret` failed with a Bun HTML 500 response. The route itself was present; the actionable bug was config readiness and unhandled realtime setup errors.

### Files Created/Modified

| File | Purpose |
|------|---------|
| `server/config.js` | Added live realtime readiness validation that rejects placeholder values. |
| `server/app.js` | Added config guard and JSON error handling for realtime call setup failures. |
| `tests/api/pass0-routes.test.js` | Added config and route-registration regression coverage. |
| `tests/api/production-hardening.test.js` | Added JSON error regression coverage for upstream realtime setup failure. |

### Key Decisions
- Treat placeholder values such as `replace-me` as not configured: The UI should not offer the real OpenAI voice agent unless both API key and realtime model are usable.
- Keep `/api/voice/client-secret` as the browser route: Direct curl and browser evidence showed the route exists; the observed 500 came from live realtime setup, not a missing route in current code.
- Return redacted JSON on realtime setup failure: The browser should receive a stable API error envelope instead of Bun's HTML exception overlay.

### Technical Details
`getPublicConfig` now reports `voice.liveRealtimeAvailable` through `isLiveRealtimeConfigured`. `handleVoiceClientSecret` rejects `useLiveRealtime` when config is not ready and catches `realtimeClient.createCall` errors into `502 voice_realtime_failed`.

### Testing/Verification
- `curl -X POST http://127.0.0.1:3700/api/voice/client-secret` returned `401 unauthorized`, not `404 not_found`, without auth.
- `playwright-cli` reproduced local/server-mediated voice success and the live-agent 500 with placeholder config before the fix.
- `playwright-cli` on `:3710` after the fix showed the live-agent checkbox disabled and local voice startup returned `201 Created` with no console errors.
- `bun test tests/api/pass0-routes.test.js`
- `bun test tests/api/production-hardening.test.js`
- `bun test tests/api/pass8-13-final-slices.test.js`
- `bun test tests/unit/live-openai-config.test.js`
- `PORT=3711 bun run test:browser -- tests/browser/pass8-13-final-slices.spec.js tests/browser/production-hardening.spec.js`
- `bun run test`

### State
completed

### Next Steps
- If Bryan wants the real OpenAI voice path tested end to end, run it only with valid `OPENAI_API_KEY` and a supported `REALTIME_MODEL`; placeholder config is now intentionally blocked from enabling live mode.

### Related Files
- `tests/browser/pass8-13-final-slices.spec.js`
- `tests/browser/production-hardening.spec.js`
