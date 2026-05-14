## Anchor SPEC Creation - 2026-04-24 13:11 EDT

### Phase
documentation

### Summary
Created an implementation-ready `SPEC.md` for Anchor from `PRD.md`, the `vertical-slice-dev` methodology, and `vertical-slice-dashboard.html`. The spec pins the requested HTML5/CSS/vanilla JavaScript frontend and Bun/JavaScript/PostgreSQL backend, defines vertical-slice execution rules, and includes an importable dashboard seed for agent coordination.

### Files Created/Modified

| File | Purpose |
| --- | --- |
| `SPEC.md` | Detailed technical specification, architecture, API contracts, data model, safety/privacy rules, and dashboard seed JSON. |
| `PLAN.md` | Resumable execution checklist for this documentation task. |
| `review/pretask-spec-verification.md` | Delegated pre-task verification report. |
| `review/spec-qa.md` | Delegated QA report that identified required revisions. |
| `review/spec-qa-PLAN.md` | Delegated QA checklist. |
| `context_history/context_index.md` | Index entry for this session. |
| `context_history/contexts/2026-04-24_anchor-spec-creation.md` | This context summary. |

### Key Decisions

- Kept the spec implementation-oriented rather than duplicating the PRD: it focuses on stack, architecture, route contracts, data contracts, vertical slices, and acceptance gates.
- Preserved PRD open questions as explicit implementation decisions rather than silently resolving therapist sharing, accountless trial, final retention policy, calendar MVP scope, or rewards.
- Required a complete vertical-slice dashboard seed using the existing dashboard JSON shape so agents do not start from the generic CRUD example.
- Used server-created Realtime client secrets for browser voice so the main OpenAI API key remains server-side.

### Technical Details

- Added a 14-pass by 6-layer importable dashboard JSON seed in `SPEC.md`.
- Added route contracts with preconditions, request/response expectations, side effects, and audit/safety behavior.
- Added high-risk payload schemas for check-ins, diary cards, coach messages, voice client secrets, and offline sync.
- Added the PRD default DBT target hierarchy mapping and enabled target list.
- Added acceptance criteria for low-stimulation mode, captions/transcript preview for voice, and offline/PWA behavior.

### Testing/Verification

- Read `PRD.md`, `vertical-slice-dashboard.html`, and `vertical-slice-dev` guidance.
- Queried NotebookLM project memory for prior decisions, risks, and next actions.
- Delegated pre-task verification and QA review to subagents.
- Parsed the dashboard seed JSON from `SPEC.md` with Node and validated it as 6 layers x 14 passes with valid status values.
- Verified current OpenAI official documentation for Agents SDK/Realtimes browser voice and client-secret boundary before finalizing voice constraints.

### State
completed

### Next Steps

- Decide PRD open questions before implementation changes that affect scope or data model.
- Import the dashboard seed from `SPEC.md` into `vertical-slice-dashboard.html` before coding begins.
- Begin implementation with Pass 0 Walking Skeleton only: one HTML page, one fetch, one Bun route, one PostgreSQL table, one seed row, and browser verification.
- Obtain clinician/legal review before launch for safety language, DBT content, diary schema, chain-analysis prompts, retention, sharing, and deletion behavior.

### Related Files

- `PRD.md`
- `SPEC.md`
- `vertical-slice-dashboard.html`
- `review/spec-qa.md`
- `review/pretask-spec-verification.md`
