## Anchor PR #1 Comment Resolution — 2026-05-13 22:22 EDT

### Phase
implementation

### Summary
Addressed the actionable review comments on PR #1 for returning-user bootstrap,
portable documentation paths, Markdown table spacing, Playwright port parsing,
voice/WebRTC cleanup, live WebSocket smoke behavior, and focused test helpers.
The branch remains `codex/anchor-cleanup-pass1-pass2`.

### Files Created/Modified

| File | Purpose |
|------|---------|
| `server/db.js` | Bootstrap now treats onboarding as profile plus templates and lazily creates missing day instances. |
| `tests/api/pass2-timezone-contract.test.js` | Added SQL-backed regression for a returning user bootstrapping on a later local date. |
| `public/js/app.js` | Stored active voice realtime mode and cleaned up partial WebRTC resources on start failure. |
| `scripts/live-openai-websocket-smoke.js` | Added constructor failure handling and reusable session-ready predicate. |
| `playwright.config.js` | Added safe port parsing and fallback behavior. |
| `context_history/contexts/*.md` | Normalized local machine paths and Markdown table spacing. |

### Key Decisions
- Normalize all tracked local machine paths, including historical context files,
  because the PR feedback was about portability across contributors.
- Keep live OpenAI tests opt-in; direct local runs skip live network specs unless
  `OPENAI_REALTIME_LIVE_TEST=1` is set.
- Fill partial missing routine instances during bootstrap because the insert is
  idempotent and prevents inconsistent daily state.

### Testing/Verification
- `TEST_DATABASE_URL=postgres://localhost/anchor_pr1_regression bun test tests/api/pass2-timezone-contract.test.js`
- `bun test tests/api/pass1-auth-consent.test.js`
- `bun test tests/api/pass3-check-ins.test.js`
- `bun test tests/unit/live-openai-config.test.js tests/live/openai-websocket-live.test.js`
- `PORT=not-a-number bun run test:browser -- tests/browser/pass1-consent.spec.js`
- `PORT=3212 bun run test:browser -- tests/browser/pass1-consent.spec.js tests/browser/pass2-onboarding.spec.js tests/browser/pass3-check-in.spec.js`
- `bun run test`
- `git diff --check`
- User-specific absolute path scan returned no matches.
- Targeted Markdown table-spacing scanner returned no MD058 table-spacing
  findings. Full `bunx markdownlint-cli2` remains noisy with pre-existing
  repo-wide line-length and heading rules.

### State
completed

### Next Steps
- Push the branch and post the PR resolution summary.
- Optional: run `OPENAI_REALTIME_LIVE_TEST=1 bun run test:openai:live` when live
  credentials are intentionally available.

### Related Files
- `PLAN.md`
- `context_history/contexts/2026-05-13_anchor-pr1-comment-resolution-qa.md`
