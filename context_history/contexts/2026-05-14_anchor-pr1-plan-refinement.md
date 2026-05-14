## Anchor PR #1 Plan Refinement — 2026-05-14 03:50

### Phase
planning

### Summary
Refined `PLAN.md` for the remaining PR #1 review comments after a fresh `gh` review-thread check and an independent agent audit. The updated plan now has a formal active-thread ledger, explicit owners, branch and dirty-state gates, test-first WebSocket tasks, scoped documentation checks, stop conditions, and an approval boundary for GitHub replies or thread resolution.

### Files Created/Modified

| File | Purpose |
|------|---------|
| `PLAN.md` | Current executable plan for the remaining PR #1 comment-resolution pass |
| `context_history/contexts/2026-05-14_anchor-pr1-plan-refinement.md` | End-of-session context summary |
| `context_history/context_index.md` | Indexed this context summary |

### Key Decisions
- Replaced the loose checklist with a single executable plan and collapsed older checklist items into historical context to avoid conflicting open tasks.
- Added thread IDs and comment IDs for every active PR thread so implementation can be tracked one review item at a time.
- Split WebSocket work into test-first and implementation ownership so settlement-path regressions can be proven before the helper changes.
- Added a hard boundary that agents may draft PR replies locally but must not post replies or resolve GitHub review threads without Bryan's approval.

### Technical Details
The active ledger covers docs comments `3238414968`, `3238709201`, `3238709205`, WebSocket comment `3238709216`, and stale verification for outdated bootstrap comment `3238381942`. The WebSocket plan requires fake WebSocket unit coverage for close-before-ready, close-after-ready double-settlement, constructor failure, error, timeout, malformed JSON, and API error message paths.

### Testing/Verification
- Ran `gh pr view 1 --repo revsmoke/anchor --json headRefName,headRefOid,reviewDecision,mergeStateStatus,statusCheckRollup,url`.
- Ran thread-aware `gh api graphql` review-thread query.
- Spawned a read-only plan-audit agent and incorporated its required revisions.
- Re-read `PLAN.md` after patching.
- Ran `git diff --check`.
- Confirmed the only modified files at session end are `PLAN.md`, this context file, and `context_history/context_index.md`.

### State
completed

### Next Steps
- Execute `PLAN.md` from Task 1, starting with branch/remote gates and a refreshed PR thread ledger.
- Decide before commit whether `PLAN.md` should be included in the PR comment-resolution commit or left unstaged.

### Related Files
- `PLAN.md`
- `context_history/contexts/2026-05-13_anchor-pr1-comment-resolution.md`
- `context_history/contexts/2026-05-13_anchor-pr1-comment-resolution-qa.md`
