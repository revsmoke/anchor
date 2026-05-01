## Anchor README Realtime Agent Docs — 2026-04-29 15:20 EDT

### Phase
documentation

### Summary
Created the repo-level `README.md` for Anchor. The README describes the prototype, setup, database reset/seed workflow, normal app usage, OpenAI Realtime voice-agent activation, generated live-test seed data, test commands, vertical-slice dashboard artifacts, and troubleshooting.

### Files Created/Modified
| File | Purpose |
|------|---------|
| `/Users/twoedge/Dev/dbt/README.md` | New user/developer guide for setting up, using, testing, and operating Anchor Realtime/agent features. |
| `/Users/twoedge/Dev/dbt/PLAN.md` | Added and checked off the README documentation plan. |
| `/Users/twoedge/Dev/dbt/CAPABILITY_LEDGER.md` | Recorded the visible `Use real OpenAI voice agent` checkbox as part of the live OpenAI slice. |
| `/Users/twoedge/Dev/dbt/context_history/context_index.md` | Indexed this context summary. |

### Key Decisions
- Documented the UI checkbox as the normal way to turn on the real OpenAI voice agent because that is the browser-visible control added for prototype users.
- Kept the text coach described as prototype agent-style behavior and the voice coach described as the main OpenAI-backed agent feature, avoiding overclaiming current text-agent capabilities.
- Included the live-test seed account and generated-data workflow because this prototype has no real users and the full-function tests depend on repeatable seed data.

### Technical Details
- The README names the current commands from `package.json`: `bun run db:reset`, `bun run db:seed`, `bun run db:seed:live-test`, `bun run test`, `bun run test:browser`, `bun run check:private-beta`, and `OPENAI_REALTIME_LIVE_TEST=1 bun run test:openai:live`.
- The README explains the Realtime path: browser SDP offer to `/api/voice/client-secret`, Bun forwards SDP/session config to OpenAI `/v1/realtime/calls`, browser applies the SDP answer, and Anchor calls the voice end route for cleanup.
- The README calls out that `OPENAI_API_KEY` remains backend-only and that the service worker caches the app shell, not sensitive API responses.

### Testing/Verification
- Re-read `README.md` after creation.
- Checked README references against `package.json`, `.env.example`, `public/index.html`, `public/js/app.js`, `server/config.js`, `server/app.js`, and live-test scripts.
- No code tests were rerun for this documentation-only change; the prior implementation verification in this session had already passed `bun run test`, `PORT=3212 bun run test:browser`, and `OPENAI_REALTIME_LIVE_TEST=1 bun run test:openai:live`.

### State
completed

### Next Steps
- Future product work should decide whether the text coach becomes OpenAI-backed or remains deterministic prototype behavior.
- Before private beta, run the README verification sequence again after any command/env changes.

### Related Files
- `/Users/twoedge/Dev/dbt/README.md`
- `/Users/twoedge/Dev/dbt/SPEC.md`
- `/Users/twoedge/Dev/dbt/CAPABILITY_LEDGER.md`
- `/Users/twoedge/Dev/dbt/context_history/contexts/2026-04-29_anchor-live-openai-full-function-tests.md`
