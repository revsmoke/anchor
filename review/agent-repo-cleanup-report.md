# Read-Only Repository Cleanup Verification

## Scope

- Repository: `<repo-root>`
- Mode: read-only verification, except this report and `review/agent-repo-cleanup-PLAN.md`
- Destructive actions run: none
- Git state changes run: none; no staging, commits, pulls, rebases, or pushes

## Current Git State

- Initial branch at verification start: `main`
- Final branch at recheck: `codex/anchor-cleanup-pass1-pass2`
- Tracking state at verification start: `main...origin/main [ahead 1]`; final feature branch has no upstream shown.
- Local `HEAD`: `aed3c862444743dc5955c69b0559e85ca026374a` (`First Commit of Anchor`)
- `origin/main`: `8cc669003fc7cd5a9e1e0e18e4e3bbdd6433d192`
- Remote: `origin https://github.com/revsmoke/anchor.git`
- Branches visible at final recheck: local `codex/anchor-cleanup-pass1-pass2`, local `main`, remote `origin/main`.
- Working tree at final recheck: dirty, with 20 tracked modified files and 28 untracked files.
- Note: the branch switch and `.gitignore` modification appeared during the final status recheck. This agent did not run branch-switching commands or edit `.gitignore`.
- `git diff --check`: no whitespace/conflict-marker issues reported.

## Likely Change Groups

### Recent Pass 1: Truthful Status and Evidence Baseline

These files match the Pass 1 context summary and file list:

- `tests/unit/dashboard-artifacts.test.js` (untracked)
- `tests/browser/dashboard-artifacts.spec.js` (untracked)
- `vertical-slice-dashboard-anchor-hardening.json` (modified)
- `vertical-slice-dashboard-anchor-pass13.json` (modified)
- `vertical-slice-dashboard.html` (modified)
- `CAPABILITY_LEDGER.md` (modified; mixed with other sessions)
- `README.md` (modified; mixed with other sessions)
- `context_history/context_index.md` (modified)
- `context_history/contexts/2026-05-12_anchor-pass1-truthful-status-evidence.md` (untracked)

Notes: Pass 1 was documentation/artifact-contract work. It should not include product runtime code unless patch review proves otherwise.

### Recent Pass 2: Date and Timezone Contract

These files match the Pass 2 context summary and file list:

- `server/dates.js` (untracked)
- `server/app.js` (modified; mixed with older Focus/Midday work)
- `server/db.js` (modified; mixed with older Focus/Midday work)
- `tests/unit/date-contract.test.js` (untracked)
- `tests/api/pass2-timezone-contract.test.js` (untracked)
- `review/agent-pass2-timezone-PLAN.md` (untracked)
- `review/agent-pass2-timezone-report.md` (untracked)
- `CAPABILITY_LEDGER.md` (modified; mixed)
- `context_history/context_index.md` (modified)
- `context_history/contexts/2026-05-12_anchor-pass2-date-timezone-contract.md` (untracked)

Notes: Pass 2 is real product/server test work and overlaps with older focus-plan changes in `server/app.js` and `server/db.js`. Split with `git add -p` if separate commits are desired.

### Pre-Existing Or Unrelated To Recent Pass 1/2

Likely older Focus/Midday/wayfinding work from May 1:

- `db/migrations/017_daily_focus_plans.sql`
- `public/css/app.css`
- `public/index.html`
- `public/js/app.js`
- `server/auth/validation.js`
- `server/readiness.js`
- `scripts/db-reset.js`
- `tests/api/pass3-check-ins.test.js`
- `tests/browser/pass3-check-in.spec.js`
- `context_history/contexts/2026-05-01_anchor-wayfinding-focus-midday.md`

Likely planning/review artifacts preceding Pass 1/2:

- `IMPLEMENTATION_PLAN.md`
- `agent-pretask-verification.md`
- `review/agent-backend-*`
- `review/agent-final-plan-qa-*`
- `review/agent-qa-*`
- `review/agent-requirements-*`
- `review/agent-ui-*`
- `context_history/contexts/2026-05-12_anchor-backend-data-review.md`
- `context_history/contexts/2026-05-12_anchor-final-plan-qa.md`
- `context_history/contexts/2026-05-12_anchor-implementation-plan-revision.md`
- `context_history/contexts/2026-05-12_anchor-v1-gap-review-plan.md`

Likely local/tool residue:

- `.gitignore` now adds `.playwright-mcp/`, which hides the local Playwright MCP logs from normal status.
- Earlier status showed `.playwright-mcp/console-2026-05-01T16-50-18-588Z.log` and `.playwright-mcp/console-2026-05-04T13-31-09-286Z.log` as untracked before the ignore rule appeared.

Other modified files needing owner review before grouping:

- `tests/api/production-hardening.test.js`
- `tests/browser/live-openai-full-function.spec.js`
- root `PLAN.md`, which currently contains a repository cleanup checklist and replaced older completed plans.

## Branch And PR Strategy

Recommended strategy: preserve current dirty work on the current feature branch before any cleanup. Do not pull or rebase from `main` while the tree is dirty. Because local `main` is already ahead of `origin/main` by one large commit and `codex/anchor-cleanup-pass1-pass2` now points at the same commit, split commits by evidence group from the feature branch.

Current/suggested branch:

- `codex/anchor-cleanup-pass1-pass2`

Suggested commit grouping:

1. Planning and review baseline: `IMPLEMENTATION_PLAN.md`, review reports, and related May 12 planning context history.
2. Pass 1 truthfulness/artifact metadata: dashboard tests/artifacts, README/CAPABILITY ledger hunks, Pass 1 context history.
3. Pass 2 date/timezone contract: `server/dates.js`, Pass 2 tests, date/timezone hunks in `server/app.js` and `server/db.js`, Pass 2 review/context/ledger hunks.
4. Separate older Focus/Midday work only if Bryan wants that included in the same PR; otherwise keep it out or commit it on a separate branch.

If exact patch splitting feels risky, prefer one PR with clearly separated commits over trying to force a perfect split. Do not drop untracked files until Bryan confirms they are disposable.

## Risks

- `server/app.js` and `server/db.js` mix Pass 2 date contract changes with older focus-plan route/persistence changes.
- `CAPABILITY_LEDGER.md`, `README.md`, `vertical-slice-dashboard.html`, and `PLAN.md` contain overlapping history from several sessions.
- The working tree started on `main` and is now on `codex/anchor-cleanup-pass1-pass2`; confirm this branch before staging or committing.
- `.playwright-mcp` logs are likely disposable local artifacts, but deleting them would be destructive and needs explicit approval. The new `.gitignore` rule should be reviewed before inclusion.
- Root `PLAN.md` is modified and should not be treated as a reliable canonical historical plan without review.

## Exact Non-Destructive Commands Recommended

Use these first for another verification pass:

```sh
git status --short --branch
git log --oneline --decorate --graph --max-count=24 --all
git diff --check
git diff --stat
git diff --name-status
git ls-files --others --exclude-standard
```

Confirm you are on the cleanup branch before any staging:

```sh
git branch --show-current
git branch --all --verbose --no-abbrev
```

Preview grouping without staging:

```sh
git diff -- CAPABILITY_LEDGER.md README.md vertical-slice-dashboard.html vertical-slice-dashboard-anchor-hardening.json vertical-slice-dashboard-anchor-pass13.json
git diff -- server/app.js server/db.js server/auth/validation.js scripts/db-reset.js
git diff -- public/index.html public/css/app.css public/js/app.js tests/api/pass3-check-ins.test.js tests/browser/pass3-check-in.spec.js
git diff -- PLAN.md
```

Preview candidate tracked and untracked files before any commit:

```sh
git diff --stat -- CAPABILITY_LEDGER.md README.md context_history/context_index.md vertical-slice-dashboard.html vertical-slice-dashboard-anchor-hardening.json vertical-slice-dashboard-anchor-pass13.json
git ls-files --others --exclude-standard | rg '^(tests/unit/dashboard-artifacts.test.js|tests/browser/dashboard-artifacts.spec.js|server/dates.js|tests/unit/date-contract.test.js|tests/api/pass2-timezone-contract.test.js|context_history/contexts/2026-05-12_)'
```

Recommended verification after grouping, before PR:

```sh
bun test tests/unit/dashboard-artifacts.test.js tests/unit/date-contract.test.js tests/api/pass2-timezone-contract.test.js
PORT=3212 bun run test:browser -- tests/browser/dashboard-artifacts.spec.js
git diff --check
```

Do not run these until the branch/grouping is agreed: `git add`, `git commit`, `git pull`, `git rebase`, `git push`, file deletion, or cleanup of untracked logs.
