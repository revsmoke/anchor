# PRD QA Review

## Findings

- P1 `transcript/voice retention is undefined`: The PRD says transcripts and voice artifacts need explicit consent and "clear retention rules" and also calls for transparent retention settings, but it never defines default retention, deletion behavior, or whether transcripts exist at all without opt-in (`PRD.md:339-375`). `SPEC.md` cannot safely define storage, consent UX, or data deletion without that policy.

- P1 `diary-card schema is too underspecified for analytics and export`: The PRD says diary fields are "customizable but clinically guided" and that the app must chart trends and generate clinician-ready summaries, but it does not define the default diary-card fields, required scales, target-hierarchy mapping, or which fields are needed for `Quick Check-In` vs `Full Diary Card` (`PRD.md:216-229`, `PRD.md:426-431`, `PRD.md:900-916`). That leaves the core data model ambiguous and will block the spec for tracking, charts, and exports.

- P2 `high-risk safety routing is not concrete enough`: Safety boundaries state that normal coaching must stop for imminent intent, a current attempt, or inability to stay safe, but the PRD does not define the intermediate-risk path, the exact takeover state for `Safety Guardian`, or the user-facing flow back out of rescue mode (`PRD.md:289-296`, `PRD.md:353-367`, `PRD.md:920-930`). The SPEC needs those branches spelled out to avoid unsafe or inconsistent escalation behavior.

## Addendum

- Transcript retention: still open.
- Diary-card schema precision: partially resolved.
- Intermediate-risk safety flow: partially resolved.

## Second Addendum

- Transcript retention: resolved.
- Diary-card schema precision: partially resolved.
- Intermediate-risk safety flow: resolved.
Final diary-card schema status: resolved.
