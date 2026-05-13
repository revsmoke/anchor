# Final QA Review: Anchor V1 Completion Implementation Plan

Date: 2026-05-12
Lane: final plan QA
Scope: `IMPLEMENTATION_PLAN.md` checked against `PRD.md`, `SPEC.md`, `CAPABILITY_LEDGER.md`, and the four lane reports:

- `review/agent-requirements-report.md`
- `review/agent-ui-pseudo-report.md`
- `review/agent-backend-report.md`
- `review/agent-qa-report.md`

No source code or implementation plan files were modified.

## Overall Verdict

`IMPLEMENTATION_PLAN.md` is a solid corrective plan and correctly identifies the central problem: Anchor is a broad runnable prototype whose dashboard/ledger overstate V1 completeness. The plan covers most P0/P1 gaps found by the lane reports, especially missing Today/Safety routes, deterministic AI/safety behavior, hard-coded dates, shallow export/delete/offline tests, and misleading dashboard statuses.

Do not begin execution until the required fixes below are incorporated into the plan. The issues are not implementation blockers in the codebase yet; they are plan-quality blockers that would otherwise let future work proceed in unsafe or non-vertical order.

## Required Fixes

### 1. Add a non-code launch-gate pass for clinical/legal/content decisions

Severity: P0

The plan lists many code gaps, but it does not clearly gate V1 completion on the non-code decisions that the requirements lane marks as launch-critical: clinical/legal safety copy review, retention policy, transcript policy, and therapist-sharing policy.

Evidence:

- Requirements lane calls out safety/privacy launch gates as not only code and says clinical/legal review remains open: `review/agent-requirements-report.md:69-73`.
- Requirements ambiguities include therapist sharing, retention policy, clinician review, diary defaults, and account mode: `review/agent-requirements-report.md:58-67`.
- Implementation plan only says to "Define clinical-review copy flags in the ledger" inside Safety Guardian: `IMPLEMENTATION_PLAN.md:148-152`.

Required plan change:

- Add an explicit "Clinical, Legal, Retention, and Sharing Decisions" gate before any pass can mark Safety, Privacy, Voice, Coach, or Session Sharing V1-complete.
- The gate should list decisions, owner, acceptance evidence, and how unresolved decisions are represented in UI/dashboard copy.

### 2. Make Pass 1 status tests label-aware instead of behavior-complete tests

Severity: P0

Pass 1 is supposed to restore truth in dashboard/ledger artifacts. It also proposes browser tests that download and inspect export artifacts. If those tests assert V1 export/delete behavior before export/privacy passes are implemented, Pass 1 becomes a disguised export implementation pass and breaks the vertical-slice intent.

Evidence:

- Pass 1 adds browser export-artifact inspection tests: `IMPLEMENTATION_PLAN.md:86-89`.
- The actual export/privacy fixes are scheduled later in Pass 8 and Pass 9: `IMPLEMENTATION_PLAN.md:208-241`.
- QA lane says current browser tests only check status text and download links, not artifact content or deletion persistence: `review/agent-qa-report.md:13-19`, `review/agent-qa-report.md:29-36`.

Required plan change:

- In Pass 1, tests should fail only when artifacts claim `done` for capabilities that are actually prototype/fixture/partial.
- Move full export body, redaction, delete persistence, and old-artifact invalidation assertions into Pass 8 and Pass 9 red tests.
- Pass 1 acceptance should be honest labeling plus importable dashboard artifacts, not completed export/privacy semantics.

### 3. Move diary target hierarchy before insights/session packets

Severity: P0

The plan currently puts Session Packet PDF/Sharing at Pass 8 and Diary Schema/Target Configuration at Pass 13. That sequencing conflicts with the PRD/SPEC requirement that insights, coaching, reviews, and session packets sort and label targets by DBT hierarchy.

Evidence:

- Requirements lane marks target hierarchy and default targets as required across reviews/coaching/session packets: `review/agent-requirements-report.md:28-35`.
- Pass 8 requires packet tests to verify hierarchy labels: `IMPLEMENTATION_PLAN.md:212-215`.
- Pass 13 later normalizes hierarchy labels in insights/export: `IMPLEMENTATION_PLAN.md:292-307`.
- Backend lane says exposed diary schema is narrower than V1 defaults: `review/agent-backend-report.md:258-260`.

Required plan change:

- Move Pass 13 earlier, before Derived Insights and Session Packet work.
- Alternative acceptable fix: fold target hierarchy/schema completion into Pass 7/8 as a prerequisite sub-slice, but do not leave hierarchy normalization until after packet/export work.

### 4. Add a Chain Analysis completion slice or explicitly fold it into session prep

Severity: P1

Chain Analysis is required V1 functionality, and the requirements lane flags gaps around start-from-diary linkage and intervention-point output. The implementation plan lists many gaps but does not create a dedicated corrective pass for chain analysis completeness.

Evidence:

- Requirements lane marks Chain Analysis as required, including start-from-diary, resumable flow, required sections, intervention points, alternative skills, and prevention plan: `review/agent-requirements-report.md:33`.
- Backend lane says AI/safety/insights/export/offline behavior includes deterministic prevention-plan behavior: `review/agent-backend-report.md:21-23`.
- Implementation plan has no Chain Analysis pass after the gap inventory.

Required plan change:

- Add a vertical slice for Chain Analysis completion, or explicitly fold it into Session Packet work with red tests for diary linkage, resume, intervention points, alternative skills, prevention plan, and exportable selected summaries.

### 5. Add dependency rules for parallel execution

Severity: P1

The plan says Passes 5-6 can run in parallel with Passes 7-10 if agents own disjoint files. File separation is not sufficient here because privacy export, session packets, transcript artifacts, agent handoffs, insights, and target hierarchy depend on the schemas and semantics introduced by earlier passes.

Evidence:

- Suggested execution allows Passes 5-6 in parallel with Passes 7-10: `IMPLEMENTATION_PLAN.md:343-349`.
- Backend lane lists missing shared entities including `agent_handoffs`, `transcript_artifacts`, `insight_cards`, therapist/share-token metadata, and notification data: `review/agent-backend-report.md:235-256`.
- Pass 9 privacy export must cover coach metadata, voice metadata, packets, and artifacts: `IMPLEMENTATION_PLAN.md:225-241`.

Required plan change:

- Add an explicit dependency table:
  - Safety Plan before Safety Guardian.
  - Safety Guardian before Text Coach and Voice.
  - Target hierarchy before Insights and Session Packets.
  - Text Coach/Voice/Session Packets before Complete Privacy Export/Delete.
  - Offline replay after Safety Guardian for safety-interrupted replay behavior.
- Permit parallel work only when downstream export/privacy/session-packet schemas are not being finalized independently.

### 6. Add PWA installability and offline app-shell verification

Severity: P2

The plan includes notification/offline work and service-worker cache-boundary checks, but it does not explicitly verify installable PWA behavior or offline app-shell reload/navigation. Those are V1 requirements in the product/spec lane.

Evidence:

- Requirements lane marks responsive installable PWA as required: `review/agent-requirements-report.md:19`.
- QA lane says service-worker tests do not prove app-shell navigation after reload or that API responses stay out of Cache Storage: `review/agent-qa-report.md:31-35`.
- Implementation plan mentions service-worker/API cache verification only in the gap inventory, not as a clear pass acceptance item: `IMPLEMENTATION_PLAN.md:51-58`.

Required plan change:

- Add PWA installability/app-shell verification to Pass 10, Pass 11, or Pass 14.
- Include Playwright checks for manifest link, service-worker registration, offline app-shell reload, no `/api/*` cache entries, and visible offline state.

### 7. Add measured fast-use acceptance

Severity: P2

The PRD/SPEC require under-30-second, 2-minute, and 10-minute use windows. The plan includes accessibility and fast-access QA but does not define measurable fast-use acceptance beyond two-tap access.

Evidence:

- Requirements lane lists fast-use windows as required: `review/agent-requirements-report.md:18`.
- Implementation Pass 14 measures low-stimulation and two-tap access, but not completion-window acceptance: `IMPLEMENTATION_PLAN.md:309-323`.

Required plan change:

- Add browser/test heuristics or manual QA scripts for fast-use windows:
  - Quick Check-In can be completed with minimal fields in under 30 seconds.
  - Diary can be completed with defaults in about 2 minutes.
  - Chain/session prep deeper flows remain coherent for 10-minute use.

## Non-Blocking Notes

- The implementation rules are good and should stay: vertical slices, red tests first, Playwright coverage, browser smoke, dashboard import validation, ledger update, and context history update.
- The plan correctly prioritizes truthful status first. That is the right first move as long as Pass 1 is kept to truthfulness and not allowed to become broad feature implementation.
- The current gap inventory is comprehensive for Today, Safety, Coach, Voice, Insights, Exports, Privacy, Offline, Notifications, Skills, Accessibility, Timezone/DST, and production readiness.

## Final Recommendation

Approve the plan only after the seven required fixes above are applied to `IMPLEMENTATION_PLAN.md`. The highest-risk corrections are the non-code safety/legal gate, label-aware Pass 1, hierarchy-before-export sequencing, and explicit dependency rules.
