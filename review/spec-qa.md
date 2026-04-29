# SPEC.md QA Review: Anchor

## Recommendation

**Fail / revise before implementation.** `SPEC.md` is directionally strong and preserves the requested HTML/CSS/vanilla JS + Bun + PostgreSQL stack, vertical-slice posture, Realtime secret boundary, and major safety/privacy flows. The remaining gaps are not conceptual blockers, but they are concrete enough to cause multi-agent implementation drift.

## Findings By Severity

### P1 - API contract is route-listed, not implementation-ready

`SPEC.md` defines only the generic response envelope and route list (`SPEC.md:468-529`). It does not define per-route request payloads, response `data` shapes, validation errors, auth/consent requirements, side effects, or audit/safety events. This is especially risky for `POST /api/check-ins`, `PUT /api/diary/:date`, `POST /api/coach/messages`, `POST /api/voice/client-secret`, `POST /api/sync/offline-queue`, and privacy deletion/export routes.

**Suggested edit:** Add a route contract table by slice with method, request body, response body, validation rules, auth/consent preconditions, safety gate behavior, and test fixtures.

### P1 - Dashboard JSON contract lacks a complete Anchor seed state

`SPEC.md` correctly identifies the `vsd-v2` localStorage key and normalized shape (`SPEC.md:266-317`), then lists Anchor layers and pass names (`SPEC.md:319-351`). It does not provide the complete importable JSON matrix for 14 passes x 6 layers, including task descriptions, subtasks, and initial statuses. The actual dashboard still ships with a generic SPA default state (`vertical-slice-dashboard.html:684-739`), so implementers need a complete Anchor import/export artifact or appendix to avoid starting from the wrong board.

**Suggested edit:** Add a complete `Anchor` dashboard JSON appendix with all passes, all six layers, concrete task/subtask cells, and initial statuses set to `todo`.

### P2 - DBT target defaults from the PRD were partially dropped

`SPEC.md` keeps the hierarchy names and ordering (`SPEC.md:457-466`) but omits the PRD's default v1 mapping and enabled target list (`PRD.md:280-291`), including skipped therapy, skipped diary cards, repeated skipped anchors, dissociation/shutdown, and the exact life-threatening target split. Without this, seed data, diary behavior fields, safety sorting, and clinician summaries can diverge.

**Suggested edit:** Add the PRD default target mapping and enabled target list as required seed/configuration data.

### P2 - Several PRD non-functional requirements are not carried into acceptance criteria

The PRD requires captions or transcript visibility for voice sessions, low-stimulation mode, optional calendar events/import, and privacy/passcode settings (`PRD.md:209-214`, `PRD.md:652-659`, `PRD.md:707-710`, `PRD.md:1090-1101`, `PRD.md:1119`). `SPEC.md` covers passcode only as a user control (`SPEC.md:635-642`), leaves calendar as an open decision (`SPEC.md:721`), and does not add low-stimulation or voice-caption/transcript checks to slice acceptance.

**Suggested edit:** Either explicitly defer each item with rationale or add screen states, data model/API support, and acceptance checks for the affected slices.

## Missing Requirements

- Per-route request/response schemas and authorization/safety side effects.
- Complete importable Anchor dashboard JSON state.
- Default behavior-target seed mapping and enabled target list.
- Low-stimulation mode acceptance criteria.
- Voice session captions/transcript visibility acceptance criteria.
- Calendar event/import scope decision and corresponding model/API if in V1.

## Passes

- Requested stack is preserved: HTML5/CSS/vanilla JS frontend; Bun/JavaScript/PostgreSQL backend.
- Vertical-slice rules align with walking skeleton methodology and include TDD/browser-test requirements.
- Safety tiers, elevated/acute flows, transcript defaults, Realtime ephemeral-secret boundary, redaction, deletion, and clinician/legal review gates are substantially covered.
- Pass 0 is appropriately narrow and avoids full-schema scaffolding before browser verification.
