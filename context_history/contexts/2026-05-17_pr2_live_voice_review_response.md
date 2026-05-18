# PR #2 Live Voice Review Response - 2026-05-17

## Phase
implementation

## Summary
Addressed the open PR #2 review thread on `server/app.js` for live voice startup handling. The fix keeps local voice sessions on the local fallback path when the browser sends an SDP offer with `useLiveRealtime: false`, while preserving the live realtime path when `useLiveRealtime: true`.

## Files Created/Modified

| File | Purpose |
|------|---------|
| `PLAN.md` | Added PR #2 review-response checklist and evidence. |
| `server/app.js` | Changed voice client-secret routing so only explicit live realtime SDP requests call `realtimeClient.createCall`. |
| `tests/api/production-hardening.test.js` | Added regression coverage for local SDP fallback and preserved live realtime call coverage. |
| `context_history/contexts/2026-05-17_pr2_live_voice_review_response_qa.md` | QA review report. |
| `context_history/context_index.md` | Indexed QA and response context reports. |

## Key Decisions
- Kept the change route-local and minimal: local SDP offers now use the existing local answer fallback instead of changing realtime service behavior.
- Updated the existing live WebRTC API test to send `useLiveRealtime: true`, making the live path explicit and preventing the new local fallback from weakening coverage.
- Treated PR review thread `3243775962` as the only actionable unresolved thread for PR #2.

## Testing/Verification
- Red regression before implementation: `bun test tests/api/production-hardening.test.js --timeout 30000` failed because the local SDP request returned `502`.
- Focused green run: `bun test tests/api/production-hardening.test.js tests/api/pass0-routes.test.js tests/unit/live-openai-config.test.js --timeout 30000` passed with 26 tests.
- Full API/unit run: `APP_ENV=test NODE_ENV=test OPENAI_API_KEY= REALTIME_MODEL=gpt-realtime bun run test` passed with 80 pass, 4 skip, 0 fail.
- `git diff --check` passed.

## State
completed and pushed.

## GitHub Closeout
- Pushed commit `8f82355` to `codex/live-voice-regression-fix`.
- Resolved PR review thread `PRRT_kwDOSPfvGs6CKuuW` for comment `3243775962` after GitHub reported it outdated but still unresolved.
- PR #2 was open with CodeRabbit pending immediately after push.

## Related Files
- `context_history/contexts/2026-05-14_live-voice-regression-fix.md`
- `context_history/contexts/2026-05-17_pr2_live_voice_review_response_qa.md`
