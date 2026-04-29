# Pre-Task Verification: Anchor SPEC.md

## Source Files Reviewed

- `PRD.md` (`Draft v0.1`, dated 2026-04-22)
- `vertical-slice-dashboard.html`

## SPEC.md Requirements To Include

- Product boundary: Anchor is a DBT-centered daily structure companion, not therapy, diagnosis, crisis counseling, trauma exposure, medication guidance, or an EHR.
- Core loop: `plan -> act -> log -> reflect -> adjust`, centered on Morning/Midday/Evening anchors plus Anytime Rescue.
- V1 scope: onboarding, safety/consent, daily anchors, quick check-in, full diary card, text coach, live voice, skill library/exercises, chain analysis, day reset/minimum viable day, insights, weekly review, session prep export, safety plan, privacy settings.
- DBT data requirements: stable core diary schema, customizable optional/custom targets, DBT hierarchy ordering, stable analytics/export fields, therapist/session-prep packet constraints.
- AI architecture: visible specialist team using Agents SDK, Realtime API for browser voice, tool-level guards, tracing, clear handoff rules for Voice Coach and Safety Guardian.
- Safety: Normal/Elevated/Acute risk tiers, interruptive Safety Mode, 988/911 U.S. crisis guidance, safety event logging, crisis-boundary copy, clinically reviewed DBT/chain-analysis content before launch.
- Privacy/trust: explicit consent for sharing/audio/transcripts, no ad-based data use, export/delete controls, optional app lock, voice transcript retention defaults and deletion timelines.
- Platform/non-functional: responsive installable PWA, push with fallback, offline capture/sync for check-ins/diary/routines/chain drafts, under-2-tap primary actions, accessibility, low-stimulation mode, timezone/DST safety, audit logs.
- Screen states: every primary screen needs loading, first-use empty, returning, offline where relevant, error/recovery, and safety-interrupted states.

## Dashboard JSON Shape To Preserve

The vertical-slice dashboard persists/imports/exports normalized state under localStorage key `vsd-v2`:

```json
{
  "projectName": "string",
  "passes": [{ "name": "string", "note": "string" }],
  "layers": [{ "icon": "string", "name": "string", "tech": "string" }],
  "tasks": [[{ "description": "string", "subtasks": ["string"] }]],
  "statuses": [["todo | active | done"]]
}
```

Preserve these invariants:

- `tasks[layerIndex][passIndex]` and `statuses[layerIndex][passIndex]` align exactly with `layers` rows and `passes` columns.
- Status values are limited to `todo`, `active`, and `done`; invalid/missing statuses normalize to `todo`.
- Task values normalize from legacy strings into `{ description, subtasks: [] }`.
- Adding/deleting a pass mutates every task/status row; adding/deleting a layer mutates the layer row and matching task/status rows.
- Import validation currently requires `passes`, `layers`, `tasks`, and `statuses`; export writes the normalized shape.

## Ambiguities / Open Questions

- Whether V1 requires therapist-sharing from day one or can ship export-only.
- Whether accountless trial mode is allowed or secure account creation is mandatory before use.
- Exact final retention policy for transcripts, voice artifacts, and agent traces.
- Which diary fields are default versus customizable in V1.
- Required level/process of clinician review before launch.
- Whether calendar integration belongs in MVP or post-MVP.
- Whether streaks/rewards are included or replaced by softer reinforcement.
- The dashboard is generic SPA methodology content; SPEC.md should define Anchor-specific vertical slices while preserving the dashboard state schema.

## Risks

- Safety and privacy requirements are high-stakes; vague SPEC language could create product, legal, and clinical review gaps.
- AI/voice scope can sprawl unless SPEC.md separates orchestration, realtime voice, memory, retention, audit logging, and safety takeover behavior.
- Offline sync plus safety/audit logs need explicit conflict and data-retention rules.
- Custom diary fields can break analytics/session-prep unless the stable core schema and export mapping are treated as a hard contract.
- If SPEC.md mirrors the generic dashboard example too literally, it may plan CRUD passes instead of Anchor-specific vertical slices.
