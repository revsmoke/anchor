# PR #2 Live Voice Review Response QA - 2026-05-17

## Scope

- Branch reviewed: `codex/live-voice-regression-fix`.
- Review comment: `3243775962` on `server/app.js`.
- Requested check: local voice requests with an SDP offer and `useLiveRealtime: false` must not call `realtimeClient.createCall`; live realtime requests must still call `createCall`.
- GitHub state was not changed: no commit, push, reply, or thread resolution.

## Local Diff Reviewed

- `server/app.js` now calls `realtimeClient.createCall(...)` only when both `validation.value.sdpOffer` and `validation.value.useLiveRealtime` are truthy.
- The fallback branch still returns the local SDP answer with `openAiCallId: "local_realtime_call"`.
- `tests/api/production-hardening.test.js` adds a regression test where a production placeholder config sends `useLiveRealtime: false` plus an SDP offer. The stubbed `createCall` throws if invoked, and the test asserts a `201`, local answer, local call id, and zero calls.
- The existing server-mediated WebRTC test now sends `useLiveRealtime: true`, preserving coverage that live realtime still invokes `createCall`.

## Verification

Command run:

```bash
bun test tests/api/production-hardening.test.js
```

Result:

- 8 pass, 0 fail.
- Covered local SDP fallback: `keeps local voice requests off the realtime network when an SDP offer is present`.
- Covered live realtime path: `creates server-mediated WebRTC session and hangs up by OpenAI call id`.

## QA Finding

No blocker found for comment `3243775962`.

The route fix addresses the comment directly: an SDP offer alone no longer selects the OpenAI realtime call path. The negative regression test would fail if `createCall` were invoked for `useLiveRealtime: false`, and the live realtime test still confirms a `createCall` input exists and returns the OpenAI call id.

## Residual Risk

- This QA pass was focused on API behavior and did not run browser Playwright coverage.
- No live OpenAI credential test was run; the mocked live path is sufficient for this review comment because the comment concerns route branching before network execution.
