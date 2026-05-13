# V1/Core Requirements Extraction Report

Scope: `PRD.md`, `SPEC.md`, and `CAPABILITY_LEDGER.md` only. I did not inspect source implementation. Implementation-risk notes are therefore ledger-derived, not a code audit.

## Classification Key

- Required: V1/core requirement or non-negotiable implementation constraint.
- Optional/deferred: explicitly optional, V1.1/next, out of scope, or opt-in.
- Ambiguous: explicitly unresolved or internally unclear.

## Required V1/Core Requirements

| ID | Requirement | Classification | Evidence | Ledger-derived implementation note |
| --- | --- | --- | --- | --- |
| R01 | Preserve product boundary: DBT practice support, not therapy, diagnosis, medication guidance, trauma exposure, or emergency care. | Required | `PRD.md:47`, `PRD.md:137-140`, `SPEC.md:22`, `SPEC.md:55-63` | Ledger shows safety/consent shell and crisis resources, but clinical/legal copy review remains a non-code gate (`CAPABILITY_LEDGER.md:330-332`). |
| R02 | Safety escalation must interrupt normal coaching for elevated/acute risk, surface 988/911, avoid self-harm instructions, and log safety events. | Required | `PRD.md:426-459`, `SPEC.md:962-986` | Partial risk: deterministic/local safety classification is repeatedly noted; full clinical review remains open (`CAPABILITY_LEDGER.md:124`, `CAPABILITY_LEDGER.md:230`, `CAPABILITY_LEDGER.md:330-332`). |
| R03 | Safety plan must provide persistent crisis/support screen, support contacts, rapid crisis resources, and full safety-plan route/update support. | Required | `PRD.md:362-371`, `SPEC.md:743-745` | Likely partial: ledger confirms `safety_plans` table and crisis actions, but does not clearly claim complete safety-plan editing/support-contact UI or `GET/PUT /api/safety-plan` delivery. |
| R04 | App must support fast use windows: Quick Check-In under 30 seconds, diary under about 2 minutes, and 10-minute deeper flows. | Required | `PRD.md:90-91`, `PRD.md:235-238`, `SPEC.md:25`, `SPEC.md:42-43` | Ledger claims check-in/diary browser coverage but timing appears observational/manual, not a strict measured acceptance gate. |
| R05 | Responsive installable PWA with mobile-first UI and desktop support. | Required | `PRD.md:642`, `SPEC.md:37`, `SPEC.md:65-84`, `SPEC.md:1097-1099` | Ledger claims manifest/service worker and registration; supported-mobile install verification is not clearly evidenced (`CAPABILITY_LEDGER.md:310-313`, `CAPABILITY_LEDGER.md:323-326`). |
| R06 | Frontend stack must be HTML5, CSS, Vanilla JS modules with no frontend framework/build requirement for initial slices. | Required | `SPEC.md:7`, `SPEC.md:67-74` | Ledger aligns. |
| R07 | Backend stack must be Bun, JavaScript, PostgreSQL, migrations, and server-side OpenAI calls only. | Required | `SPEC.md:8`, `SPEC.md:76-84` | Ledger aligns; production secrets/provisioning remain outside code (`CAPABILITY_LEDGER.md:330-332`). |
| R08 | Development must follow walking-skeleton/vertical-slice method, failing tests first, browser tests, dashboard, and capability ledger updates. | Required | `SPEC.md:232-264`, `SPEC.md:495-509`, `SPEC.md:1051-1065` | Ledger is present and detailed, but it also records grouped final slices, which makes pass-by-pass evidence less granular for Pass 8-13. |
| R09 | Vertical slice dashboard must support `vsd-v2` JSON import/export, invariant validation, pass/layer add/delete updates, and done-state semantics. | Required | `SPEC.md:266-317` | Ledger claims dashboard artifacts through hardening; validation depth not source-audited. |
| R10 | User must create account or use guided anonymous trial shell; onboarding must include safety/consent and collect timezone, routine, goals, struggles, therapist status, preferred times, and calendar permission. | Required plus ambiguous auth mode | `PRD.md:511-524`, `SPEC.md:38-39`, `SPEC.md:717-724`, `SPEC.md:1083-1084` | Ledger claims account creation, consent, onboarding, routines; anonymous trial remains an open business decision. |
| R11 | Today command center must represent morning/midday/evening anchors, must-do commitments, next best step, optional calendar events, and next relevant skill. | Required | `PRD.md:203-220`, `PRD.md:526-531`, `SPEC.md:40-41`, `SPEC.md:725-727` | Ledger claims Today, focus plan, Midday, reset; optional calendar sync is deferred/open. |
| R12 | Day reset/minimum viable day must reduce plan, preserve history, handle missed morning non-shamingly, and keep the day recoverable. | Required | `PRD.md:528-531`, `PRD.md:605-615`, `SPEC.md:47`, `SPEC.md:727` | Ledger claims complete. |
| R13 | Quick Check-In must persist timestamp, emotion 0-5, urge 0-5, energy, anchor context, suggested action status, optional note/location, safety gate, and next action. | Required, with optional fields | `PRD.md:242-251`, `SPEC.md:555-570`, `SPEC.md:752-772` | Ledger claims Morning and Midday check-ins. |
| R14 | Full Diary Card must persist stable required fields, optional first-party fields, custom targets, completion states, and safety review triggers. | Required, with optional fields | `PRD.md:252-270`, `SPEC.md:571-595`, `SPEC.md:774-821` | Ledger claims diary persistence. Custom target UX/schema flexibility is not clearly evidenced beyond defaults. |
| R15 | All urges/behaviors must map to DBT target hierarchy and default V1 targets; reviews/coaching/session packets must sort and label by hierarchy. | Required | `PRD.md:272-305`, `SPEC.md:597-643` | Ledger claims seeded behavior targets; downstream sorting/labels across every surface are not source-audited. |
| R16 | Skill library must cover four DBT modules, practical instructions, direct browse/recommended/problem entry points, favorites, recent, recommended skills, guided exercises, timers/voice optionality, and helpfulness evidence. | Required, with optional voice in exercises | `PRD.md:307-320`, `PRD.md:547-556`, `PRD.md:1168-1171`, `SPEC.md:731-733` | Likely partial: ledger confirms browse/search/detail/exercise/helpfulness/recent and only three seed skills; favorites and recommendation quality are not clearly claimed (`CAPABILITY_LEDGER.md:193-204`). |
| R17 | Text coach must support planning, skill help, reflection, rescue; use specialist orchestration; recommend skills from state; keep replies action-ended and concise in distress. | Required | `PRD.md:540-545`, `PRD.md:421-424`, `SPEC.md:823-863`, `SPEC.md:949-958` | Likely partial: ledger says deterministic local replies and no OpenAI call for text coach (`CAPABILITY_LEDGER.md:220-230`). |
| R18 | Live voice must use browser Realtime path/server-minted short-lived secrets, never expose primary API key, include captions/transcript preview, mute/reconnect/end controls, and not simulate crisis therapy. | Required | `PRD.md:337-348`, `SPEC.md:737-738`, `SPEC.md:865-871`, `SPEC.md:960`, `SPEC.md:1060` | Partial/production risk: later ledger claims live OpenAI test success, but production networking/secrets remain opt-in/provisioning-dependent (`CAPABILITY_LEDGER.md:298-302`, `CAPABILITY_LEDGER.md:334-353`). |
| R19 | Chain analysis must be structured, start from diary or scratch, be resumable, capture all required sections, and produce intervention points, alternative skills, and prevention plan. | Required | `PRD.md:322-335`, `PRD.md:558-565`, `SPEC.md:735-736` | Ledger claims create/patch and completion forms; start-from-diary linkage and intervention-point output are not clearly detailed. |
| R20 | Insights and weekly review must provide daily/weekly summaries, patterns by emotion/urge/behavior/skill/structure, structure score, trend series, recommendations, and hierarchy ordering. | Required | `PRD.md:567-571`, `SPEC.md:739-740`, `SPEC.md:606`, `SPEC.md:1095-1103` | Likely partial: ledger says deterministic synthesis and chart-free trend rendering, while PRD asks visual trends/charts over day/week/month (`CAPABILITY_LEDGER.md:259-262`). |
| R21 | Session prep must generate weekly/appointment summary, redaction, PDF export and share link/artifact, and use only stable fields plus selected chain-analysis summaries. | Required, with therapist portal deferred | `PRD.md:350-360`, `PRD.md:631-638`, `PRD.md:1195-1209`, `SPEC.md:741-742`, `SPEC.md:1102` | Likely partial: ledger hardening claims authenticated JSON artifacts/downloads, not PDF; scoped share-link behavior is not clearly complete (`CAPABILITY_LEDGER.md:263-266`, `CAPABILITY_LEDGER.md:303-306`). |
| R22 | Privacy/trust must include transparent retention, export/delete, no ad data use, therapist/audio/transcript consent, transcript defaults, Do Not Save, and deletion within 30 days. | Required, with optional transcript saving | `PRD.md:461-484`, `SPEC.md:988-1008` | Ledger claims privacy export/delete execution and voice retention flags; optional local app lock/passcode is not clearly claimed. |
| R23 | Notifications must support anchor reminders, missed-check-in recovery, therapy-day reminders, weekly review prompts, quiet hours, intensity controls, non-shaming copy, push, and fallback reminders/email if enabled. | Required, with email fallback optional | `PRD.md:573-581`, `PRD.md:642-644`, `SPEC.md:1025-1039` | Likely partial: ledger claims notification opt-in/quiet hours, but not real push delivery or email fallback (`CAPABILITY_LEDGER.md:271-274`). |
| R24 | Offline capture/sync must support quick check-ins, diary entries, routine completion, chain-analysis drafts, idempotent sync, conflict review, and safety resources while offline. | Required | `PRD.md:645-650`, `SPEC.md:1011-1023` | Partial risk: ledger claims offline queue/sync and generated mutation support, but full entity-specific conflict behavior and all required offline capture flows are not clearly proven (`CAPABILITY_LEDGER.md:271-274`, `CAPABILITY_LEDGER.md:310-313`). |
| R25 | Accessibility must cover screen readers, contrast, keyboard navigation, reduced motion, voice captions/transcript visibility, and low-stimulation mode. | Required | `PRD.md:651-658`, `SPEC.md:86-92`, `SPEC.md:896-902`, `SPEC.md:1058-1060` | Likely partial: ledger mentions reduced motion in styling but does not clearly claim low-stimulation mode or comprehensive a11y smoke evidence for every slice. |
| R26 | Primary navigation/actions must expose Today, Coach, Skills, Insights, Me, plus persistent Mic, Check-In, Help Now under two taps. | Required | `PRD.md:486-505`, `SPEC.md:896-900`, `SPEC.md:1097-1099` | Ledger claims authenticated shell/nav and guided routes; under-two-taps acceptance not clearly measured. |
| R27 | Every primary screen must define loading, first-use empty, returning, offline, error, and safety-interrupted states where relevant. | Required | `PRD.md:662-679`, `SPEC.md:31`, `SPEC.md:905-910` | Likely partial: ledger gives route-level/browser smoke evidence but not an explicit complete state matrix for every primary screen. |
| R28 | Security must include password hashing, secure HTTP-only cookies in production, CSRF for cookie mutations, parameterized SQL, request IDs, and redacted sensitive logs. | Required | `SPEC.md:1041-1049` | Ledger claims Argon2, secure cookies, CSRF, request IDs, redacted audit events; parameter binding not source-audited (`CAPABILITY_LEDGER.md:72-73`, `CAPABILITY_LEDGER.md:293-316`). |
| R29 | Audit/observability must log agent runs, handoffs, tool calls, safety interruptions, share events, request IDs, and redacted traces. | Required | `PRD.md:659-660`, `SPEC.md:534-538`, `SPEC.md:861-863`, `SPEC.md:956-958` | Partial risk: ledger records `agent_runs`, `coach_messages`, and audit events, but deterministic/local coach means true tool-call/handoff coverage may be thin. |
| R30 | Time-sensitive behavior must be timezone aware and daylight-saving safe. | Required | `PRD.md:660`, `SPEC.md:30`, `SPEC.md:404` | Ledger claims timezone round-trip in onboarding only; full DST-safe scheduling is not clearly proven. |

## Optional, Deferred, or Out-of-Scope Requirements

| ID | Requirement | Classification | Evidence | Note |
| --- | --- | --- | --- | --- |
| O01 | Sleep, medication, diary notes, check-in location, and transcript saving are optional/opt-in fields. | Optional | `PRD.md:249-264`, `PRD.md:473-481`, `SPEC.md:566-589`, `SPEC.md:1004-1005` | Must not break stable analytics/export. |
| O02 | Calendar events are optional V1 inputs; external calendar sync/refinement is open/deferred. | Optional/deferred/ambiguous | `PRD.md:211-214`, `PRD.md:1212-1216`, `SPEC.md:903`, `SPEC.md:1088` | Do not treat external sync as required without explicit decision. |
| O03 | Therapist EHR, billing, full clinician portal, advanced clinician workflows, and therapist portal are not V1. | Deferred/out of scope | `PRD.md:55-62`, `PRD.md:1212-1219`, `SPEC.md:55-63` | Export/share artifact remains V1. |
| O04 | Public social features, wearable integrations, advanced localization, diagnosis/treatment claims, medication advice, and trauma exposure workflows are out of V1. | Deferred/out of scope | `PRD.md:55-62`, `SPEC.md:55-63` | Boundaries are core safety requirements. |
| O05 | Optional local app lock/passcode is a privacy control but not clearly required for minimum V1 launch. | Optional/ambiguous | `PRD.md:465`, `SPEC.md:1007` | Ledger does not clearly claim it. |
| O06 | Email fallback for reminders is optional if enabled. | Optional | `PRD.md:644`, `SPEC.md:1038` | Push/in-app reminders remain required. |
| O07 | Streaks/rewards are undecided and should not be silently added to V1. | Ambiguous/deferred | `PRD.md:1229`, `SPEC.md:1089` | Use softer reinforcement unless decided. |

## Explicit Ambiguities / Open Decisions

| ID | Ambiguity | Evidence | Impact |
| --- | --- | --- | --- |
| A01 | Accountless anonymous trial vs secure account-first. | `PRD.md:511`, `PRD.md:1224`, `SPEC.md:38`, `SPEC.md:1084` | Affects auth, consent, persistence, and onboarding. |
| A02 | Therapist sharing required on day one vs export-only acceptable. | `PRD.md:1223`, `SPEC.md:1083` | Affects scoped share-token routes, consent, audit, and session-packet UX. |
| A03 | Final legal retention policy for transcripts, traces, and deletion. | `PRD.md:1225`, `SPEC.md:1085` | SPEC has defaults, but final legal policy can change storage/deletion behavior. |
| A04 | Clinician review process for DBT content and chain-analysis prompts. | `PRD.md:434`, `PRD.md:1227`, `SPEC.md:1087` | Launch blocker outside pure engineering. |
| A05 | Exact diary defaults vs configurable defaults. | `PRD.md:1226`, `SPEC.md:1086` | SPEC defines many defaults, but still preserves this as a decision. |
| A06 | Calendar integration scope. | `PRD.md:1228`, `SPEC.md:903`, `SPEC.md:1088` | Data model readiness is not external sync approval. |

## Top Likely Missing or Partial Areas

1. Production-grade AI/agent behavior is not fully demonstrated by the ledger. Text coach is claimed as deterministic/local with no OpenAI call, while the product promises specialized AI agent orchestration and state-based skill recommendations.
2. Session prep export/share appears short of PRD wording. Ledger hardening names authenticated JSON artifacts/downloads, while PRD requires PDF export and share link with stable-field-only content and redaction.
3. Safety/privacy launch gates are not only code. The ledger explicitly leaves clinical/legal review and deployment environment provisioning as remaining gates; safety-plan editing/support contacts and local app lock are also not clearly claimed.

## Secondary Risk List

- Real push notifications and email fallback are not clearly implemented.
- Offline sync is claimed, but all required entity capture and conflict-resolution behavior are not clearly evidenced.
- Low-stimulation mode and full accessibility state coverage are not clearly evidenced.
- Visual trends/charts over day/week/month are only partly reflected by chart-free deterministic insights.
- Favorites/recommended skills and high-quality skill matching are not clearly evidenced.
