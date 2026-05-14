# Universal Agent-Accessible Tool Layer Execution Plan

> **For agentic workers:** Before executing anything, write or verify this full plan in `PLAN.md` with checkboxes. Then begin execution, checking off each item as completed. Use test-driven development for behavior changes: write failing tests, run them red, implement minimally, run green, then refactor.

## Operating Rules

- [ ] Keep every slice runnable and testable end to end before moving to the next slice.
- [ ] Update `CAPABILITY_TOOL_MATRIX.md` in the same slice as any capability, route, UI action, or tool change.
- [ ] Use shared product services for behavior used by both HTTP routes and tools; do not have tools call HTTP handlers.
- [ ] Preserve existing user/unrelated work in the dirty tree; do not revert files unless Bryan explicitly asks.
- [ ] Assign subagents for pre-task verification and QA review after each code-writing slice.
- [ ] At session end, update project history and NotebookLM project memory with changes, tests, risks, and next steps.

## Slice 1: Capability Inventory And Matrix

- [x] Write red/verification checks that prove `CAPABILITY_TOOL_MATRIX.md` exists and contains required columns.
- [x] Inventory current UI controls/views from `public/index.html` and `public/js/app.js`.
- [x] Inventory current server route surface from `server/app.js`.
- [x] Create `CAPABILITY_TOOL_MATRIX.md` with every current capability marked `covered`, `deferred with reason`, `blocked`, or `intentionally_unavailable`.
- [x] Mark credential/password/reset-code voice handling as `assist_only` or `intentionally_unavailable_for_voice`.
- [x] Run matrix validation test/check green.

## Slice 2: Canonical Today API And UI Migration

- [x] Add red API tests for `GET /api/today?date=YYYY-MM-DD`: response shape, auth required, user-local date, lazy daily plan/routine creation, no duplicate anchors.
- [x] Add SQL-backed coverage where `TEST_DATABASE_URL` is available.
- [x] Extract or reuse a Today service so bootstrap and `/api/today` share behavior.
- [x] Implement `GET /api/today`.
- [x] Update Today UI to read from `/api/today` without breaking existing bootstrap.
- [ ] Add browser test proving Today loads from `/api/today` and updates after check-in, focus plan, reset, and anchor completion.
  - [x] Added browser coverage proving the Today surface calls `/api/today`.
  - [ ] Add explicit browser assertions that `/api/today`-backed state stays current after check-in, focus plan, reset, and anchor completion.

## QA Review: Slice 1/Slice 2 Current Implementation — 2026-05-14

- [x] Verify `PLAN.md` contains a scoped checklist before executing the QA review.
- [x] Review `CAPABILITY_TOOL_MATRIX.md` and `tests/unit/capability-tool-matrix.test.js` for coverage, accuracy, and misleading assertions.
- [x] Review canonical Today API behavior in `server/app.js`, `server/db.js`, and `tests/api/pass2-timezone-contract.test.js`.
- [x] Review frontend migration safety in `public/js/app.js` and browser coverage in `tests/browser/pass3-check-in.spec.js`.
- [x] Run targeted tests that are useful for validating the review.
- [x] Write concise QA findings, commands, and recommendation to `context_history/contexts/2026-05-14_universal-tool-layer-slice1-slice2-qa.md`.
- [x] Re-read the QA report and update this checklist for only completed items.

## Slice 3: Safety Plan, Events, And Episodes

- [x] Add red API/SQL tests for `GET|POST|PUT /api/safety-plan`.
- [x] Add red API/SQL tests for `GET|POST /api/safety-events` and `PUT /api/safety-events/:id/resolution`.
- [x] Add migration and service methods for normalized support contacts and `safety_episodes`.
- [x] Implement safety routes through shared safety service.
- [x] Define acute allowlist: `safety.resources.read`, `safety.plan.read`, `safety.event.append`, `safety.episode.resolve`, `voice.end`, `session.logout`.
- [x] Add Safety Plan / Help Now UI and browser coverage.
  - [x] Add red browser test for Safety Plan save, Help Now event append, acute lock visibility, and resolution.
  - [x] Add signed-in Safety nav/view with persisted plan fields and crisis resources.
  - [x] Add Help Now event append and episode resolution UI wired to safety event routes.
  - [x] Run focused browser/API regression coverage green.

## Slice 4: Privacy And Export Retention Gate

- [ ] Update data ownership matrix for sensitive/destructive tool exposure.
- [ ] Keep privacy delete/export tools discoverable but non-callable until deletion, anonymization, retention, and audit semantics are defined.
- [ ] Add tests that non-callable privacy tools refuse execution with a clear policy reason.

## Slice 5: Shared Services For Tool-Backed Actions

- [ ] Extract shared services for initial tool-backed actions: today read, check-in, focus plan, anchor completion, safety reads/events.
- [ ] Refactor HTTP routes to use services after auth/CSRF checks.
- [ ] Add tests confirming HTTP behavior is unchanged.

## Slice 6: Prompt Resolver Registry

- [ ] Add prompt template/version migration and seeded defaults.
- [ ] Add prompt lookup service with active version resolution and fallback behavior.
- [ ] Refactor Realtime/LLM prompt call sites to use registry-backed prompts.
- [ ] Add tests for active version lookup, missing prompt fallback, and prompt usage metadata.
- [ ] Mark resolver-only registry as intermediate; final objective requires admin editing.

## Slice 7: Tool Catalog, Manifest, Dispatcher, Security

- [ ] Create `server/tools/catalog.js` as the single source of truth.
- [ ] Generate contextual `GET /api/tools/manifest` and `GET /api/openapi.json` from the catalog.
- [ ] Implement `POST /api/tools/call` dispatcher through shared services only.
- [ ] Enforce cookie auth, CSRF for mutating cookie-authenticated tool calls, per-user/per-tool rate limits, tool eligibility, and consent requirements.
- [ ] Enforce idempotency for all write tools except append-only safety events using `(user_id, tool_name, idempotency_key)`.
- [ ] Add `tool_call_logs` with redacted params/result summaries.
- [ ] Add negative tests for missing service mappings, missing matrix status, and missing destructive/sensitive metadata.

## Slice 8: Live Session-Prep Exports

- [ ] Replace fixed April 2026 UI dates with user-local dynamic ranges.
- [ ] Default exports to minimal/redacted JSON.
- [ ] Require explicit include flags for sensitive sections.
- [ ] Add tests proving excluded sections are absent from generated JSON.

## Slice 9: Admin Prompt Editor And First Admin Bootstrap

- [ ] Add `users.role` and `requireAdmin`.
- [ ] Add env-gated, audited first-admin bootstrap script disabled by default in production.
- [ ] Add admin prompt browse/edit/version/activate UI.
- [ ] Add rollback, diff preview, variable-schema validation, activation audit, and protected prompt classes requiring reviewer approval.
- [ ] Add security tests for admin authorization, recent auth, and activation confirmation nonce.

## Slice 10: Voice Local Function-Tool Bridge

- [ ] Add tool subset injection for eligible Realtime tools only.
- [ ] Browser listens for completed function-call events and ignores partial argument deltas until final.
- [ ] Browser parses final arguments, calls `/api/tools/call`, sends `conversation.item.create` with `item.type = "function_call_output"` and original `call_id`, then sends `response.create`.
- [ ] Handle malformed JSON, unavailable tools, duplicate `call_id`, timeout, cancellation, and dispatcher failure with redacted tool-output errors tied to original `call_id`.
- [ ] Add normal, safety, and credential-boundary voice tests.

## Slice 11: Final Parity Pass

- [ ] Re-run capability matrix validation.
- [ ] Verify every matrix row is `covered`, `deferred with reason`, `blocked`, or `intentionally_unavailable`.
- [ ] Run full API/unit tests.
- [ ] Run browser suite or targeted browser suite for touched surfaces.
- [ ] Run portability and whitespace checks.
- [ ] Update context history and NotebookLM memory.

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

- [x] Review final diff against the ledger, one thread at a time.
  - Evidence: final diff addressed docs thread `3238414968` with existing blank-line table spacing, docs thread `3238709201` with `environment- and quota-dependent`, docs thread `3238709205` with `pseudo-implementations`, WebSocket thread `3238709216` with single-settlement close/error/timeout handling and unit coverage, and stale thread `3238381942` with no `server/db.js` changes.
- [x] Decide whether `PLAN.md` is included in the implementation commit. If included, mention that the plan was updated per Bryan's request.
  - Decision: `PLAN.md` is included because Bryan requested careful plan tracking and agent-team execution evidence.
- [x] Commit only after QA evidence is recorded.
  - Evidence: committed `c8687ff` (`fix: address remaining PR review comments`) after targeted, broad, SQL-backed, portability, and follow-up review evidence was recorded.
- [x] Push `codex/anchor-cleanup-pass1-pass2`.
  - Evidence: pushed implementation commit `c8687ff`, then pushed follow-up tracking commits; branch is synced with `origin/codex/anchor-cleanup-pass1-pass2`.
- [x] Re-query PR #1 threads and checks.
  - Evidence: final `gh pr view 1 --repo revsmoke/anchor --json headRefName,headRefOid,reviewDecision,mergeStateStatus,statusCheckRollup,url` reported `mergeStateStatus: CLEAN` and no reported status checks. Final thread-aware GraphQL query showed actionable threads `3238414968`, `3238709201`, `3238709205`, and `3238709216` resolved. Stale bootstrap thread `3238381942` remains unresolved but outdated.

```bash
gh pr checks 1 --repo revsmoke/anchor
gh pr view 1 --repo revsmoke/anchor --json reviewDecision,mergeStateStatus,statusCheckRollup
```

- [x] Draft, but do not post, a PR comment summarizing thread IDs addressed, evidence commands, and any skipped optional live credential verification.
  - Local draft: "Addressed remaining PR #1 comments in `c8687ff` and recorded final tracking in `24de3d0`: confirmed/fixed MD058 table spacing for `3238414968`, fixed docs wording for `3238709201` and `3238709205`, added WebSocket single-settlement close/error/timeout handling and unit coverage for `3238709216`, and verified stale bootstrap thread `3238381942` by current code inspection plus disposable PostgreSQL `TEST_DATABASE_URL=postgres://localhost:5432/anchor_pr1_comment_test bun test tests/api/pass2-timezone-contract.test.js`. Verification: `bun test tests/unit/live-openai-config.test.js`, `bun test tests/live/openai-websocket-live.test.js` (skipped without live mode/credentials), SQL-backed Pass 2 test, `bun run test`, `git diff --check`, and portability scan. Final PR re-query showed the actionable review threads resolved and the branch synced. No PR reply was posted pending Bryan approval."
- [x] Ask Bryan before posting the PR reply or resolving review threads.
  - Evidence: no GitHub PR comment was posted by the agent; final response will ask Bryan before any PR reply.

## Historical Context

The prior resolution pass already addressed earlier PR comments in commit `93001f2`, including bootstrap behavior, portability cleanup, Playwright port parsing, password-reset helper guards, and initial voice/live cleanup. This current plan supersedes the older checklist and is the only executable checklist for the remaining active PR comments.

## Slice 3 Pre-task Verification - 2026-05-14

- [x] Inspect current git/diff state without reverting or overwriting others' edits.
- [x] Review server route and persistence behavior in `server/app.js`, `server/db.js`, and `server/auth/validation.js`.
- [x] Review UI state, insertion points, and styling in `public/index.html`, `public/js/app.js`, and `public/css/app.css`.
- [x] Review existing API and browser test coverage in `tests/api` and `tests/browser`.
- [x] Review Slice 3 scope and tool expectations in `CAPABILITY_TOOL_MATRIX.md` and this `PLAN.md`.
- [x] Identify exact remaining gaps for acute safety allowlist enforcement.
- [x] Identify exact remaining gaps for Safety Plan / Help Now UI and browser coverage.
- [x] Write a concise report under 250 lines at `context_history/contexts/2026-05-14_slice3_pretask_verification.md`.
- [x] Re-read the report and verify it includes existing route/state behavior, API tests to add first, UI insertion points, browser test flow, and risks.

## Slice 3 QA Review - 2026-05-14

- [x] Assign an independent QA reviewer after code-writing.
- [x] Close the stalled QA reviewer after two timeout windows and no report output.
- [x] Perform local QA review against Safety UI, route-level acute lock, matrix status, and test coverage.
- [x] Add red browser coverage for resolving Coach-created acute episodes from the Safety view.
- [x] Fix Safety view open-event discovery and duplicate Help Now UI append behavior.
- [x] Run focused API/unit/browser tests and full API/unit suite with test env pinned.
- [x] Write QA report at `context_history/contexts/2026-05-14_slice3_qa_review.md`.
