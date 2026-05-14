# PR #1 Comment Resolution Plan

> **Execution rule:** every implementation agent must start by reading this file, then update the relevant checkbox as work proceeds. Keep edits atomic, test-first where behavior changes, and scoped to the files named in each task.

## Definition of Done

- [x] Every active thread in the ledger below has local evidence recorded in this plan before commit.
- [x] WebSocket behavior changes have failing regression evidence before implementation and passing evidence after implementation.
- [x] Docs-only comments have before/after text or scoped Markdown evidence.
- [x] The stale `server/db.js` thread is verified as outdated with code/test evidence; no duplicate code changes are made for it.
- [x] Targeted tests pass, or any skipped optional live credential check is explicitly noted.
- [x] `git diff --check` passes.
- [x] Before/after absolute-path scans show no new user-specific local paths.
- [x] Final diff is limited to approved files or any extra file is justified in this plan.
- [x] No GitHub review threads are resolved and no PR replies are posted without Bryan's explicit approval.

## Stop Conditions

- [x] Stop before editing if `git fetch origin` shows the branch is behind remote.
  - Evidence: branch refresh showed `0 0`; stop condition was not triggered.
- [x] Stop before editing if `git status --short --branch` shows unrelated dirty files beyond this intentional `PLAN.md` update.
  - Evidence: dirty files were the intentional plan/context-history files before implementation; subsequent changes matched the task ownership list.
- [x] Stop before editing if active PR review threads changed after the ledger refresh.
  - Evidence: refreshed active non-outdated unresolved thread set matched the ledger.
- [x] Stop before commit if broad tests fail outside touched areas and the failure is not understood.
  - Evidence: `bun run test` passed with `76 pass / 4 skip / 0 fail`.
- [x] Stop before GitHub writes if Bryan has not approved posting replies or resolving threads.
  - Evidence: no PR replies were posted and no review threads were resolved.

## Active PR Thread Ledger

| Status | Thread ID | Comment ID | Owner | Path | Line | Required Resolution | Evidence To Record |
|---|---:|---:|---|---|---:|---|---|
| open | `PRRT_kwDOSPfvGs6B7sYy` | `3238414968` | Docs Agent | `context_history/contexts/2026-05-12_anchor-backend-data-review.md` | 17 | Add one blank line before and after the `### Files Created/Modified` table. | Scoped MD058 check shows no table-spacing issue for this file. |
| open | `PRRT_kwDOSPfvGs6B8gHN` | `3238709201` | Docs Agent | `agent-pretask-verification.md` | 143 | Change `environment and quota dependent` to `environment- and quota-dependent`. | `rg -n "environment and quota dependent|environment- and quota-dependent" agent-pretask-verification.md`. |
| open | `PRRT_kwDOSPfvGs6B8gHR` | `3238709205` | Docs Agent | `context_history/contexts/2026-05-12_anchor-backend-data-review.md` | 21 | Change `pseudo implementations` to `pseudo-implementations`. | `rg -n "pseudo implementations|pseudo-implementations" context_history/contexts/2026-05-12_anchor-backend-data-review.md`. |
| open | `PRRT_kwDOSPfvGs6B8gHY` | `3238709216` | Voice Test Agent, Voice Implementation Agent | `scripts/live-openai-websocket-smoke.js` | 17 | Add premature close handling and a single-settlement path for timeout, constructor failure, error, parse failure, ready, API error, and close. | Unit tests in `tests/unit/live-openai-config.test.js` cover each path and pass. |
| stale verification only | `PRRT_kwDOSPfvGs6B7msH` | `3238381942` | QA Agent | `server/db.js` | outdated | Verify returning-user bootstrap is already addressed; make no duplicate code change. | Inspect current bootstrap logic and run `bun test tests/api/pass2-timezone-contract.test.js` or the narrower existing bootstrap regression if present. |

## Agent Ownership

- [x] Agent Lead owns branch safety, ledger refresh, sequencing, final diff review, commit/push preparation, and local PR-resolution draft.
- [x] Docs Agent owns only `agent-pretask-verification.md` and `context_history/contexts/2026-05-12_anchor-backend-data-review.md`.
- [x] Voice Test Agent owns only WebSocket unit-test additions in `tests/unit/live-openai-config.test.js`.
- [x] Voice Implementation Agent owns only `scripts/live-openai-websocket-smoke.js`.
- [x] QA Agent owns verification commands, stale-thread validation, portability checks, and final evidence review.

## Branch And Dirty-State Gate

- [x] Agent Lead: run branch refresh before any implementation edits.

```bash
git fetch origin
git status --short --branch
git rev-list --left-right --count HEAD...origin/codex/anchor-cleanup-pass1-pass2
```

- [x] Agent Lead: require `0 0` from the rev-list command before proceeding.
  - Evidence: `git rev-list --left-right --count HEAD...origin/codex/anchor-cleanup-pass1-pass2` returned `0 0`.
- [x] Agent Lead: treat the current `PLAN.md` changes as intentional planning work. Decide before commit whether to include `PLAN.md` in the PR comment-resolution commit or leave it unstaged; record that decision here.
  - Decision: include `PLAN.md` and the context-history planning summary in the final commit because Bryan explicitly requested plan review/tracking updates before implementation.
- [x] Agent Lead: run baseline portability scan before docs edits and save the result in the evidence notes.
  - Evidence: baseline scan only matched the portability scan commands inside `PLAN.md`; no tracked source/doc content matched user-specific `/Users/...` paths.

```bash
git ls-files -z | xargs -0 rg -n "/Users/(twoedge|[^/[:space:]]+)" || true
```

## Task 1: Refresh Review Ledger

**Owner:** Agent Lead

- [x] Run flat PR comment refresh.

```bash
gh api repos/revsmoke/anchor/pulls/1/comments --paginate
```

- [x] Run thread-aware PR comment refresh.

```bash
gh api graphql -f owner=revsmoke -f name=anchor -F number=1 -f query='
query($owner:String!, $name:String!, $number:Int!) {
  repository(owner:$owner,name:$name) {
    pullRequest(number:$number) {
      reviewThreads(first:100) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(first:10) {
            nodes {
              databaseId
              author { login }
              body
              createdAt
              url
            }
          }
        }
      }
    }
  }
}'
```

- [x] Confirm the active open thread set still matches the ledger above.
  - Evidence: active non-outdated unresolved threads still match `3238414968`, `3238709201`, `3238709205`, and `3238709216`; `3238381942` remains unresolved but outdated.
- [x] If new unresolved non-outdated comments exist, update this ledger before editing.
  - Evidence: no new unresolved non-outdated threads were found during the refresh.

## Task 2: Docs Fixes

**Owner:** Docs Agent

- [x] Red check: verify current text still contains the two wording issues.

```bash
rg -n "environment and quota dependent|pseudo implementations" agent-pretask-verification.md context_history/contexts/2026-05-12_anchor-backend-data-review.md
```

- [x] Red check: inspect backend-data-review table spacing around lines 8-24; table already had required blank lines, so no spacing edit was needed.

```bash
sed -n '8,18p' context_history/contexts/2026-05-12_anchor-backend-data-review.md
```

- [x] Edit `agent-pretask-verification.md` line 143 only for the compound adjective.
- [x] Edit `context_history/contexts/2026-05-12_anchor-backend-data-review.md` only for `pseudo-implementations`; table spacing was already correct and was not changed.
- [x] Green check: verify old wording is gone and new wording is present.

```bash
rg -n "environment and quota dependent|pseudo implementations" agent-pretask-verification.md context_history/contexts/2026-05-12_anchor-backend-data-review.md || true
rg -n "environment- and quota-dependent|pseudo-implementations" agent-pretask-verification.md context_history/contexts/2026-05-12_anchor-backend-data-review.md
```

- [x] Green check: run scoped Markdown table-spacing verification for the edited context file only. Do not run broad markdownlint unless this scoped check is clean and useful.

```bash
awk 'BEGIN{ok=1} /^### Files Created\/Modified$/{getline; if ($0 != "") { print "missing blank line after heading"; ok=0 } in_table=1; next } in_table && /^### Key Decisions$/{ print "missing blank line before next heading"; ok=0 } in_table && $0 == "" { in_table=0 } END{exit ok ? 0 : 1}' context_history/contexts/2026-05-12_anchor-backend-data-review.md
```

- [x] Refactor check: no additional docs files changed unless the ledger changed.

**Docs Agent evidence, 2026-05-14:**

- `rg -n "environment and quota dependent|pseudo implementations" agent-pretask-verification.md context_history/contexts/2026-05-12_anchor-backend-data-review.md` initially found both wording issues at `agent-pretask-verification.md:143` and `context_history/contexts/2026-05-12_anchor-backend-data-review.md:21`.
- `sed -n '8,24p' context_history/contexts/2026-05-12_anchor-backend-data-review.md` showed blank lines already present around `### Files Created/Modified`; no table-spacing churn was made.
- `rg -n "environment and quota dependent|pseudo implementations" agent-pretask-verification.md context_history/contexts/2026-05-12_anchor-backend-data-review.md || true` returned no matches after edits.
- `rg -n "environment- and quota-dependent|pseudo-implementations" agent-pretask-verification.md context_history/contexts/2026-05-12_anchor-backend-data-review.md` found the corrected wording at `agent-pretask-verification.md:143` and `context_history/contexts/2026-05-12_anchor-backend-data-review.md:21`.
- Scoped `awk` table-spacing verification for `context_history/contexts/2026-05-12_anchor-backend-data-review.md` passed with no output.

## Task 3: WebSocket Regression Tests

**Owner:** Voice Test Agent

**Test file:** `tests/unit/live-openai-config.test.js`

- [x] Voice/WebSocket Agent execution plan written before edits: inspect current smoke helper and unit-test patterns, add fake WebSocket red tests, run the unit test file to capture failures, implement minimal single-settlement/close handling, rerun the unit test file, and record evidence here.
- [x] Red test: add a fake WebSocket harness that can emit `open`, `message`, `error`, and `close` events without network access.
- [x] Red test: close before readiness rejects with `Realtime WebSocket closed before ready`, close code, and close reason.
- [x] Red test: close after a ready event does not double-settle or change the resolved result.
- [x] Red test: constructor failure still rejects immediately with the constructor error.
- [x] Red test: `error` event rejects once with `Realtime WebSocket connection failed`.
- [x] Red test: timeout rejects once without making the unit test wait 20 seconds. Prefer an injectable timeout option or fake timers over real waiting.
- [x] Red test: malformed JSON message rejects once with the parse error.
- [x] Red test: API `error` message rejects once with the API message.
- [x] Run the unit test file and record the failing assertions before implementation.
  - Red evidence: `bun test tests/unit/live-openai-config.test.js` failed before implementation with 10 pass / 2 fail. Premature close rejected with `Realtime WebSocket smoke timed out.` instead of `Realtime WebSocket closed before ready (code 1006): network reset` and hit the test timeout; injected timeout expected `[5]` but observed `[20000]`.

```bash
bun test tests/unit/live-openai-config.test.js
```

## Task 4: WebSocket Implementation

**Owner:** Voice Implementation Agent

**Implementation file:** `scripts/live-openai-websocket-smoke.js`

- [x] Add a local single-settlement helper inside `runRealtimeWebSocketSmoke`.
- [x] Route timeout through the single-settlement helper.
- [x] Route constructor failure through the single-settlement helper where possible without changing immediate rejection semantics.
- [x] Route ready message through the single-settlement helper and resolve with a copied events array.
- [x] Route API `error` messages through the single-settlement helper.
- [x] Route malformed message parse errors through the single-settlement helper.
- [x] Route WebSocket `error` events through the single-settlement helper.
- [x] Add a WebSocket `close` listener that rejects before readiness with close code and optional reason.
- [x] Ensure cleanup clears the timeout and safely closes `ws` with `ws?.close()`.
- [x] Green check: run unit tests after implementation.
  - Green evidence: `bun test tests/unit/live-openai-config.test.js` passed with 12 pass / 0 fail / 27 assertions in 99ms.

```bash
bun test tests/unit/live-openai-config.test.js
```

- [x] Refactor check: simplify only within the helper; do not change live-test semantics or model/session payload beyond what the comment requires.
  - Evidence: implementation changes are limited to settlement/timeout/close handling inside `runRealtimeWebSocketSmoke`; the session update payload and ready-event detection are unchanged.

## Task 5: Stale Bootstrap Thread Verification

**Owner:** QA Agent

- [x] QA Agent 1 execution plan: inspect `server/db.js` onboarding/bootstrap paths, run the targeted timezone/bootstrap API test, check whether a narrower returning-user bootstrap regression exists, record stale-thread evidence, then continue to Task 6 checks only if the targeted evidence is clean.
- [x] Inspect the current `server/db.js` bootstrap/onboarding logic and identify the code path that makes the old `server/db.js` comment outdated.
  - Evidence: `server/db.js:149-263` now has `getAppBootstrap(userId, options = {})` derive `localDate`, load profile/templates/today rows, and when a returning user has a profile plus all three templates but fewer than three rows for the requested date, it inserts missing `routine_instances` and a `daily_plans` row inside a transaction, then re-queries both before returning `onboardingComplete: true`, `today`, `dailyPlan`, and `nextStep: "main_app"`. This makes outdated comment `3238381942` stale without another `server/db.js` change.
- [x] Run the targeted bootstrap/date regression evidence.
  - Evidence: `bun test tests/api/pass2-timezone-contract.test.js` passed the two non-SQL date contract tests with `2 pass / 4 skip / 0 fail`.

```bash
bun test tests/api/pass2-timezone-contract.test.js
```

- [x] If a narrower returning-user bootstrap regression exists, run it and record the command here.
  - Evidence: the narrower regression exists at `tests/api/pass2-timezone-contract.test.js:208-253` (`bootstrap creates today's anchors from existing routine templates on a later local date`). The first QA pass saw it skip without `TEST_DATABASE_URL`; Agent Lead then created a disposable local database and ran `TEST_DATABASE_URL=postgres://localhost:5432/anchor_pr1_comment_test bun test tests/api/pass2-timezone-contract.test.js`, which passed with `4 pass / 0 fail / 15 expect() calls`, including the SQL-backed returning-user bootstrap regression.
- [x] Record result: no code change for `server/db.js`; thread is stale/outdated.
  - Evidence: no `server/db.js` changes were made. Code inspection confirms the returning-user bootstrap path already creates missing anchors and a daily plan for a later local date; disposable PostgreSQL execution confirmed the SQL-backed returning-user bootstrap regression passes.

## Task 6: QA Verification

**Owner:** QA Agent

- [x] QA Agent 1 execution plan: run the changed-area unit test, run the optional live WebSocket test and record skip/pass behavior, rerun targeted API evidence if needed, run whitespace and portability checks, then compare the changed file list against ownership before updating Task 5/6 evidence.
- [x] Run changed-area unit tests.
  - Evidence: `bun test tests/unit/live-openai-config.test.js` passed with `12 pass / 0 fail / 27 expect() calls`.

```bash
bun test tests/unit/live-openai-config.test.js
```

- [x] Run live WebSocket smoke test file. If credentials are absent and the test skips, record that it skipped because optional live credentials were not present.
  - Evidence: `bun test tests/live/openai-websocket-live.test.js` returned `0 pass / 1 skip / 0 fail`; optional live OpenAI WebSocket credentials/mode were not active.

```bash
bun test tests/live/openai-websocket-live.test.js
```

- [x] Run targeted API regression for the stale bootstrap thread.
  - Evidence: default `bun test tests/api/pass2-timezone-contract.test.js` passed non-SQL coverage with `2 pass / 4 skip / 0 fail`. Agent Lead then ran `TEST_DATABASE_URL=postgres://localhost:5432/anchor_pr1_comment_test bun test tests/api/pass2-timezone-contract.test.js` against a disposable PostgreSQL database; it passed with `4 pass / 0 fail / 15 expect() calls`, including the SQL-backed returning-user bootstrap regression.

```bash
bun test tests/api/pass2-timezone-contract.test.js
```

- [x] Run repository test suite only after targeted checks are green.
  - Evidence: `bun run test` passed with `76 pass / 4 skip / 0 fail / 1335 expect() calls`; the 4 skips are the SQL-backed Pass 2 tests, including the returning-user bootstrap regression.

```bash
bun run test
```

- [x] Run final whitespace check.
  - Evidence: `git diff --check` passed with no output.

```bash
git diff --check
```

- [x] Run final portability scan and compare to baseline.
  - Evidence: `git ls-files -z | xargs -0 rg -n "/Users/(twoedge|[^/[:space:]]+)" || true` only matched the portability scan command text already recorded in `PLAN.md`; no tracked source/doc content introduced user-specific local paths.

```bash
git ls-files -z | xargs -0 rg -n "/Users/(twoedge|[^/[:space:]]+)" || true
```

- [x] Review `git diff --stat` and `git diff --name-only`; confirm changed files match the task ownership list.
  - Evidence: `git status --short --branch` showed modified `PLAN.md`, docs-owned files, Voice Test/Implementation files, `context_history/context_index.md`, untracked `context_history/contexts/2026-05-14_anchor-pr1-plan-refinement.md`, and untracked `context_history/contexts/2026-05-14_anchor-pr1-task5-6-qa.md`. These map to QA evidence in `PLAN.md`, Docs Agent, Voice Test Agent, Voice Implementation Agent, and required context-history artifacts; no `server/db.js` source changes were present.

## Follow-up Review Agent A: Read-only Code/Test Review

**Owner:** Follow-up Review Agent A

- [x] Inspect `scripts/live-openai-websocket-smoke.js` for single-settlement, premature close, timeout, cleanup, and double-settlement behavior.
- [x] Inspect `tests/unit/live-openai-config.test.js` for regression coverage of PR comment `3238709216`, timer mocking reliability, and cleanup isolation.
- [x] Review `PLAN.md` Tasks 3-6 evidence for red/green/refactor integrity and whether recorded evidence supports the claimed resolution.
- [x] Verify the current diff and changed file scope against the PR plan, without editing source or test files.
- [x] Run targeted read-only verification commands where useful and record final review outcome in the chat response.

**Follow-up Review Agent A evidence, 2026-05-14:**

- No code correctness or test issues found.
- Confirmed `scripts/live-openai-websocket-smoke.js` routes timeout, constructor failure, ready, API error, parse failure, socket error, and close through the single `settle()` path.
- Confirmed `tests/unit/live-openai-config.test.js` covers PR comment `3238709216` with constructor failure, close-before-ready, close-after-ready double-settlement, socket error, injected timeout, malformed JSON, and API error paths.
- Ran `bun test tests/unit/live-openai-config.test.js`: `12 pass / 0 fail`.
- Ran `bun test tests/unit/live-openai-config.test.js tests/live/openai-websocket-live.test.js`: unit tests passed and the live WebSocket test skipped because optional live mode/credentials were not active.
- Ran `git diff --check`: passed.
- Residual risk: live OpenAI WebSocket service close timing was not exercised because live credentials/mode were not active.

## Follow-up Review Agent B: Read-only Thread/Docs/Tracking Review

**Owner:** Follow-up Review Agent B

- [x] Review active PR thread coverage against `PLAN.md`, docs files, current branch state, and GitHub visibility.
- [x] Verify docs wording fixes and table-spacing evidence.
- [x] Verify portability scan results and confirm no absolute user paths beyond scan-command text in `PLAN.md`.
- [x] Verify context-history additions are accounted for and should be included with the final commit.
- [x] Verify the plan does not falsely claim PR replies were posted or review threads were resolved.

**Follow-up Review Agent B evidence, 2026-05-14:**

- Found no docs, portability, or thread-coverage content issues.
- Correctly noted the work was still local before Task 7 and that GitHub would not see the fixes until commit/push.
- Correctly noted the new context-history files were untracked and must be included with `context_history/context_index.md`.
- Correctly noted remaining open checkboxes were meta/closure tracking items, not implementation defects.

## Task 7: Commit, Push, And PR Closure Draft

**Owner:** Agent Lead

- [ ] Review final diff against the ledger, one thread at a time.
- [ ] Decide whether `PLAN.md` is included in the implementation commit. If included, mention that the plan was updated per Bryan's request.
- [ ] Commit only after QA evidence is recorded.
- [ ] Push `codex/anchor-cleanup-pass1-pass2`.
- [ ] Re-query PR #1 threads and checks.

```bash
gh pr checks 1 --repo revsmoke/anchor
gh pr view 1 --repo revsmoke/anchor --json reviewDecision,mergeStateStatus,statusCheckRollup
```

- [ ] Draft, but do not post, a PR comment summarizing thread IDs addressed, evidence commands, and any skipped optional live credential verification.
- [ ] Ask Bryan before posting the PR reply or resolving review threads.

## Historical Context

The prior resolution pass already addressed earlier PR comments in commit `93001f2`, including bootstrap behavior, portability cleanup, Playwright port parsing, password-reset helper guards, and initial voice/live cleanup. This current plan supersedes the older checklist and is the only executable checklist for the remaining active PR comments.
