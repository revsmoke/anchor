## Slice 3 Pre-task Verification — 2026-05-14

### Scope
Pre-task verification for finishing Slice 3 of the Universal Agent-Accessible Tool Layer. No product code changes were made.

Reviewed:
- `server/app.js`
- `server/db.js`
- `server/auth/validation.js`
- `public/index.html`
- `public/js/app.js`
- `public/css/app.css`
- `tests/api`
- `tests/browser`
- `CAPABILITY_TOOL_MATRIX.md`
- `PLAN.md`

### Current Dirty Worktree
The worktree already contains Slice 3 edits in the expected areas:
- Modified: `server/app.js`, `server/db.js`, `server/auth/validation.js`, `public/js/app.js`, `tests/api/pass2-timezone-contract.test.js`, `tests/browser/pass3-check-in.spec.js`, `PLAN.md`, `context_history/context_index.md`.
- Untracked: `CAPABILITY_TOOL_MATRIX.md`, `db/migrations/018_safety_episodes.sql`, `tests/api/safety-routes.test.js`, `tests/unit/capability-tool-matrix.test.js`, and two Slice 1-3 context files.

Targeted verification run:
- `bun test tests/api/safety-routes.test.js`
- Result: 3 pass, 0 fail.

NotebookLM project-memory lookup did not return usable project context: tag selection had zero matches, and guessed notebook names returned `NOT_FOUND`.

### Existing Route And State Behavior
Implemented server routes:
- `GET /api/safety-plan`
- `POST /api/safety-plan`
- `PUT /api/safety-plan`
- `GET /api/safety-events`
- `POST /api/safety-events`
- `PUT /api/safety-events/:id/resolution`

Implemented persistence/state:
- `db.getSafetyPlan()` lazily creates a `safety_plans` row and returns warning signs, steps, contacts, and crisis resources.
- `db.saveSafetyPlan()` upserts the plan JSON fields.
- `db.saveSafetyEvent()` creates a safety event and creates a `safety_episodes` row when `riskTier === "acute"`.
- `db.resolveSafetyEvent()` updates event resolution fields and resolves the linked acute episode.
- Migration `018_safety_episodes.sql` adds safety event resolution columns, `safety_episode_id`, and `safety_episodes`.

Existing acute lock behavior:
- `acuteSafetyLockIfNeeded()` runs before route dispatch.
- It only checks mutating methods: `POST`, `PUT`, `PATCH`, `DELETE`.
- It skips enforcement when `db.getActiveSafetyEpisode` is absent.
- It allows these mutating routes during an active episode:
  - `POST /api/auth/logout`
  - `POST /api/safety-events`
  - `PUT /api/safety-events/:id/resolution`
  - `POST /api/voice/sessions/:id/end`
- All other mutating routes return `423 acute_safety_lock` while an active episode exists.

Current frontend safety behavior:
- Public/auth shell already shows crisis boundary text and hard-coded 911/988 links.
- Check-in and coach surfaces already render Safety Mode panels.
- Acute coach mode disables the coach send button.
- There is no dedicated signed-in Safety Plan or Help Now view.
- `public/js/app.js` has no safety-plan fetch/save state, no safety-events list/resolution state, and no Help Now-specific flow.

### Remaining Gap 1: Acute Safety Allowlist Enforcement
The current lock is a useful route-level guard, but it does not yet match the planned agent/tool-layer contract.

Exact gaps:
- No named allowlist constant for the planned acute tool names:
  - `safety.resources.read`
  - `safety.plan.read`
  - `safety.event.append`
  - `safety.episode.resolve`
  - `voice.end`
  - `session.logout`
- `safety.resources.read` is still `blocked` in `CAPABILITY_TOOL_MATRIX.md` and has no route separate from `GET /api/safety-plan`.
- `safety.plan.read` is not a distinct matrix/tool row; the matrix currently has `safety.plan.manage`.
- `safety.episode.resolve` is still `blocked`; current resolution is event-route based through `PUT /api/safety-events/:id/resolution`.
- GET routes are allowed implicitly because only mutations are checked, not because read tools are explicitly allowlisted.
- Safety-plan writes are currently blocked during acute because `POST|PUT /api/safety-plan` are not allowlisted; that matches "read allowed/write blocked", but should be tested explicitly.
- The acute lock is route/path based, not tool-name based. That is acceptable before Slice 7 dispatcher work, but the next implementation should create a shared policy shape that can later be reused by `/api/tools/call`.

### Recommended API Tests To Add First
Add these before product changes:

1. Acute policy unit/API test for named route allowlist.
   - Active episode present.
   - Assert `GET /api/safety-plan` succeeds.
   - Assert `POST /api/safety-plan` and `PUT /api/safety-plan` return `423 acute_safety_lock`.
   - Assert `POST /api/safety-events`, `PUT /api/safety-events/:id/resolution`, `POST /api/voice/sessions/:id/end`, and `POST /api/auth/logout` succeed.
   - Assert representative normal writes remain blocked: check-in, focus save, day reset, diary save, skill session, coach, chain, privacy/export/delete, settings, offline sync.

2. Explicit safety resources read contract test.
   - Either add `GET /api/safety-resources` or define `GET /api/safety-plan` as the safety resources source.
   - Test it returns crisis resources without requiring plan write access during acute mode.
   - Update matrix row from `blocked` only when this contract exists.

3. Explicit episode resolution contract test.
   - Decide whether `safety.episode.resolve` maps to the existing event resolution route or a new episode route.
   - Test active episode becomes resolved and subsequent normal writes are unlocked.
   - Test another user's event/episode cannot be resolved.

4. CSRF coverage for acute-allowed mutating routes if browser cookie auth is enabled in the test config.
   - Current app-level CSRF runs before acute lock.
   - Mutating allowlist routes should still require CSRF when CSRF protection is active.

### Remaining Gap 2: Safety Plan / Help Now UI And Browser Coverage
No dedicated UI exists yet.

Recommended UI insertion points:
- `public/index.html`
  - Add a primary nav item after `Coach` or before `Voice`: `data-view-target="safety"`.
  - Add a signed-in section near coach/voice: `id="safety-section"` with a `Safety Plan` heading, current warning signs/steps/resources, support contacts, and an always-visible `Help Now` area.
  - Include action controls for "Load safety plan", "Save safety plan", "Log safety event", and "Mark reached support" or equivalent episode-resolution action.
  - Reuse existing crisis action links, but allow persisted crisis resources from the safety plan to render in this section.
- `public/js/app.js`
  - Add `safety` to `viewMap`.
  - Add DOM references for safety plan form, Help Now actions, safety status, and error/status regions.
  - Fetch `GET /api/safety-plan` when opening the safety view or after signed-in bootstrap.
  - Save `POST|PUT /api/safety-plan` from the form.
  - Append a Help Now event through `POST /api/safety-events`.
  - Resolve the active/recent acute event through `PUT /api/safety-events/:id/resolution`.
  - Ensure acute coach/check-in Safety Mode offers a route/button to the Safety/Help Now view.
- `public/css/app.css`
  - Reuse `.today-card`, `.check-in-card`, `.safety-mode`, `.crisis-actions`, `.result-actions`, `.error`, and `.success` patterns.
  - Add only narrow styles if needed for contact/resource lists and Help Now action grouping.

### Recommended Browser Test Flow
Add a focused browser spec rather than expanding unrelated flows:

1. Sign up, save consent, complete onboarding.
2. Open the Safety/Help Now view from nav.
3. Verify the default plan/resources render, including 911/988 or seeded crisis resources.
4. Save a safety plan with one warning sign, one step, one contact, and one crisis resource.
5. Reload/open the view and verify persisted plan values render.
6. Use Help Now to append an acute event.
7. Verify normal action is locked or the UI clearly shows acute mode.
8. Verify allowed Help Now actions remain available: read resources/plan, append event, resolve event/episode, end voice if applicable, logout.
9. Resolve the event/episode and verify normal actions are available again.
10. Read browser console output and fail the test on unexpected console errors.

### Risks
- Safety resources are currently split between hard-coded shell links and persisted plan resources; without a single read contract, tool parity will stay ambiguous.
- `safety.episode.resolve` is conceptually different from `safety.event.resolve`; the matrix currently has both, but only the event route exists.
- Route-level acute enforcement is enough for HTTP now, but Slice 7 will need a shared policy keyed by tool name and route/service capability.
- GET routes bypass acute checking entirely. That is fine for safe reads, but sensitive reads should be classified intentionally before dispatcher exposure.
- Help Now UI must avoid suggesting Anchor is emergency care; existing boundary copy should remain visible.
- Browser coverage should verify both UI visibility and network behavior; otherwise a static Help Now section could pass without proving route integration.

### Suggested Next Implementation Order
1. Add red API tests for explicit acute allowlist read/write behavior.
2. Add the minimal shared acute policy constant/function that maps current routes to planned tool names.
3. Decide and test `safety.resources.read` and `safety.episode.resolve` contracts.
4. Add Safety/Help Now UI behind a signed-in nav view.
5. Add browser coverage for plan save, Help Now event append, acute lock visibility, resolution, and console cleanliness.
