# Anchor V1 Completion Implementation Plan

Date: 2026-05-12
Scope: review of `PRD.md`, `SPEC.md`, `vertical-slice-dashboard.html`, vertical-slice JSON artifacts, `CAPABILITY_LEDGER.md`, frontend, backend, database, and tests.

## Executive Finding

Anchor is a broad, runnable vertical-slice prototype. It is not yet V1-complete as written in `PRD.md` and `SPEC.md`.

The highest-risk gap is not that nothing is implemented. Many slices are real. The issue is that several surfaces are marked `done` while they are deterministic, fixture-bound, JSON-only, settings-only, or UI-only. The next work should convert those surfaces into real end-to-end capabilities, or explicitly relabel them as prototype fixtures until implemented.

## Review Inputs

- Pre-task verification: `agent-pretask-verification.md`
- Requirements lane: `review/agent-requirements-report.md`
- UI pseudo-functionality lane: `review/agent-ui-pseudo-report.md`
- Backend/data lane: `review/agent-backend-report.md`
- Tests/ledger QA lane: `review/agent-qa-report.md`
- Final plan QA: `review/agent-final-plan-qa-report.md`
- Project memory: `Project Memory - dbt - local` in NotebookLM

## Unimplemented Or Pseudo-Implemented Functionality

### P0 Launch Blockers

- `GET /api/today` is required by `SPEC.md` but absent; current Today state is spread across bootstrap, focus-plan, reset, and snapshot endpoints.
- `GET /api/safety-plan`, `PUT /api/safety-plan`, and `POST /api/safety-events` are required but absent.
- Safety plan editing/support contacts are not product-complete despite the `safety_plans` table.
- Privacy export is incomplete; it exports only a narrow subset instead of all user-owned product data.
- Delete scheduling is hard-coded to `2026-05-05T00:00:00.000Z`, which is stale as of 2026-05-12.
- Privacy delete lacks a recent-auth gate and does not clearly handle all user-owned data, safety/audit retention policy, sessions, and artifacts.
- Dashboard and ledger mark broad hardening/final-pass functionality as done even where implementation is prototype-only.

### AI, Safety, And Voice Gaps

- Text coach replies are deterministic local responses, not specialist agent orchestration.
- Safety classification is local keyword/score logic, not a complete Safety Guardian state machine.
- Quick check-ins cannot produce acute safety escalation.
- There is no persisted safety-mode flow for `yes / not sure / no`, support-contact prompting, or controlled return to coaching.
- Agent handoffs/tool calls are not modeled as durable audit data.
- `POST /api/voice/client-secret` returns `local_voice_client_secret`; live WebRTC exists only through opt-in test/prototype seams.
- Transcript artifacts and retention are not modeled separately.

### Insights, Exports, And Sharing Gaps

- Insights and weekly review are fixed deterministic synthesis, not derived analytics over diary/check-in/skills/structure evidence.
- UI calls hard-coded April 2026 date windows for weekly review, session packet export, and privacy export.
- Session packets are authenticated JSON artifacts, not clinician-ready PDF/share-link exports.
- Share links are `null`; scoped, expiring, revocable, audited therapist share links are not implemented.
- Packet export ignores requested section/date-range constraints too much and redaction is too narrow.

### Offline, Notifications, And PWA Gaps

- Notification opt-in saves settings only; it does not request browser permission, create push subscriptions, schedule reminders, or show permission state.
- Offline capture is a manual synthetic mutation tester, not automatic capture of real check-ins, diary entries, routine completions, or chain drafts.
- Backend offline sync records mutations but does not apply them to product tables.
- Duplicate offline mutation handling rejects replays instead of treating idempotent replays as already accepted.
- Conflict review always returns empty.
- Service-worker/API cache boundaries need deeper browser verification.

### Skills, Diary, Accessibility, And Product Completeness Gaps

- Skills library seeds only a small subset; favorites, recommended skills, module coverage, and a real exercise timer are incomplete.
- Diary schema exposes only a narrow target set even though validation accepts broader default target keys.
- Custom targets are not user-configurable.
- Low-stimulation mode and complete screen-state coverage are not proven.
- Under-two-taps access for persistent Mic, Check-In, and Help Now is not measured.
- Timezone/DST safety is incomplete; multiple Today operations use PostgreSQL `current_date` rather than user-local dates.
- Production environment validation is production-only and omits transcript retention config.
- Password reset lacks production email delivery and IP/email throttling.

## Implementation Rules For All Passes

- Use vertical slices only: one user-visible capability per pass, with UI, API, database, tests, ledger/dashboard updates, and data ownership updates together.
- Before implementation, write red unit/API tests, SQL-backed integration tests for persistence changes, and Playwright tests that fail for the intended reason.
- Each pass must record red/green/refactor evidence:
  - Red: command and failing assertion.
  - Green: command and passing assertion.
  - Refactor: command and passing assertion showing no behavior change.
- Required command baseline:
  - `bun run test`
  - `bun run test:browser -- <target spec>`
  - `TEST_DATABASE_URL=<disposable database> bun run db:reset` or the pass-specific migrate/seed command, followed by real PostgreSQL route/table assertions for changed persistence.
  - Live/OpenAI commands only for passes that touch live voice or model-backed coach paths, and only when required environment variables are present.
- Every browser pass must check console errors. Behavior-specific browser evidence is required where relevant:
  - Export: download and parse artifact body.
  - Delete: reload, verify old session invalidation, and verify prior artifact URL is unauthorized or not found.
  - Offline/PWA: inspect Cache Storage, prove `/api/*` is not cached, and prove offline shell reload.
  - Resume flows: reload and verify persisted state.
- Do not mark a dashboard cell `done` unless live UI, backend, data persistence, real-db tests, browser tests, and ledger evidence support the claim.
- Keep dashboard `status` values compatible with `SPEC.md`: only `todo`, `active`, and `done` unless `SPEC.md` is explicitly revised.
- Use dashboard metadata, task notes, or ledger evidence for implementation labels such as `prototype`, `demo-fixture`, `settings-only`, `blocked`, and `verified`.
- New substantial frontend logic must move into browser-native modules and be wired through the existing app shell incrementally. Default modules are `api.js`, `today.js`, `safety.js`, `offline.js`, and `voice.js`. Do not broadly rewrite `public/js/app.js` in one pass.

## Gate 0: Auditable Product, Clinical, Legal, And Retention Decisions

Gate 0 starts immediately and remains visible until all blocked passes have owner/evidence. No pass may mark Safety, Privacy, Voice, Coach, Session Sharing, or clinical copy as V1-complete while its decision row is unresolved.

Decision record format:

| Decision | Default If Unresolved | Owner | Reviewer/Source | Date | Blocked Passes | Evidence Link | Unresolved Risks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Clinical safety/content approval for crisis copy, elevated/acute copy, coach boundaries, diary labels, chain prompts, skill content, and non-shaming recovery copy | Affected surfaces remain `blocked` in metadata/ledger and cannot be V1-complete | TBD | Clinical reviewer TBD | TBD | 4, 5, 6, 9, 15 | TBD | Launch safety/legal risk |
| Legal/privacy policy for product boundary, export scope, deletion semantics, audit/safety retention, and share consent | Affected surfaces remain `blocked`; privacy copy uses prototype wording | TBD | Legal/privacy reviewer TBD | TBD | 10, 11, 16 | TBD | Data retention and consent risk |
| Transcript policy and voice retention | Do Not Save default; transcript artifacts opt-in only; no V1 completion for saved transcripts | TBD | Legal/privacy reviewer TBD | TBD | 6, 11, 16 | TBD | Audio/transcript retention risk |
| Therapist sharing V1 boundary | Export artifact/PDF is V1; scoped share links are deferred unless explicitly approved | TBD | Product/legal reviewer TBD | TBD | 10, 11, 16 | TBD | Sharing consent and audit risk |
| PDF/export format | V1 requires a downloadable clinician-ready artifact; use printable HTML/PDF path only if approved here | TBD | Product/legal reviewer TBD | TBD | 10, 11 | TBD | Export format ambiguity |
| Account mode | Account-first; anonymous trial remains deferred unless approved | TBD | Product owner TBD | TBD | 2, 3, 11, 16 | TBD | Auth/persistence ambiguity |
| Diary defaults and custom targets | Use SPEC default target hierarchy; custom targets limited and mapped to hierarchy | TBD | Product/clinical reviewer TBD | TBD | 7, 8, 10 | TBD | Analytics/export inconsistency |
| Calendar MVP scope | Data-model readiness only; no external calendar sync unless approved | TBD | Product owner TBD | TBD | 2, 13, 15 | TBD | Integration scope creep |
| Streaks/rewards | No streak/reward mechanics unless explicitly approved | TBD | Product/clinical reviewer TBD | TBD | 14, 15 | TBD | Non-clinical motivation risk |
| Notification delivery channel | In-app reminders are required fallback; Web Push only if approved and supported; email fallback only if enabled/approved | TBD | Product/legal reviewer TBD | TBD | 20, 21, 22, 16 | TBD | User expectation and deliverability risk |

## Cross-Pass Data Ownership Matrix

Every schema-changing pass must update this matrix before green status. No earlier pass may introduce tables, artifacts, or persisted event types without export/delete/retain/anonymize/audit behavior.

| Data Class | Example Tables/Artifacts | Export | Delete | Retain/Anonymize | Audit Requirement | Owning Pass |
| --- | --- | --- | --- | --- | --- | --- |
| Identity/session | `users`, `sessions`, password reset tokens | Exclude secrets/tokens | Delete sessions/tokens; user deletion follows legal policy | Retain only anonymized audit references if required | Request ID and auth event audit | 16 |
| Consent/safety plan/supports | `consent_records`, `safety_plans`, support contacts, safety episodes/events | Export user-entered plan/supports unless legal policy blocks | Delete or anonymize per safety/legal decision | Safety events may need anonymized retention | Redacted safety audit | 3, 4, 11 |
| Daily structure | profiles, routines, plans, anchors, focus plans | Export structured fields | Delete user-owned rows | None unless aggregate anonymized | Route/request audit | 2, 3, 11 |
| Diary/targets/chains | diary entries, behavior targets, custom targets, chain analyses | Export stable fields and selected chain summaries | Delete user-owned entries/chains | Retain only anonymized aggregate if approved | Redact free text in logs | 7, 9, 10, 11 |
| Skills/coaching/agents | skill sessions, coach messages, agent runs, handoffs/tool traces | Export metadata and allowed summaries; redact raw sensitive text | Delete user-owned content; anonymize traces if legally retained | Retention controlled by Gate 0 | Redacted tool/handoff audit | 5, 14, 11 |
| Voice/transcripts | voice sessions, transcript artifacts, audio/transcript metadata | Export metadata and opt-in transcript artifacts only | Delete artifacts unless retention policy says otherwise | Do Not Save default | No primary API key or raw audio logs | 6, 11 |
| Insights/reviews | insight cards, weekly reviews | Export evidence-linked summaries | Delete derived user-owned summaries | Rebuildable derived data may be deleted | Evidence refs only | 8, 11 |
| Session packets/shares/exports | packets, export artifacts, share tokens | Export/download artifact body | Delete artifacts; revoke share tokens | Retain access audit if approved | Access/share/export audit | 10, 11 |
| Offline/sync | offline mutations, conflict records | Export sync metadata if user-visible | Delete queued/completed mutations | Retain idempotency hashes only if needed | Sync audit with redacted payloads | 17, 18, 19, 11 |
| Notifications | preferences, schedules, nudges | Export preferences/schedules | Delete preferences/schedules | Retain delivery audit only if approved | Reminder delivery audit | 20, 21, 22, 11 |

## Dependency Rules

| Dependency | Rule |
| --- | --- |
| Gate 0 -> V1 completion | Any unresolved product/clinical/legal decision blocks `done` claims for affected surfaces. |
| Date Contract -> Today API -> Today Frontend | Date/timezone rules must be tested before canonical Today API and UI migration. |
| Safety Plan -> Safety Guardian | Safety-plan APIs and support-contact policy must exist before state-machine safety flows claim V1 completion. |
| Safety Guardian -> Text Coach / Voice | Coach and voice cannot claim V1 completion until elevated/acute safety interruption is consistent and persisted. |
| Diary Target Hierarchy -> Insights / Session Packets | Target schema and hierarchy labels must be complete before analytics or packet exports can be considered complete. |
| Chain Analysis -> Session Packets | Session packets must consume selected chain-analysis summaries only after chain linkage/resume/intervention outputs are real. |
| Text Coach / Voice / Session Packets -> Privacy Export/Delete | Privacy export/delete coverage must include the schemas and artifacts introduced by these passes. |
| Safety Guardian -> Offline Replay | Offline replay safety behavior is validated only after real offline sync exists. |
| Offline Queue -> Backend Applicator -> Conflict Model -> PWA Shell | Offline work must progress from capture to application to review to app-shell verification. |
| Notification Permission -> Delivery Decision -> Schedule Model -> Push Events | Notification work must not imply delivery until permission, channel, and scheduling are implemented. |

Parallel agents may work only when they own disjoint files and are not finalizing shared schemas or export/privacy semantics. Do not parallel-finalize `agent_handoffs`, `transcript_artifacts`, `insight_cards`, share tokens, export artifacts, notification schedules, offline mutations, or retention semantics.

## Vertical Slice Plan

### Pass 1: Truthful Status And Evidence Baseline

Capability: maintainers can trust the dashboard, ledger, and tests as the source of truth.

Red tests:
- Dashboard artifact contract test loads `vertical-slice-dashboard.html`, extracts `DEFAULT_STATE`, imports each `vertical-slice-dashboard-anchor-*.json`, and validates dimensions/statuses against the SPEC status enum.
- Label-aware test fails when a `done` cell lacks sufficient evidence metadata or ledger proof.
- Metadata tests accept labels such as `settings-only`, `demo-fixture`, `prototype`, `blocked`, and `verified` without changing the `status` enum.

Implementation:
- Preserve `status` values as `todo`, `active`, `done`.
- Add/standardize evidence metadata or ledger entries for prototype state.
- Downgrade these specific surfaces in metadata/ledger evidence: notifications, offline capture, skill timer, voice controls, privacy controls, therapist sharing/share links, passcode/app lock, and hard-coded April 2026 insights/exports.
- Update `CAPABILITY_LEDGER.md` and README wording to distinguish complete slices from prototype seams.

Done:
- Dashboard JSON remains SPEC-compatible.
- Misleading `done` claims have evidence labels or are moved back to `todo`/`active`.
- Default tests prove artifact importability, dashboard state consistency, and honest labeling.

### Pass 2: Date And Timezone Contract

Capability: Anchor has one tested date contract for user-local daily state.

Red tests:
- Unit/API tests fail where bootstrap, routine setup, focus plan, reset, anchor completion, and future `GET /api/today` disagree on the user-local date.
- Fixtures cover at least two timezones and one DST boundary.
- Tests prove server PostgreSQL `current_date` is not the source of truth for user-day behavior.

Implementation:
- Define timezone source of truth: authenticated user profile timezone; fallback to explicit request timezone only for pre-profile onboarding; never infer from database server time.
- Add a date helper/service used by daily routines, plans, focus plans, resets, anchor completion, bootstrap, and Today API work.
- Define date query behavior: `date=YYYY-MM-DD` is optional; when omitted, use user-local current date from profile timezone.

Done:
- All daily-state routes use the same date helper.
- SQL-backed integration tests prove daily data lands on the expected local date.

### Pass 3: Canonical `GET /api/today`

Capability: an authenticated user can fetch one canonical Today payload for a user-local date.

Interface:
- Request: `GET /api/today?date=YYYY-MM-DD`.
- Response: `{ "dailyPlan": object, "anchors": [], "nextBestStep": object|null, "diaryStatus": object, "recommendedSkill": object|null }`.
- Behavior: creates missing daily plan and routine instances lazily for the requested user-local date, using existing templates. It must not create duplicate instances for the same user/date/type.

Red tests:
- API test for response shape, lazy daily plan creation, no duplicate anchor instances, and user-local date behavior.
- SQL-backed test verifies created/queried rows in PostgreSQL.

Implementation:
- Add route, validation, and PostgreSQL adapter method.
- Derive `nextBestStep`, `diaryStatus`, and `recommendedSkill` from persisted data only.
- Update bootstrap to include or call the canonical Today adapter without duplicating logic.

Done:
- `GET /api/today` is the canonical Today read model.
- Existing bootstrap/tests still pass.

### Pass 4: Today Frontend Migration

Capability: Today UI renders from the canonical Today API and keeps existing flows working.

Red tests:
- Browser test proves Today loads from `/api/today`, survives reload, and updates after focus plan, check-in, reset, and anchor completion.
- Browser network assertion confirms the canonical route is used.
- Console-error check is clean.

Implementation:
- Move Today-specific frontend logic into `public/js/today.js` and API helpers into `public/js/api.js`.
- Wire modules through the existing app shell without a broad rewrite.
- Remove hard-coded or scattered Today state assumptions where the canonical payload replaces them.

Done:
- Today state is rendered from `/api/today`.
- Existing navigation and guided views still work.

### Pass 5: Safety Plan And Safety Event Interfaces

Capability: a user can read/update a safety plan, manage support contacts, and append safety events through required APIs.

Interface decisions:
- Normalize support contacts in a new `support_contacts` table. Keep existing `safety_plans.contacts` only as legacy/backfill input and migrate active support contacts to the normalized table.
- `GET /api/safety-plan` returns `{ "safetyPlan": object, "supportContacts": [], "crisisResources": [] }`.
- `PUT /api/safety-plan` accepts coping steps, warning signs, environment steps, and support contacts.
- `POST /api/safety-events` accepts `{ "riskTier", "triggerType", "context", "outcome" }` and writes append-only events.

Red tests:
- API and SQL-backed tests for get/update/support-contact persistence and append-only event creation.
- Browser test edits safety plan/support contacts and sees them in the Help Now surface.

Implementation:
- Add migration and adapter methods for normalized support contacts.
- Add required routes and authorization.
- Add Safety Plan UI under Help Now/Me.
- Update data ownership matrix rows for safety/support data.

Done:
- Safety plan is no longer table-only.
- Safety events can be logged outside coach/check-in internals.

### Pass 6: Safety Guardian State Machine

Capability: elevated and acute risk interrupts normal online flows consistently across check-in, coach, and voice.

Interface decisions:
- Add `safety_episodes` for active state, tier, source route, selected response, lock state, and resolved timestamp.
- Elevated UI responses: `yes`, `not_sure`, `no`.
- Acute state locks coach/voice until explicit session reset or safety episode resolution.
- Help Now is persistent in the authenticated shell and links to crisis resources plus saved support contacts.

Red tests:
- API/browser fixtures for normal, elevated, and acute across check-in and coach.
- Elevated response persistence for `yes`, `not_sure`, and `no`.
- Acute lock behavior for coach/voice.
- Redacted audit/request ID checks.

Implementation:
- Extract safety classifier and state-machine service.
- Model safety episodes separately from one-off payloads.
- Connect support-contact prompts and controlled return-to-normal logic.
- Keep offline replay validation for the later offline pass.

Done:
- Safety behavior is consistent, persisted, and testable for online flows.

### Pass 7: Real Text Coach Orchestration

Capability: coach replies are generated through observable specialist orchestration with deterministic fallback.

Red tests:
- Unit test proves orchestrator chooses Structure, Skills, Reflection, or Safety based on mode/state.
- API and SQL-backed tests prove `POST /api/coach/messages` records agent run, handoff/tool trace, model/fallback status, and recommended skill.
- Browser test proves planning, skill help, reflection, and rescue modes produce distinct action-ended replies.

Implementation:
- Add server-side agent service layer behind config.
- Add deterministic fallback mode for local tests.
- Add `agent_handoffs` and tool-trace persistence.
- Replace `len:<message length>` with a privacy-preserving content fingerprint.
- Update data ownership matrix for coach/agent data.

Done:
- Production-capable agent path exists; tests can run with deterministic fakes.

### Pass 8: Voice Client Secret, Retention, And Controls

Capability: voice coaching has a real server-minted Realtime session path, visible controls, and explicit transcript retention.

Red tests:
- API test proves route never returns the primary API key and returns a real ephemeral/session token shape when live mode is enabled.
- Browser test proves start, listening state, mute, reconnect, end, transcript preview, and Do Not Save.
- SQL-backed test proves transcript artifact is absent by default and present only when opted in.

Implementation:
- Align route naming/contract with actual Realtime flow.
- Add `transcript_artifacts` table and retention cleanup hooks.
- Add visible mute/reconnect/listening UI.
- Move voice frontend logic to `public/js/voice.js`.
- Update data ownership matrix for voice/transcript data.

Done:
- Local deterministic mode remains, but V1 voice behavior is real and clearly gated.

### Pass 9: Diary Schema And Target Configuration

Capability: diary card exposes all default V1 targets and supports custom target configuration.

Red tests:
- API and SQL-backed tests prove default diary schema exposes every V1 target key and hierarchy label.
- Browser test proves user can enable/disable/add custom targets without breaking diary save/load.
- Contract tests expose hierarchy helper output for later insights/session packets.

Implementation:
- Expand seeded diary schema.
- Add target configuration route/UI.
- Add reusable hierarchy-label helper/contract only. Do not change Insights or Session Packet behavior in this pass.
- Update data ownership matrix for custom target data.

Done:
- Diary target contracts are complete before analytics/export work proceeds.

### Pass 10: Derived Insights And Weekly Review

Capability: weekly review and insights change based on actual user evidence.

Red tests:
- Seed contrasting diary/check-in/skills/anchor data and assert different structure scores, trends, and recommendations.
- Browser test proves weekly review uses current user-local week, not hard-coded April 2026 dates.
- SQL-backed test verifies evidence refs point to persisted user data.

Implementation:
- Add deterministic analytics service over persisted fields.
- Add `insight_cards` only if durable insights are needed for product behavior; otherwise keep insights derived on read.
- Apply target hierarchy labels using Pass 9 helper.
- Render trend data without claiming charts that do not exist, or add the charts.
- Update data ownership matrix for derived insight/review data.

Done:
- Insights are evidence-derived, hierarchy-aware, and date-current.

### Pass 11: Chain Analysis Completion

Capability: a user can start a chain analysis from diary or scratch, resume it, complete all sections, and produce exportable intervention points.

Red tests:
- API/browser test proves start from diary links the chain to the source diary entry.
- API/browser test proves draft chain resumes after reload.
- API and SQL-backed tests prove completed chain stores prompting event, vulnerabilities, links, consequences, intervention points, alternative skills, and prevention plan.
- Export contract test proves only explicitly selected chain summaries are eligible for session packets.

Implementation:
- Add missing diary-to-chain entry points and route support.
- Add intervention-point and alternative-skill derivation from stored chain fields.
- Add resume state to the UI and tests.
- Update data ownership matrix for chain fields/free text.

Done:
- Chain analysis satisfies V1 requirements and can safely feed session prep.

### Pass 12: Session Packet Export Artifact

Capability: a user can generate and download a clinician-ready V1 export artifact.

Interface decisions:
- V1 requires a downloadable clinician-ready artifact. Default format is structured JSON plus printable HTML/PDF export path if Gate 0 approves PDF generation. The artifact must be parseable in tests and printable by the browser.
- Scoped share links are deferred unless Gate 0 explicitly approves them.

Red tests:
- API/browser tests prove selected date range and included sections constrain exported content.
- Browser test downloads and parses artifact body.
- Tests verify redaction, hierarchy labels, stable-field-only content, and selected chain summaries only.

Implementation:
- Add artifact generation constrained by requested range/sections.
- Add redaction preview/selection UI.
- Apply target hierarchy labels using Pass 9 helper.
- Update data ownership matrix for export artifacts.

Done:
- Session prep export satisfies V1 export artifact requirement without implying share links.

### Pass 13: Scoped Sharing If Approved

Capability: if Gate 0 approves V1 share links, a user can create, access, revoke, and audit scoped therapist share links.

Red tests:
- If approved: share link is expiring, revocable, scoped, and audited.
- If not approved: UI/dashboard/ledger label share links as deferred/blocked metadata and no share-token routes are exposed as V1-complete.

Implementation:
- Add share-token tables and audited access route only if approved.
- Add UI for share create/revoke/expiration only if approved.
- Update data ownership matrix for share tokens/access logs.

Done:
- Share behavior is either implemented and audited or explicitly deferred without misleading UI.

### Pass 14: Complete Privacy Export/Delete

Capability: export/delete covers all user-owned product data with recent-auth protection and correct retention semantics.

Red tests:
- Export includes profile, consent, routines, plans, check-ins, diary, skills, chains, coach metadata, voice metadata, settings, packets, artifacts, and any approved share metadata.
- Delete requires recent auth, invalidates sessions, removes product data, and makes prior export/share URLs inaccessible.
- Browser test reloads after delete and proves old session bootstrap is rejected or signed out.
- SQL-backed test proves scheduled deletion date is computed from request time, not hard-coded.

Implementation:
- Expand export service coverage using the data ownership matrix.
- Add recent-auth challenge/check.
- Define and implement retained/anonymized audit/safety records from Gate 0 policy.
- Remove stale fixed dates.

Done:
- Privacy flows are production-defensible and matrix-complete.

### Pass 15: Frontend Offline Queue Wrapper

Capability: supported user actions are captured into a real offline queue when network/API submission fails.

Red tests:
- Browser test forces network failure and proves check-in, diary, routine completion, and chain draft actions are queued with real payloads.
- Reload test proves queued mutations survive page reload.

Implementation:
- Move offline queue frontend logic to `public/js/offline.js`.
- Wrap real action submissions; remove synthetic manual-only mutation behavior from V1 surfaces.
- Store `clientMutationId`, entity type, occurred-at timestamp, and payload.

Done:
- Offline capture records real user actions.

### Pass 16: Backend Offline Mutation Applicator

Capability: queued offline mutations apply to product tables when sync succeeds.

Red tests:
- API and SQL-backed tests prove queued check-ins, diary entries, routine completion, and chain drafts write to the correct product tables.
- Mutations apply in occurred-at order within entity type.

Implementation:
- Implement backend applicators for supported mutation types.
- Write sync audit events with redacted payloads.
- Update data ownership matrix for offline mutation data.

Done:
- Offline sync changes product state, not only mutation logs.

### Pass 17: Offline Idempotency And Conflict Review

Capability: duplicate offline mutations are idempotent, and stale overwrites produce user-visible review.

Red tests:
- API tests prove duplicate `clientMutationId` returns previously accepted result without duplicate writes.
- Conflict tests produce `needsReview`.
- Browser test shows conflict review UI and lets the user keep server or local version.

Implementation:
- Add idempotency result storage and conflict detection.
- Add conflict review UI.
- Ensure safety-interrupted offline replay respects persisted Safety Guardian state.

Done:
- Offline sync is safe for replay, duplicates, and conflicts.

### Pass 18: PWA App Shell And Cache Boundaries

Capability: the installable app shell works offline without caching API responses.

Red tests:
- Browser/PWA test proves manifest link exists, service worker registers, offline app-shell reload works, `/api/*` responses are not in Cache Storage, and visible offline state appears.
- Mobile-supported installability checklist is completed for supported browsers.

Implementation:
- Adjust service worker/app shell behavior where missing.
- Add offline state UI if absent.

Done:
- App-shell PWA claims are verified.

### Pass 19: Notification Permission UI

Capability: users can see and control browser notification permission state.

Red tests:
- Browser test proves permission request state is visible, saved, and does not imply delivery before a delivery channel exists.
- UI uses metadata/ledger label `settings-only` until delivery is implemented.

Implementation:
- Add permission state UI and persistence.
- Keep in-app fallback copy visible when browser push is unavailable.

Done:
- Notification opt-in no longer overpromises delivery.

### Pass 20: Reminder Scheduling Model

Capability: Anchor can compute quiet-hours-aware reminder schedules.

Red tests:
- Unit/API tests prove anchor reminders, missed-check-in recovery, therapy-day reminders, and weekly review prompts respect quiet hours/intensity.
- SQL-backed tests prove persisted schedules/preferences.

Implementation:
- Add notification preference/schedule schema if current settings are insufficient.
- Implement deterministic schedule computation.
- In-app reminders are required fallback.

Done:
- Reminder schedules exist independently of push delivery.

### Pass 21: Web Push / Service Worker Notification Delivery If Approved

Capability: if Gate 0 approves Web Push, supported browsers receive real reminders.

Red tests:
- If approved: browser/service-worker test proves a test notification path is gated by permission and disabled when opted out.
- If not approved: UI/dashboard/ledger label Web Push as deferred, while in-app reminders remain complete.

Implementation:
- Implement push subscription and service-worker notification handling only if approved.
- Email fallback remains out of scope unless explicitly enabled/approved.

Done:
- Notification delivery behavior matches approved channel scope.

### Pass 22: Skills Library Completion

Capability: the skills library supports V1 DBT module coverage, favorites, recommendations, recent skills, and real timed exercises.

Red tests:
- Seed coverage proves all four DBT modules have V1 content.
- Browser test proves favorite/unfavorite, recommended skill from Today state, recent list, and timer progression.
- SQL-backed tests prove favorites/recent/helpfulness persist.

Implementation:
- Expand skill seed data.
- Add favorites/recommendation data model.
- Add timer UI with accessible state and reduced-motion behavior.
- Update data ownership matrix for new skill data.

Done:
- Skills are useful beyond three seeded cards.

### Pass 23: Onboarding/Profile Parity

Capability: onboarding captures all V1 profile fields needed by Today, reminders, and later integrations.

Red tests:
- Browser/API tests prove onboarding captures preferred check-in times, calendar permission scope, therapy status, goals, struggles, and anchor preferences.
- Tests prove first-week reminder schedule is created or explicitly marked in-app-only depending on Gate 0 notification decision.

Implementation:
- Add missing profile fields/routes/UI.
- Keep calendar MVP to data-model readiness only unless Gate 0 approves external sync.
- Update data ownership matrix for new profile/reminder fields.

Done:
- Onboarding data matches V1 requirements without silently enabling external calendar sync.

### Pass 24: Accessibility, Low-Stimulation Mode, And Fast-Use QA

Capability: primary actions are accessible, low-stimulation mode is real, Help Now/Check-In/Mic are reachable within two taps, and core flows meet fast-use windows.

Red tests:
- Browser tests cover keyboard path, focus order, labels, reduced motion, low-stimulation toggle, and mobile viewport checks.
- Browser tests prove persistent Help Now, Check-In, and Mic entry points meet under-two-taps acceptance.
- Browser/manual QA scripts measure Quick Check-In under 30 seconds, Diary about 2 minutes, and Chain/session prep coherent for 10-minute use.

Implementation:
- Add low-stimulation setting and CSS behavior.
- Tighten nav/action placement for mobile and desktop.
- Add screen-state matrix for loading, first-use, returning, offline, error, and safety-interrupted states.
- Add repeatable fast-use scripts/checklists for measured QA.

Done:
- Accessibility and fast-use claims are backed by tests or explicit measured QA artifacts.

### Pass 25: Production Readiness, Abuse Controls, And Security Verification

Capability: private beta deployment fails fast when misconfigured and protects sensitive/auth surfaces from abuse.

Red tests:
- Config tests fail when required env vars are absent in beta/production modes.
- Password reset throttling tests cover email/IP limits and lockouts.
- Readiness check validates OpenAI model env, transcript retention, APP_ORIGIN, secure cookies, CSRF, and database migrations.
- Security tests/audit evidence cover parameterized SQL, request IDs, redacted sensitive logs, secure cookie policy, scoped share audit if enabled, and retention/deletion evidence.

Implementation:
- Add beta/production env validation.
- Add reset throttling schema/service.
- Integrate email provider or explicitly keep local-code reset behind local-only guard.
- Add final migration smoke command against disposable PostgreSQL as a CI/private-beta gate.

Done:
- Private beta readiness is operational, not only documented.

## Suggested Execution Order

1. Gate 0 starts immediately and remains visible until decisions have owner/evidence.
2. Pass 1 first, because status truthfulness prevents future agents from compounding false `done` states.
3. Passes 2-4 next, because all Today work depends on the date contract.
4. Passes 5-6 next, because Safety Plan and Safety Guardian are central product boundaries.
5. Passes 7-8 follow Safety Guardian because coach and voice depend on persisted safety interruption.
6. Pass 9 must precede Passes 10 and 12 because target hierarchy is required for insights and session exports.
7. Pass 11 must precede Pass 12 because packets require selected chain summaries.
8. Pass 14 follows coach, voice, insights, packets, and any approved sharing because privacy export/delete must cover those artifacts.
9. Passes 15-18 complete offline/PWA in capture -> apply -> conflict -> shell order.
10. Passes 19-21 complete notifications in permission -> schedule -> delivery order.
11. Passes 22-25 complete skills, onboarding parity, accessibility/fast-use, and production readiness.

## Verification Gate For Every Pass

- `bun run test`
- `bun run test:browser -- <target spec>`
- Console-error check for every browser pass.
- SQL-backed verification for every persistence-changing pass using disposable `TEST_DATABASE_URL`.
- Dashboard artifact update/import validation where dashboard claims change.
- `CAPABILITY_LEDGER.md` update with red/green/refactor commands and exact test results.
- Data ownership matrix update for every schema/artifact change.
- Context history/session memory update.

## Immediate Next Action

Start with Pass 1:

1. Add failing dashboard artifact and metadata-aware evidence tests while preserving the SPEC status enum.
2. Add evidence metadata/ledger labels for notifications, offline capture, skill timer, voice controls, privacy controls, therapist sharing/share links, passcode/app lock, and hard-coded April 2026 insights/exports.
3. Update ledger/README wording so future implementation starts from an honest baseline.
