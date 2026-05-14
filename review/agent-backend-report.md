# Backend/Data Implementation Review

Lane: backend/data implementation review agent
Scope inspected: `server/app.js`, `server/db.js`, `server/config.js`, `server/readiness.js`, `server/services/*`, `server/auth/*`, `db/migrations`, `db/seeds`, `tests/api/*`, compared with `PRD.md`, `SPEC.md`, and `CAPABILITY_LEDGER.md`.

## Verification Performed

- Read PRD/SPEC/CAPABILITY_LEDGER backend/data requirements, especially required route groups, high-risk route contracts, AI/safety, privacy, sync, and target hierarchy.
- Inspected implemented route dispatch in `server/app.js`.
- Inspected PostgreSQL adapter behavior in `server/db.js`.
- Inspected config/readiness/service/auth validation modules.
- Inspected migrations/seeds and API tests.
- Ran `bun test tests/api`: 53 pass, 0 fail.

## Executive Summary

The backend is a runnable vertical-slice prototype, not V1-complete backend/data behavior. It has real PostgreSQL persistence for many core entities, but several V1 requirements are either absent, represented by deterministic placeholders, or only captured as local/test seams.

The largest gaps are:

1. Required V1 route/data surfaces are missing: `GET /api/today`, `GET/PUT /api/safety-plan`, and `POST /api/safety-events` are in `SPEC.md` but not routed in `server/app.js`; supporting tables such as `support_contacts`, `notification_preferences`, `nudges`, `agent_handoffs`, `transcript_artifacts`, `insight_cards`, and therapist/share-token tables are absent.
2. AI/safety/insights/export/offline behavior is largely deterministic or storage-only: coach replies, risk classification, prevention plans, weekly review, insights, deletion scheduling, and offline sync do not implement the V1 semantic behavior.
3. API tests pass because they mostly assert the current placeholder behavior through in-memory adapters; they do not prove the real PostgreSQL schema satisfies the V1 data contract or that the backend implements the required production behaviors.

## Findings

### 1. Missing Required Route Groups

Spec requirement:

- `SPEC.md` requires `GET /api/today`, `GET /api/safety-plan`, `PUT /api/safety-plan`, and `POST /api/safety-events` in the required route groups.
- The route contract says `GET /api/today` returns `{ dailyPlan, anchors, nextBestStep, diaryStatus, recommendedSkill }`.
- The route contract says safety-plan routes expose and update safety plans/support contacts/crisis resources, and `POST /api/safety-events` is append-only safety event logging.

Implemented state:

- `server/app.js` routes `/api/today/snapshot`, `/api/app/bootstrap`, `/api/today/focus-plan`, `/api/today/reset`, and anchor completion, but not `GET /api/today`.
- `server/app.js` has no `GET /api/safety-plan`, `PUT /api/safety-plan`, or `POST /api/safety-events`.
- `db/migrations/002_auth_consent.sql` creates `safety_plans`, but there is no route/service to retrieve or update it.
- `server/db.js` has no public adapter methods for safety-plan get/update or manual safety-event creation.

Impact:

- The V1 Today command-center API is not implemented as specified.
- Persistent crisis/safety plan behavior in PRD section 12.7 is not backend-complete.
- Offline or external safety events cannot be appended through the required API route.

### 2. Safety Classifier Is Local Keyword Logic, Not V1 Safety Guardian Behavior

Spec/PRD requirement:

- Elevated and acute risk must interrupt normal coaching.
- Elevated flow requires `yes / not sure / no`, grounding, support contact/safety plan prompting, and controlled return to normal coaching.
- Acute flow locks normal coaching and foregrounds emergency/support actions.
- Risk reviews for side-effecting features must be logged.

Implemented state:

- `POST /api/check-ins` uses `recommendNextAction()`/`classifyRisk()` in `server/app.js`; it only elevates on `primaryUrgeScore >= 5`, `"not sure i can stay safe"`, or `"unsafe"`.
- Quick check-ins cannot produce `acute`; they only return `normal` or `elevated`.
- `POST /api/coach/messages` uses `classifyCoachRisk()` keyword arrays and deterministic `coachSafetyModePayload()`.
- There is no persisted safety-mode state machine for `yes / not sure / no`, no support-contact routing, and no recovery-to-normal conditions.
- `agent_runs` stores `safety_decision`, but there is no `agent_handoffs` table and no tool-call trace model.

Impact:

- This satisfies deterministic fixture tests, but not V1 Safety Guardian behavior.
- Safety behavior is underfit and may miss foreseeable elevated/acute wording.
- Safety escalation cannot use user-configured supports because support contacts are not modeled.

### 3. Text Coach and Agent System Are Deterministic Placeholders

Spec/PRD requirement:

- Anchor Orchestrator plus specialists should use Agents SDK/Responses API, specialists as tools, handoffs for Safety/Voice, and traced tool calls.
- Coach must understand planning, skill help, reflection, or rescue and recommend skills based on current state.

Implemented state:

- `POST /api/coach/messages` creates an `agent_run`, then returns fixed local responses:
  - `skill` mode always says `Use one short skill...` and recommends `Open Paced Breathing`.
  - Other modes always say `Let's reduce the day to one must-do.`
- `specialistForMode()` returns only `Skills Coach` or `Structure Coach`; no `Reflection Coach` path.
- `inputFingerprint` is `len:<message length>`, not a stable privacy-preserving content fingerprint.
- `server/services` has no orchestrator, safety-classifier, recommendation-engine, retention-policy, or agent service implementation.

Impact:

- The user-facing coach path is a local stub despite V1 agent requirements.
- Agent auditability is partial: it records labels and safety decisions, but not actual specialist calls, handoffs, guardrails, or tool calls.

### 4. Voice Route Does Not Return a Real Short-Lived Client Secret

Spec requirement:

- `POST /api/voice/client-secret` must create a short-lived Realtime client secret server-side.
- Browser receives only that client secret and session config.

Implemented state:

- `server/services/realtime.js` can create a server-mediated Realtime call when given an SDP offer and force-network conditions.
- `server/app.js` always returns `clientSecret.value: "local_voice_client_secret"` with a local expiry, even when the Realtime call path is used.
- If no `sdpOffer` is sent, `server/app.js` returns a deterministic local SDP answer and `openAiCallId: "local_realtime_call"`.
- `voice_sessions` stores `openai_call_id`, `do_not_save`, and transcript flags, but there is no `transcript_artifacts` table.

Impact:

- Server-mediated WebRTC is partially present, but the route name/contract still promises a client-secret flow that is not real.
- The deterministic `clientSecret` placeholder is explicitly asserted in API tests.
- Saved transcript/summary retention is not modeled separately as required.

### 5. Insights and Weekly Review Are Fixed Synthesis, Not Derived Analytics

Spec/PRD requirement:

- Insights/weekly reviews must inspect patterns by emotion, urge, behavior, skill, structure adherence, and sort targets by DBT hierarchy.
- Reviews and clinician summaries must use stable fields and target hierarchy labels.

Implemented state:

- `server/db.js#getInsights()` returns one fixed card title, fixed `structureScore: 72`, and one evidence date based only on latest diary date or fallback `"2026-04-28"`.
- `server/db.js#getWeeklyReview()` upserts fixed arrays:
  - `wins: ["Completed skills practice"]`
  - `misses: ["One missed anchor"]`
  - `recommendations: ["Keep morning anchor small"]`
  - `sourceEvidence: ["skill_session:1", "diary:2026-04-28"]`
- No `insight_cards` table exists.

Impact:

- The analytics behavior does not satisfy V1 review/session-prep expectations.
- Tests assert fixed output rather than derived behavior.

### 6. Session Packet Export Is JSON-Only, Not V1 Clinician Share/Export

Spec/PRD requirement:

- Session prep must generate weekly or appointment summaries containing diary-card trends, intense emotions, top urges/behaviors, missed anchors, skills used, chain summaries, and questions/topics.
- Session packets must include target hierarchy labels.
- Share links must be scoped, revocable, expiring, and auditable.
- V1 asks for PDF and share link behavior in PRD/SPEC.

Implemented state:

- `POST /api/session-packets` creates `session_packets`, writes an authenticated JSON artifact, and returns `shareUrl: null`.
- `server/db.js#getSessionExportData()` ignores the requested packet date range and included sections; it fetches fixed recent limits for diary, skills, chains, and weekly reviews.
- Redaction only strips keys named `notes`.
- No share-token table, therapist connection table, scoped share route, or share access audit path exists.
- `db/migrations/012_session_packets.sql` has `session_packets`; production hardening adds `export_artifacts`, but no share metadata beyond `share_mode`.

Impact:

- Export is useful as a local JSON artifact, but not a V1 clinician-ready PDF/share implementation.
- The stable-fields-only rule is not fully enforced because packet section/date-range selection does not constrain export queries.

### 7. Privacy Export and Deletion Are Incomplete and Include a Past Hard-Coded Deletion Date

Spec/PRD requirement:

- Export/delete must cover user data, transcripts, derived summaries, and share artifacts.
- Deletion must complete product-side deletion within 30 days.
- Recent-auth check is part of route contracts for privacy export/delete.

Implemented state:

- `POST /api/privacy/export` writes a JSON artifact.
- `server/db.js#getPrivacyExportData()` only exports `voice_sessions` and `session_packets`; it omits profile, consents, routines, check-ins, diary entries, skills, chains, safety events, settings, audit-relevant artifacts, etc.
- `server/db.js#createDeleteRequest()` hard-codes `scheduledDeletionAt = "2026-05-05T00:00:00.000Z"`. As of this review date, 2026-05-12, that scheduled deletion timestamp is already in the past.
- `executeDeleteRequest()` deletes many product tables but does not delete `safety_events`, `audit_events`, `export_artifacts` rows, or the `users` row; export artifacts are soft-deleted separately only when the handler calls `deleteExportArtifactsForUser()`.
- No recent-auth verification is implemented for privacy export/delete routes.

Impact:

- Privacy export is materially incomplete for V1.
- Delete scheduling is deterministic and currently stale.
- Deletion semantics are not clearly aligned to product-side deletion requirements.

### 8. Offline Sync Stores Mutations But Does Not Apply Them

Spec requirement:

- Offline sync must support quick check-ins, diary entries, routine completion, and chain-analysis drafts.
- Mutations must be applied in occurred-at order within entity type.
- Server returns `accepted`, `rejected`, and `needsReview` when conflicts would overwrite newer server state.

Implemented state:

- `server/db.js#applyOfflineMutations()` inserts rows into `offline_mutations` and returns `accepted`.
- Duplicate `clientMutationId` becomes `rejected`, not idempotent successful replay.
- It never applies payloads to `quick_check_ins`, `diary_entries`, `routine_instances`, or `chain_analyses`.
- It never sorts by `occurredAt`.
- It always returns `needsReview: []`.
- The table is named `offline_mutations`; the SPEC domain model names `offline_queue_items`, though the capability ledger also uses `offline_mutations`.

Impact:

- Offline capture is storage/audit only from the backend perspective.
- Required offline data does not actually sync into product state.

### 9. Timezone/DST Behavior Uses Server `current_date`

Spec requirement:

- Time-sensitive features must be timezone aware and daylight-saving safe.

Implemented state:

- `saveRoutineSetup()`, `getAppBootstrap()`, `getTodayFocusPlan()`, `saveTodayFocusPlan()`, `completeRoutineInstance()`, and day-reset logic use PostgreSQL `current_date`.
- Requests generally do not accept an explicit user-local date for Today/focus-plan/reset.
- `GET /api/today` with optional `date` query is absent.

Impact:

- A user outside the database/server timezone can get anchors, focus plans, or daily plans under the wrong day boundary.
- DST-safe day calculations are not implemented in backend route contracts.

### 10. Environment Validation Is Production-Only

Spec requirement:

- Required environment variables include `APP_ENV`, `APP_ORIGIN`, `PORT`, `DATABASE_URL`, `SESSION_SECRET`, `OPENAI_API_KEY`, `REALTIME_MODEL`, `TEXT_MODEL`, `TRACE_RETENTION_DAYS`, and `TRANSCRIPT_RETENTION_DAYS`.
- Server startup must validate required vars and fail fast with a clear error.

Implemented state:

- `server/config.js#getServerConfig()` defaults `DATABASE_URL`, `SESSION_SECRET`, `OPENAI_API_KEY`, model names, and retention values outside `production`.
- It only throws for missing values in `production`.
- `TRANSCRIPT_RETENTION_DAYS` is not part of server config validation.

Impact:

- Local/test/dev can silently run without required secrets or retention config.
- This may be acceptable for prototype mode, but it is not the V1 startup validation specified.

### 11. Data Model Omits Several V1 Entities

Present core tables include:

- `users`, `sessions`, `consent_records`, `safety_plans`, `user_profiles`, `routine_templates`, `routine_instances`, `daily_plans`, `quick_check_ins`, `safety_events`, `diary_entries`, `behavior_targets`, `skill_definitions`, `skill_sessions`, `agent_runs`, `coach_messages`, `chain_analyses`, `voice_sessions`, `weekly_reviews`, `session_packets`, `user_settings`, `privacy_exports`, `delete_requests`, `offline_mutations`, `export_artifacts`, `audit_events`, `password_reset_tokens`, `daily_focus_plans`.

Missing or not meaningfully modeled for V1:

- `support_contacts`
- `notification_preferences`
- `nudges`
- `agent_handoffs`
- `transcript_artifacts`
- `insight_cards`
- `therapist_connections`
- scoped/revocable/expiring share-token metadata
- local app lock/passcode metadata
- notification intensity fields

Impact:

- Several PRD/SPEC surfaces cannot be implemented without schema expansion or overloaded JSON fields.

### 12. Diary Schema Is Seeded Narrower Than Default V1 Schema

Spec/PRD requirement:

- Seed data must include all default targets even if hidden.
- Stable analytics/export fields include target behavior occurrence values and hierarchy labels.

Implemented state:

- `behavior_targets` seeds all default target rows.
- `server/db.js` has a hard-coded `DIARY_SCHEMA.targetKeys` of only `["isolate_avoid", "completed_anchor"]`.
- `db/migrations/006_diary_card.sql` seeds `diary_schemas.core_fields.targetKeys` with only `["isolate_avoid","completed_anchor"]`.
- `validateDiaryEntryPayload()` accepts all default target keys, but the exposed schema does not advertise them.
- No custom target configuration/mapping route is implemented.

Impact:

- The default V1 diary schema exposed by API is incomplete even though validation accepts more keys.
- Charts/reviews/session packets cannot reliably know the full target hierarchy from the schema route.

### 13. Tests Codify Placeholder Behavior

Observed API tests:

- `tests/api/pass8-13-final-slices.test.js` expects `clientSecret.value` to be `"local_voice_client_secret"`.
- The same suite expects `structureScore` to be `72` and evidence refs to fixed fixture strings.
- Delete request tests expect `scheduledDeletionAt` to be `"2026-05-05T00:00:00.000Z"`.
- Offline sync tests expect `needsReview` to equal `[]`.
- Most API suites create in-memory db adapters rather than exercising the real `server/db.js` against migrations.

Impact:

- Passing API tests prove route handlers match the current prototype contract.
- They do not prove V1 data behavior, SQL schema compatibility, or production semantics.

## Route Gap Checklist

Implemented but extra/prototype:

- `GET /api/today/snapshot`
- `GET /api/app/bootstrap`
- `GET /api/csrf`
- `POST /api/auth/password-reset/request`
- `POST /api/auth/password-reset/confirm`
- `GET/POST /api/today/focus-plan`
- `POST /api/privacy/delete-requests/:id/execute`
- `GET /api/exports/:id/download`

Required by SPEC but not implemented:

- `GET /api/today`
- `GET /api/safety-plan`
- `PUT /api/safety-plan`
- `POST /api/safety-events`

Partially implemented with placeholder/local behavior:

- `POST /api/check-ins`
- `POST /api/coach/messages`
- `POST /api/voice/client-secret`
- `GET /api/insights`
- `GET /api/weekly-review/:weekStart`
- `POST /api/session-packets`
- `POST /api/privacy/export`
- `POST /api/privacy/delete-request`
- `POST /api/sync/offline-queue`

## Recommended Backend/Data Priority

1. Close required route omissions first: implement `GET /api/today`, `GET/PUT /api/safety-plan`, and `POST /api/safety-events` against PostgreSQL with tests.
2. Replace deterministic placeholder surfaces with real V1 semantics or clearly gate them as prototype-only: coach/agents, safety classifier, insights/weekly review, session packet generation, offline sync.
3. Add SQL-backed integration tests that run migrations and hit `server/db.js`, not only in-memory adapters.
4. Fix privacy/export/delete semantics before beta: remove the hard-coded 2026-05-05 deletion date, add complete privacy export coverage, define retention/deletion of safety/audit artifacts, and enforce recent-auth checks.
5. Add missing schema for support contacts, notifications/nudges, agent handoffs/tool traces, transcript artifacts, insight cards, scoped share tokens, and app lock/passcode metadata.

## Final Assessment

Backend/data is a strong walking skeleton and private-beta prototype, but it does not yet satisfy V1 as written. The capability ledger itself acknowledges several deterministic/local behaviors, and the code confirms that those placeholders are still present in core V1 areas.
