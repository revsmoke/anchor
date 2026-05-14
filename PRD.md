# PRD: Anchor

- Status: Draft v0.1
- Date: 2026-04-22
- Product type: Web-first, installable daily-use DBT companion
- Primary form factor: Mobile-first responsive web app with desktop web support
- Foundation for: `SPEC.md`

## 1. Product Summary

Anchor is a DBT-centered daily structure application that helps a user build a stable day, stay connected to skills in real time, and turn emotional overwhelm into the next actionable step. The product is not a replacement for therapy, crisis care, diagnosis, or medication management. Its job is to make DBT usable in ordinary life all day long.

Anchor combines:

- clinician-grade daily structure and diary-card workflows
- an installable web app that is fast enough for repeated daily use
- a team of specialized AI agents coordinated with the OpenAI Agents SDK
- live voice support for in-the-moment coaching
- safe escalation boundaries and clinician-ready summaries

The product position is intentionally between three weak market categories:

- DBT apps that are clinically useful but dry
- habit apps that are engaging but not clinically deep
- AI companions that are warm but under-structured

Anchor should feel like the best parts of a DBT diary card, a daily planner, a supportive coach, and a session-prep assistant in one product.

## Research Inputs

This PRD is grounded in the repo research memos created during this session:

- [research/dbt-clinical.md](research/dbt-clinical.md)
- [research/competitive-landscape.md](research/competitive-landscape.md)
- [research/openai-architecture.md](research/openai-architecture.md)

## 2. Problem

People trying to use DBT in real life face five recurring problems:

1. They know the skills in theory but cannot retrieve the right one fast enough in the moment.
2. They struggle to maintain a stable daily structure across mornings, transitions, disruptions, and evenings.
3. Paper diary cards and binders are hard to carry, easy to skip, and difficult to turn into action.
4. Generic journaling creates data but not decision-making.
5. Existing AI mental health products often sound helpful while failing to respect clinical boundaries, risk, and behavior-change structure.

The product must solve those problems without pretending to be therapy.

## 3. Opportunity

Research supports a product strategy built around:

- DBT diary cards, behavior targets, chain analysis, and between-session skills practice
- warm but disciplined daily-use design borrowed from high-retention habit apps
- voice-guided support for immediate coaching moments
- explicit safety boundaries and clinician-sharing support

The clearest opportunity is not “AI therapist.” It is “DBT operating system for everyday life.”

## 4. Product Goal

The number one goal is to help the user create and maintain a good daily structure.

That primary goal breaks down into five product outcomes:

1. Help the user start, reset, and close each day with structure.
2. Help the user record what happened in a way that is useful for DBT.
3. Help the user choose and practice the next skill fast.
4. Help the user recover after derailment instead of abandoning the day.
5. Help the user arrive at therapy, coaching, or self-review with clear patterns and priorities.

## 5. Non-Goals

Anchor will not:

- diagnose mental health conditions
- claim to replace a DBT therapist or comprehensive DBT program
- provide crisis counseling
- perform trauma exposure work
- provide medication guidance
- provide a public social feed or peer forum in v1
- create a full therapist EHR or billing product in v1

## 6. Product Principles

1. Structure before insight.
2. The next step matters more than a long explanation.
3. Logging must lead to action.
4. The app should feel warm, private, and credible, not cute or clinical in a sterile way.
5. Safety boundaries must be explicit, interruptive, and auditable.
6. AI agents should be specialized and observable, not blended into one vague assistant.
7. The user should be able to use the product in under 30 seconds, 2 minutes, or 10 minutes depending on the moment.

## 7. Target Users

### Primary Persona: User in DBT or DBT-informed therapy

- Already working on emotion regulation, distress tolerance, or self-destructive patterns
- Needs a daily structure companion between sessions
- Wants diary cards, skill prompts, and session prep
- May benefit from therapist sharing

### Secondary Persona: Self-directed user seeking DBT structure

- Not currently in DBT but actively seeking a structured emotional-regulation system
- Wants routines, coaching, and guided reflection
- Needs strong boundaries that the app is educational and supportive, not treatment

### Tertiary Persona: Therapist or coach receiving summaries

- Wants concise, session-ready insight
- Needs optional data sharing, not another heavy portal
- Benefits from diary-card trends, top targets, skipped days, and chain-analysis summaries

## 8. Jobs To Be Done

- When I wake up, help me start the day with a simple structure instead of drift.
- When my day gets disrupted, help me recover without collapsing the rest of the day.
- When I feel a spike in emotion or urge, help me get to the right skill immediately.
- When I go to therapy, help me show what happened this week without recreating it from memory.
- When I feel ashamed for falling off, help me restart with compassion and precision.

## 9. Product Positioning

Working title: `Anchor`

Promise: “A DBT-based daily structure companion that helps you plan your day, use skills in real life, and recover quickly when things go sideways.”

Anchor should borrow:

- the warm retention design of Finch
- the daily routine promise of Fabulous
- the structured diary-card rigor of DBT Diary Card
- the guided audio clarity of Headspace and Calm
- the bounded AI support posture of Wysa and similar coaching products

Anchor must avoid:

- toy-like gamification that trivializes serious distress
- subscription complexity that reduces trust
- long-form AI chat without action structure
- unbounded “therapy-like” claims

## 10. Success Metrics

### Primary Metrics

- 7-day activation: percentage of new users who complete onboarding and 3 daily anchors within their first 7 days
- Daily structure adherence: percentage of active users completing at least 2 of 3 anchors on 4 or more days per week
- Diary consistency: percentage of active users completing a diary entry on 5 or more days per week
- Distress intervention rate: percentage of “help now” moments that result in a skill action within 2 minutes

### Secondary Metrics

- Weekly retention
- Average number of day resets completed after disruption
- Session-prep packet generation rate
- Voice session completion rate
- Safety escalation accuracy and latency
- User-reported usefulness of the recommended skill

### Quality Metrics

- agent handoff success rate
- tool success rate
- voice turn latency
- false-positive safety interruptions
- clinician share delivery success

## 11. Core Experience

Anchor’s daily loop is built around three anchors plus anytime rescue.

### Morning Anchor

- quick emotional check-in
- top priority for the day
- one commitment to structure
- one coping-ahead recommendation

### Midday Anchor

- “How is the day actually going?”
- continue, reduce, or reset plan
- recommend one regulating action

### Evening Anchor

- diary-card closeout
- what worked / what didn’t
- top pattern from the day
- prepare tomorrow’s starting point

### Anytime Rescue

- one-tap “I need help now”
- voice or text coaching
- immediate skill routing
- safety escalation if needed

## 12. Core Product Features

### 12.1 Daily Structure Engine

The app’s primary behavior loop is not content consumption. It is:

`plan -> act -> log -> reflect -> adjust`

The user’s day is represented as:

- three daily anchors
- a short list of must-do commitments
- optional calendar events
- one “next best step” at any given time

The app must always answer:

- What matters right now?
- What is the smallest next action?
- What skill is most relevant if I’m dysregulated?

### 12.2 DBT Diary Card System

The diary-card system must support:

- emotion intensity logging
- urge tracking
- problem behavior tracking
- skill use tracking
- sleep and medication adherence as optional fields
- notes for prompting events or wins
- visual trends over time
- therapist-friendly export

The diary-card system must support both:

- a `Quick Check-In` flow under 30 seconds
- a `Full Diary Card` flow for end-of-day completion

Default diary-card schema for v1:

- `Quick Check-In` required fields:
  - timestamp
  - primary emotion `0-5`
  - primary urge `0-5`
  - energy state `low / medium / high`
  - anchor context `morning / midday / evening / anytime`
  - suggested next action accepted, dismissed, or deferred
- `Quick Check-In` optional fields:
  - one-sentence note
  - current location context `home / work / school / commute / social / other`
- `Full Diary Card` required fields:
  - date
  - anchor completion state for morning, midday, evening
  - emotion ratings `0-5` for anxiety/fear, sadness, anger, shame, guilt, numbness, joy/calm
  - urge ratings `0-5` for self-harm, suicidality, substance use, binge/restrict/purge, isolate/avoid, quit/give-up, lash out
  - target behavior occurrence for each enabled target `none / urge only / action occurred`
  - which skills were used
  - overall day difficulty `0-5`
- `Full Diary Card` optional but first-party supported fields:
  - sleep duration / sleep quality
  - medication adherence
  - free-text notes
  - custom target fields defined with clinician or user setup

Diary-card customization rule:

- the user may hide optional fields and add a limited number of custom targets
- the default v1 analytics and clinician exports must always rely on a stable core schema
- custom fields must never break the charts, weekly review, or session packet

Target-hierarchy mapping rule:

- every tracked urge and behavior must map to one of four DBT hierarchy levels:
  - `life-threatening`
  - `therapy-interfering`
  - `quality-of-life-interfering`
  - `skills/generalization`
- clinician summaries, weekly reviews, and coaching recommendations must sort targets in that order
- the default v1 hierarchy mapping is:
  - self-harm, suicidality -> `life-threatening`
  - skipped therapy, skipped diary card for 3+ days, repeated anchor avoidance -> `therapy-interfering`
  - substance use, binge/restrict/purge, isolate/avoid, lash out, quit/give-up -> `quality-of-life-interfering`
  - skill use, anchor completion, repair actions -> `skills/generalization`

Default enabled target list for v1:

- `life-threatening`: self-harm urge, self-harm action, suicidality urge, suicidality plan/action
- `therapy-interfering`: skipped therapy, skipped diary card, repeated skipped anchors
- `quality-of-life-interfering`: substance use, binge/restrict/purge, isolate/avoid, lash out, dissociation/shutdown
- `skills/generalization`: used skill, completed anchor, completed repair action

Stable analytics and export fields for v1:

- date
- structure adherence score
- emotion ratings
- urge ratings
- target behavior occurrence values
- skills used
- sleep and medication adherence if enabled
- top free-text note excerpt
- chain-analysis references created that day

Session-prep and clinician-share packets in v1 must be generated only from those stable fields plus explicitly selected chain-analysis summaries.

### 12.3 Skill Coaching

Skill coaching must be action-oriented and organized by the four DBT modules:

- mindfulness
- distress tolerance
- emotion regulation
- interpersonal effectiveness

The app must support three entry points:

- browse skills directly
- receive a recommended skill from the coach
- start from a specific problem such as panic, anger, urge, shutdown, conflict, or avoidance

### 12.4 Chain Analysis

The app must support a guided chain-analysis flow for events that matter. It must capture:

- prompting event
- vulnerability factors
- links in the chain
- target behavior
- short-term consequences
- long-term consequences
- skillful alternatives
- prevention plan for next time

The feature must feel structured, not like open-ended journaling.

### 12.5 Live Voice Coaching

The app must support live voice interaction for in-the-moment coaching using the Realtime API path recommended by OpenAI for browser voice agents.

Voice must be used for:

- emotional overwhelm
- walking the user through a skill
- helping the user reset their plan while moving
- de-escalation into a concrete next action

Voice must not be used to simulate crisis therapy or long psychotherapy sessions.

### 12.6 Session Prep

The app must generate a concise weekly or appointment-specific summary containing:

- diary-card trends
- most intense emotions
- top urges and behaviors
- missed anchors
- skills used
- top chain analysis summaries
- questions or topics to bring to session

### 12.7 Safety Plan and Escalation

The app must include:

- a persistent crisis/safety plan screen
- emergency contacts and supports
- rapid access to crisis resources
- strong interruption logic when the user indicates imminent self-harm risk or emergency danger

When risk is elevated, the app must stop acting like a normal coach and switch into safety routing.

## 13. AI Agent System

Anchor uses one user-facing assistant with a visible specialist team behind it.

### 13.1 Agent Roles

| Agent | Purpose | Owns | Tools |
| --- | --- | --- | --- |
| `Anchor Orchestrator` | Main manager for text interactions and cross-feature synthesis | final non-voice response | user state, planner tools, specialist calls |
| `Structure Coach` | Daily planning, anchors, recovery, routine guidance | daily structure recommendations | routines, calendar, check-in summaries |
| `Skills Coach` | Selects and guides DBT skills | skill suggestions and exercises | skills library, contextual skill matcher |
| `Reflection Coach` | Summarizes patterns and builds reviews | insights, weekly review, session prep | diary-card analytics, chain-analysis summaries |
| `Voice Coach` | Handles live speech-to-speech coaching | realtime voice turns | Realtime session, interruptions, voice scripts |
| `Safety Guardian` | Checks risk boundaries and blocks unsafe flows | safety gating | risk classification, escalation tool, crisis routing |

### 13.2 Orchestration Rules

- The `Anchor Orchestrator` remains the default owner of the user-facing text thread.
- Specialists are called as tools when the manager should preserve continuity.
- A handoff is used only when the specialist should temporarily own the branch:
  - `Voice Coach` during live voice sessions
  - `Safety Guardian` when the interaction crosses a safety threshold
- All side-effecting tools are guarded at the tool level.
- All runs are traced.

### 13.3 Recommended OpenAI Usage

- Agents SDK: orchestration, handoffs, guardrails, tracing, tool wiring
- Realtime API: live voice interaction in browser with ephemeral client secrets and `RealtimeSession`
- Responses API or server-managed agent turns: non-voice text interactions and tool execution

### 13.4 Memory Strategy

Because this is a sensitive mental-health product, the app should treat long-term user memory as application-owned data, not raw transcript replay.

Memory layers:

- app database: routines, diary entries, skill usage, plans, reviews, safety plan
- short-lived session state: current thread context and voice session context
- derived summaries: compact longitudinal insights used by agents

Requirement:

- the product must not depend on replaying a user’s entire historical conversation to function well
- transcripts and voice artifacts should be stored only with explicit consent and clear retention rules

### 13.5 Agent Behavior Requirements

- every AI reply must end in either a next action, a skill recommendation, a clarifying choice, or a safety step
- long reflective monologues are disallowed by default
- agent responses should be short during distress and slightly longer during planning or review
- the system must expose a traceable “why this skill” explanation in internal logs and optionally in user-facing detail mode

## 14. Safety Requirements

1. The app must clearly state that it is not emergency care.
2. The app must surface U.S. crisis guidance including `988` and `911`, while allowing localization later.
3. The app must interrupt normal coaching if the user indicates imminent intent, a current suicide attempt, or inability to stay safe.
4. The app must not provide instructions that meaningfully facilitate self-harm.
5. The app must not claim diagnosis, cure, or therapist equivalence.
6. Risk reviews for side-effecting features must be logged.
7. Diary-card, chain-analysis, and skill content must be clinically reviewed before launch.

### 14.1 Safety Risk Tiers

- `Normal`: no current signal of elevated self-harm or emergency danger; normal coaching is allowed.
- `Elevated`: user expresses concerning distress, passive death wish, uncertainty about safety, or rapidly rising self-harm urges without clear imminent plan; `Safety Guardian` takes over the session, shortens replies, confirms present safety, recommends grounding plus support contact, and restricts the coach to safety-oriented actions only.
- `Acute`: user expresses imminent intent, a current attempt, inability to stay safe, or a time-bound plan with access to means; the app exits normal coaching, foregrounds crisis routing, and offers only emergency and support actions.

### 14.2 Safety Takeover and Recovery Rules

- In `Elevated` mode, the UI switches to `Safety Mode` with:
  - brief supportive language
  - one grounding skill
  - contact-support options
  - a direct path to the full safety plan
- In `Elevated` mode, the user-facing flow is:
  1. `Safety Guardian` asks “Are you safe right now?” with `yes / not sure / no`.
  2. `yes` -> grounding step -> simplified next action -> optional return to normal coaching.
  3. `not sure` -> remain in safety mode -> prompt support contact + safety plan -> no normal coaching.
  4. `no` -> escalate immediately to `Acute` mode.
- In `Elevated` mode, the user can return to normal coaching only after:
  - confirming they are safe enough to continue
  - completing or explicitly declining the grounding step
  - receiving a simplified next action instead of a long conversation
- In `Acute` mode, regular coaching remains locked for that session until the user exits or the emergency flow is acknowledged.
- Every elevated or acute interruption must create a safety event log with timestamp, trigger type, and outcome.

## 15. Privacy and Trust Requirements

- transparent retention settings
- export and delete my data
- optional local app lock / passcode
- explicit consent for therapist sharing
- explicit consent for audio recording or stored transcripts
- no advertising-based data use
- plain-language privacy explanations

### 15.1 Voice and Transcript Retention Policy

- Raw voice audio is not retained after the live session ends, except transient transport/runtime buffering required to complete the session.
- Live transcript text is visible during the session but is not persisted by default.
- By default, the app stores only:
  - session start/end metadata
  - redacted agent run traces without raw transcript text
  - a short derived summary if the user explicitly saves it
- If the user opts into transcript saving, transcript text is retained for `30 days` and can be deleted immediately by the user.
- Saved transcript text must be clearly labeled as transcript content and kept separate from diary-card data.
- A per-session `Do Not Save This Session` control must be available before or during voice use.
- Session summaries promoted into journal, diary, or session-prep artifacts become regular user data and follow the app’s normal deletion/export rules.
- Agent traces for voice sessions are retained for `30 days` in operations storage unless legal/security policy requires shorter retention.
- User-initiated account deletion must delete saved transcripts, derived summaries, and share artifacts on the product side within `30 days`.

## 16. Information Architecture

### Primary Navigation

- `Today`
- `Coach`
- `Skills`
- `Insights`
- `Me`

### Persistent Global Actions

- `Mic` floating action for live voice
- `Check-In` quick action
- `Help Now` safety/rescue action

### Desktop Navigation

- left rail replaces bottom nav
- right rail can show today summary, agent activity, or review cards

## 17. Feature Requirements

### 17.1 Onboarding and Safety

- The user must create an account or start with a guided anonymous trial if allowed by business rules.
- The onboarding flow must explain what the app is and is not.
- The onboarding flow must collect:
  - timezone
  - wake/sleep range
  - top goals
  - primary struggles
  - preferred check-in times
  - whether the user has a therapist/coach
  - whether calendar integration is allowed
- The onboarding flow must create:
  - three default daily anchors
  - a safety plan shell
  - the first week’s notification schedule

### 17.2 Daily Structure

- The Today screen must show the day as a sequence of anchors and next steps.
- The user must be able to mark a step as done, snooze it, lower its difficulty, or reset the plan.
- The app must support “minimum viable day” mode for low-capacity days.
- The user must be able to recover from a missed morning without losing the rest of the plan.

### 17.3 Diary Cards

- Quick Check-In must take under 30 seconds.
- Full Diary Card must be completable in under 2 minutes for most users.
- Diary fields must be customizable but clinically guided.
- The app must chart trends over day, week, and month.

### 17.4 Coaching

- Coach must support text and live voice.
- Coach must understand whether the user wants planning, skill help, reflection, or rescue.
- Coach must recommend skills based on current state, not random rotation.
- Coach must suggest structure changes such as “reduce your plan,” “take a paced-breathing reset,” or “choose one must-do.”

### 17.5 Skills

- Skills must have short, practical instructions.
- Each skill must include:
  - when to use it
  - why it helps
  - how to do it
  - duration
  - follow-up prompt
- The app must support favorite, recent, and recommended skills.

### 17.6 Chain Analysis

- The user must be able to start from a diary entry or from scratch.
- Chain analysis must be resumable.
- The end of chain analysis must produce:
  - intervention points
  - alternative skills
  - one prevention plan

### 17.7 Insights and Reviews

- The app must produce daily and weekly summaries.
- The user must be able to inspect patterns by emotion, urge, behavior, skill, and structure adherence.
- The app must generate a session prep packet as PDF and share link.

### 17.8 Notifications and Proactive Nudges

- Notifications must be helpful, not guilt-inducing.
- The scheduler must support:
  - anchor reminders
  - missed check-in recovery prompts
  - therapy-day reminders
  - weekly review prompts
- The app must let the user tune intensity and quiet hours.

### 17.9 End-to-End Journeys

#### Journey A: New user, first 24 hours

1. User lands on the product promise and understands the app is a DBT companion, not emergency care.
2. User creates an account and completes safety/consent.
3. User enters baseline goals, pain points, and waking rhythm.
4. User creates three anchors and enables notifications.
5. User lands on `Today` with one recommended morning flow already prepared.
6. User completes the first quick check-in and first anchor.
7. User receives an evening prompt to complete a short diary-card closeout.
8. User finishes day one with a visible “tomorrow starts here” setup.

#### Journey B: Normal structured day

1. User opens `Today`.
2. User completes the morning anchor.
3. App sets a next best step and keeps midday anchor queued.
4. User receives a midday check-in and adjusts the plan if needed.
5. User completes the evening review and full diary card.
6. App updates insights and tomorrow’s starting point.

#### Journey C: Day derailment

1. User misses the morning anchor.
2. App surfaces a non-shaming “reset day” prompt instead of marking failure.
3. User opens `Planner / Day Reset`.
4. Structure Coach proposes:
   - one must-do
   - one self-regulation action
   - one thing to defer
5. User chooses `minimum viable day`.
6. App updates `Today`, clears nonessential tasks, and reframes the day as recoverable.

#### Journey D: Distress spike with voice

1. User taps `Mic` or `Help Now`.
2. Safety Guardian performs a fast pre-check.
3. If no high-risk trigger is detected, `Voice Coach` session starts.
4. Voice Coach identifies whether the user needs:
   - regulation
   - decision support
   - day reset
   - chain-analysis capture for later
5. Voice Coach walks the user through a skill or reset.
6. Session ends with one next action and an optional quick log.
7. If elevated risk is detected at any point, the session exits normal coaching and moves to `Rescue / Safety Plan`.

#### Journey E: Therapy prep

1. User receives a reminder the day before therapy.
2. User opens `Weekly Review` or `Session Prep / Share`.
3. Reflection Coach summarizes key patterns.
4. User redacts optional fields.
5. User exports a packet or shares directly with therapist.
6. App stores a `SessionPacket` record and suggests next week’s structure adjustments after the appointment.

### 17.10 Non-Functional and Platform Requirements

- The product must ship as a responsive web app with installable PWA behavior on supported mobile browsers.
- The app must support push notifications on supported platforms.
- The app must degrade gracefully when push is unavailable by using in-app reminders and email fallback if enabled.
- The app must support offline capture for:
  - quick check-ins
  - diary-card entries
  - routine completion
  - chain-analysis drafts
- Offline data must sync safely when connectivity returns.
- The primary actions on `Today`, `Quick Check-In`, and `Help Now` must be reachable in under 2 taps from app launch.
- The app must meet accessibility expectations for:
  - screen readers
  - color contrast
  - keyboard navigation on desktop
  - reduced motion
  - captions or transcript visibility for voice sessions
- The app must support a low-stimulation mode with reduced visual noise and simplified prompts.
- The app must log agent runs, handoffs, tool calls, safety interruptions, and share events for audit and debugging.
- Time-sensitive features must be timezone aware and daylight-saving safe.

### 17.11 Screen State Requirements

Every primary screen must define:

- loading state
- first-use empty state
- returning state with prior data
- offline state where relevant
- error state with recovery action
- interrupted safety state when a high-risk event overrides normal behavior

The most important specific screen states are:

- `Today`: on-track, missed-anchor, minimum-viable-day, therapy-day
- `Coach`: normal coaching, reflective coaching, safety interruption
- `Live Voice Session`: connecting, live, muted, reconnecting, escalated
- `Diary Card`: untouched, partial, complete, overdue
- `Session Prep / Share`: draft, redacted, ready to share, share success, share failure

## 18. Screen Inventory

### 18.1 Welcome / Landing

- Purpose: explain the value proposition and move to sign up
- Key elements: product promise, “not emergency care” notice, start CTA
- Primary CTA: `Get Started`

### 18.2 Sign Up / Sign In

- Purpose: account creation and returning access
- Key elements: email/social login, passkey, trust copy
- Primary CTA: `Continue`

### 18.3 Safety & Consent

- Purpose: explain boundaries and gather consent
- Key elements: what the app does, what it does not do, crisis routing, privacy, audio consent
- Primary CTA: `I Understand`

### 18.4 Intake & Baseline

- Purpose: collect goals, concerns, rhythms, and care context
- Key elements: life domains, struggles, support system, therapist connection option
- Primary CTA: `Build My Plan`

### 18.5 Routine Setup

- Purpose: create default morning, midday, and evening anchors
- Key elements: wake window, check-in times, default steps, calendar import
- Primary CTA: `Create My Day`

### 18.6 Today

- Purpose: daily command center
- Key elements: anchors, next best step, diary status, recommended skill, mic, help-now button
- Primary CTA: `Start Next Step`

### 18.7 Quick Check-In

- Purpose: fast logging in the moment
- Key elements: mood, urge, energy, short note, suggested next action
- Primary CTA: `Save and Continue`

### 18.8 Full Diary Card

- Purpose: full DBT-aligned tracking
- Key elements: emotions, urges, behaviors, skill use, sleep, meds, notes, trends
- Primary CTA: `Complete Diary Card`

### 18.9 Coach

- Purpose: structured text coaching
- Key elements: conversation thread, suggested prompts, mode chips, specialist indicator
- Primary CTA: `Send`

### 18.10 Live Voice Session

- Purpose: real-time guided interaction
- Key elements: waveform, mute, transcript preview, active goal, exit to safety
- Primary CTA: `Start Talking`

### 18.11 Skills Library

- Purpose: browse or search DBT skills
- Key elements: module tabs, situation filters, favorites, recent skills
- Primary CTA: `Open Skill`

### 18.12 Skill Exercise

- Purpose: perform one skill step-by-step
- Key elements: concise instruction, timer, voice option, reflection prompt
- Primary CTA: `Start Exercise`

### 18.13 Chain Analysis

- Purpose: structured review of a difficult event
- Key elements: prompting event, vulnerabilities, links, consequences, alternatives
- Primary CTA: `Finish Analysis`

### 18.14 Planner / Day Reset

- Purpose: adjust today’s structure
- Key elements: must-do items, anchors, reductions, minimum viable day, tomorrow preview
- Primary CTA: `Apply Reset`

### 18.15 Rescue / Safety Plan

- Purpose: immediate access to crisis supports and grounding
- Key elements: contacts, steps, emergency links, favorite rescue skills
- Primary CTA: `Use Safety Plan`

### 18.16 Insights

- Purpose: show trend-level understanding
- Key elements: charts, streaks, pattern cards, structure score, skill efficacy
- Primary CTA: `Review Pattern`

### 18.17 Weekly Review

- Purpose: close the week and prepare the next one
- Key elements: wins, misses, top targets, recommended adjustments, next week settings
- Primary CTA: `Finalize Review`

### 18.18 Session Prep / Share

- Purpose: create and send a clinician-ready summary
- Key elements: packet preview, redactions, share permissions, PDF/export
- Primary CTA: `Share Summary`

### 18.19 Me / Settings

- Purpose: user profile, permissions, privacy, customization
- Key elements: account, lock settings, notification settings, voice settings, therapist sharing
- Primary CTA: `Save Settings`

## 19. Wireframes

### 19.1 Welcome / Landing

```text
+---------------------------------------------------+
| Anchor                                            |
| A DBT daily structure companion                   |
|                                                   |
| [ Build a better day ]                            |
| [ Use skills in real life ]                       |
| [ Get voice help in the moment ]                  |
|                                                   |
| Not emergency care. In danger? Call 911 / 988.    |
|                          [ Get Started ]          |
+---------------------------------------------------+
```

### 19.2 Sign Up / Sign In

```text
+---------------------------------------------------+
| Welcome back / Create account                     |
|                                                   |
| [ Email ]                                         |
| [ Password / Passkey ]                            |
|                                                   |
| [ Continue ]                                      |
| [ Continue with Google ]                          |
| [ Continue with Apple ]                           |
|                                                   |
| Private by design                                 |
+---------------------------------------------------+
```

### 19.3 Safety & Consent

```text
+---------------------------------------------------+
| Before you begin                                  |
|                                                   |
| Anchor supports DBT practice.                     |
| It is not therapy or emergency care.              |
|                                                   |
| [ ] I understand crisis limits                    |
| [ ] I understand privacy choices                  |
| [ ] I understand voice permissions                |
|                                                   |
|                         [ I Understand ]          |
+---------------------------------------------------+
```

### 19.4 Intake & Baseline

```text
+---------------------------------------------------+
| Tell us about your life right now                 |
|                                                   |
| Top goals: [ stability ] [ routine ] [ urges ]    |
| Hardest moments: [ mornings ] [ conflict ] [...]  |
| In therapy now? [ yes / no ]                      |
| Wake time [ 7:00 ] Sleep time [ 11:00 ]           |
|                                                   |
|                        [ Build My Plan ]          |
+---------------------------------------------------+
```

### 19.5 Routine Setup

```text
+---------------------------------------------------+
| Build your three anchors                          |
|                                                   |
| Morning  7:30  [check-in] [top focus] [cope ahead]|
| Midday  12:30  [status] [reset] [skill]           |
| Evening  9:00  [diary] [reflect] [tomorrow]       |
|                                                   |
| Calendar import [ optional ]                      |
|                                                   |
|                         [ Create My Day ]         |
+---------------------------------------------------+
```

### 19.6 Today

```text
+---------------------------------------------------+
| Today                            [Mic] [Help Now] |
| Structure score: 72                                |
|                                                   |
| Next best step                                    |
| Morning anchor: top focus + paced breath          |
|                           [ Start Next Step ]     |
|                                                   |
| Midday reset        12:30                         |
| Evening review      9:00                          |
| Diary card status   2 of 5 fields done            |
| Nav: Today | Coach | Skills | Insights | Me       |
+---------------------------------------------------+
```

### 19.7 Quick Check-In

```text
+---------------------------------------------------+
| Quick Check-In                                    |
|                                                   |
| Mood     0 1 2 3 4 5                              |
| Urge     0 1 2 3 4 5                              |
| Energy   low / medium / high                      |
| Note      [ one sentence ]                        |
|                                                   |
| Suggested next step: STOP + water + 2 min walk    |
|                     [ Save and Continue ]         |
+---------------------------------------------------+
```

### 19.8 Full Diary Card

```text
+---------------------------------------------------+
| Full Diary Card                                   |
|                                                   |
| Emotions        [ sliders ]                       |
| Urges           [ sliders ]                       |
| Behaviors       [ toggles ]                       |
| Skills used     [ tags ]                          |
| Sleep / meds    [ optional ]                      |
| Notes           [ text ]                          |
|                                                   |
|                  [ Complete Diary Card ]          |
+---------------------------------------------------+
```

### 19.9 Coach

```text
+---------------------------------------------------+
| Coach                                             |
| Modes: [ Plan ] [ Skill ] [ Reflect ] [ Reset ]   |
|                                                   |
| Coach: What feels hardest right now?              |
| You: I missed the morning and feel behind.        |
| Coach: Let's reduce the day to one must-do.       |
|                                                   |
| Prompt chips: [ reset my day ] [ choose a skill ] |
| [ Type a message... ]                 [ Send ]    |
+---------------------------------------------------+
```

### 19.10 Live Voice Session

```text
+---------------------------------------------------+
| Live Voice Coach                                  |
|                                                   |
| Active focus: mid-day reset                       |
|                                                   |
|      ~ waveform / listening indicator ~           |
|                                                   |
| "Let's slow this down. What happened first?"      |
|                                                   |
| [ Mute ] [ End ] [ Open Safety Plan ]             |
+---------------------------------------------------+
```

### 19.11 Skills Library

```text
+---------------------------------------------------+
| Skills                                            |
| [ Mindfulness ] [ Distress ] [ Emotion ] [ IE ]   |
| Search: [ panic / conflict / numb / urge ]        |
|                                                   |
| Recent: STOP, TIP, Opposite Action                |
| Recommended now: Check the Facts                  |
| Favorites: Wise Mind, PLEASE, DEAR MAN            |
|                                                   |
|                          [ Open Skill ]           |
+---------------------------------------------------+
```

### 19.12 Skill Exercise

```text
+---------------------------------------------------+
| Skill: STOP                                       |
|                                                   |
| 1. Stop                                           |
| 2. Take a step back                               |
| 3. Observe                                        |
| 4. Proceed mindfully                              |
|                                                   |
| Timer 02:00        Voice guide [ on ]             |
|                        [ Start Exercise ]         |
+---------------------------------------------------+
```

### 19.13 Chain Analysis

```text
+---------------------------------------------------+
| Chain Analysis                                    |
|                                                   |
| Prompting event   [ text ]                        |
| Vulnerabilities   [ lack of sleep, conflict ]     |
| Links in chain    [ thought -> urge -> action ]   |
| Consequences      [ short / long ]                |
| Alternatives      [ skill + plan ]                |
|                                                   |
|                         [ Finish Analysis ]       |
+---------------------------------------------------+
```

### 19.14 Planner / Day Reset

```text
+---------------------------------------------------+
| Reset Today                                       |
|                                                   |
| Keep: therapy, one work task, evening review      |
| Reduce: errands, long messages                    |
| Add: 10-min walk                                  |
| Mode: [ full day ] [ minimum viable day ]         |
| Tomorrow start: [ morning anchor at 8:00 ]        |
|                                                   |
|                           [ Apply Reset ]         |
+---------------------------------------------------+
```

### 19.15 Rescue / Safety Plan

```text
+---------------------------------------------------+
| Help Now                                          |
|                                                   |
| 1. Pause and breathe                              |
| 2. Use distress skill                             |
| 3. Contact support                                |
|                                                   |
| Support contacts                                  |
| [ Call trusted person ] [ Text 988 ] [ Call 911 ] |
|                                                   |
|                         [ Use Safety Plan ]       |
+---------------------------------------------------+
```

### 19.16 Insights

```text
+---------------------------------------------------+
| Insights                                          |
|                                                   |
| Structure adherence   ████░ 68%                   |
| Top emotion           shame                       |
| Top urge              avoid / isolate             |
| Best skill this week  opposite action             |
|                                                   |
| Pattern card: mornings predict the rest of day    |
|                         [ Review Pattern ]        |
+---------------------------------------------------+
```

### 19.17 Weekly Review

```text
+---------------------------------------------------+
| Weekly Review                                     |
|                                                   |
| Wins: 4 strong mornings, 2 good resets            |
| Misses: skipped 3 evening reviews                 |
| Top target next week: conflict avoidance          |
| Suggested change: move midday anchor to 1:00      |
|                                                   |
|                         [ Finalize Review ]       |
+---------------------------------------------------+
```

### 19.18 Session Prep / Share

```text
+---------------------------------------------------+
| Session Prep                                      |
|                                                   |
| Include: trends, targets, chain analyses, notes   |
| Redact: meds / custom notes [ toggle ]            |
| Share with therapist [ connected ]                |
| Export as PDF                                     |
|                                                   |
|                           [ Share Summary ]       |
+---------------------------------------------------+
```

### 19.19 Me / Settings

```text
+---------------------------------------------------+
| Me                                                |
|                                                   |
| Profile                                           |
| Notifications                                     |
| Voice & audio                                     |
| Privacy & passcode                                |
| Therapist sharing                                 |
| Crisis settings                                   |
|                                                   |
|                           [ Save Settings ]       |
+---------------------------------------------------+
```

## 20. Data Model

| Entity | Purpose | Key Fields |
| --- | --- | --- |
| `User` | account identity | id, email, locale, timezone, status |
| `UserProfile` | personalized care and routine preferences | wake_time, sleep_time, goals, struggles, therapy_status |
| `ConsentRecord` | trust and legal boundary tracking | consent_type, granted_at, revoked_at |
| `SafetyPlan` | crisis supports and self-regulation plan | warning_signs, steps, contacts, crisis_resources |
| `SupportContact` | trusted people or clinicians | name, relation, contact_method, priority |
| `RoutineTemplate` | reusable structure for anchors | name, type, default_steps, target_time |
| `RoutineInstance` | a scheduled anchor for a date | date, routine_template_id, status, completed_at |
| `DailyPlan` | current day’s plan state | date, must_dos, reduced_mode, next_best_step |
| `CalendarEvent` | optional imported commitments | source, start_at, end_at, title |
| `DiaryEntry` | full diary-card submission | date, mood_scores, urge_scores, behaviors, skill_tags, notes |
| `QuickCheckIn` | low-friction in-the-moment log | created_at, mood, urge, energy, note |
| `DiarySchema` | defines the stable diary-card core and custom field configuration | version, core_fields, custom_fields, export_mapping |
| `SkillDefinition` | DBT skill content object | module, name, when_to_use, steps, duration |
| `SkillSession` | execution of a skill | skill_id, started_at, completed_at, helpfulness_rating |
| `BehaviorTarget` | DBT target hierarchy item | type, label, severity, active_status |
| `ChainAnalysis` | structured event analysis | prompting_event, vulnerabilities, links, consequences, alternatives |
| `InsightCard` | derived pattern shown to user | time_range, summary, evidence_refs, confidence |
| `WeeklyReview` | weekly synthesis object | week_start, wins, misses, target_next_week, recommendations |
| `SessionPacket` | shareable therapy summary | date_range, included_sections, pdf_url, shared_at |
| `TherapistConnection` | optional data-sharing link | therapist_name, share_token, permissions |
| `AgentRun` | observability record for agent activity | run_id, agent_name, start_at, end_at, outcome |
| `AgentHandoff` | traceable ownership change | source_agent, target_agent, reason, timestamp |
| `VoiceSession` | live coaching session | started_at, ended_at, mode, transcript_status |
| `TranscriptArtifact` | optional persisted transcript text or derived voice summary | voice_session_id, artifact_type, retained_until, deleted_at |
| `SafetyEvent` | log of elevated or acute safety interruptions | detected_at, risk_tier, trigger_type, resolution |
| `NotificationPreference` | timing and channel controls | intensity, quiet_hours, channel_settings |
| `Nudge` | scheduled or delivered reminder | nudge_type, scheduled_at, delivered_at, result |

## 21. Primary Use Cases

1. Start the morning with a structured anchor.
2. Recover after oversleeping or missing the first routine.
3. Do a 20-second check-in during rising distress.
4. Enter a full diary card at night.
5. Ask the coach what skill fits a specific emotional state.
6. Start a live voice session while walking or dysregulated.
7. Turn a bad event into a chain analysis.
8. Reduce today to a minimum viable day.
9. Review the week and change anchor timing.
10. Generate a therapy summary before a session.
11. Open the safety plan during acute distress.
12. Adjust privacy, voice, and notification settings.

## 22. User Stories

### Structure

- As a user, I want a clear morning start so that I do not drift into chaos before noon.
- As a user, I want the app to help me reset a derailed day so that one bad hour does not ruin the whole day.
- As a user, I want a “minimum viable day” option so that I can still succeed on low-capacity days.

### DBT Tracking

- As a user, I want quick diary logging so that I actually use it during real life.
- As a user, I want a fuller end-of-day diary card so that I can review the day accurately.
- As a user, I want my most important targets surfaced clearly so that I know what matters in therapy.

### Skill Use

- As a user, I want the app to recommend the right skill for the moment so that I do not waste time searching.
- As a user, I want guided skill steps with timers and optional voice so that I can follow through under stress.

### Reflection

- As a user, I want to understand what led to a bad behavior so that I can interrupt the chain next time.
- As a user, I want weekly patterns summarized so that I can change my structure intelligently.

### Voice and Support

- As a user, I want to talk to the app hands-free so that I can get help while walking, crying, or overwhelmed.
- As a user, I want the coach to stay concise during distress so that I am not overloaded.

### Safety and Trust

- As a user, I want clear crisis boundaries so that I know when the app is no longer the right tool.
- As a user, I want strong privacy controls so that sensitive diary content feels safe to record.

### Clinician Support

- As a user, I want to send a clean summary to my therapist so that session time is spent on the right issues.
- As a therapist, I want a concise weekly packet so that I can see trends without reading a long chat log.

## 23. Release Scope

### V1 Must Have

- onboarding
- daily anchors
- quick check-in
- full diary card
- text coach
- live voice session
- skill library and guided exercises
- chain analysis
- day reset / minimum viable day
- insights
- weekly review
- session prep export
- safety plan
- privacy settings

### V1.1 / Next

- therapist portal
- calendar sync refinement
- wearable integrations
- richer personalization
- more localization
- advanced clinician workflows

## 24. Open Questions For SPEC

1. Will the first release require therapist-sharing from day one, or can it ship with export-only sharing?
2. Will accountless trial mode be allowed for trust and activation, or is secure account creation required first?
3. What exact retention policy should be applied to transcripts, voice artifacts, and agent traces?
4. What fields in the diary card should be default versus customizable in v1?
5. What level of clinician review is required before launch for all DBT content and chain-analysis prompts?
6. Should calendar integration be in MVP or ship shortly after if scope pressure appears?
7. Should the product include streaks and rewards in v1, or begin with softer reinforcement only?

## 25. Final Product Standard

Anchor succeeds if a user can say:

- “This helps me start the day.”
- “This helps me recover when I spiral.”
- “This helps me actually use DBT.”
- “This helps me show up to therapy prepared.”
- “This feels supportive without pretending to be my therapist.”

That is the bar the `SPEC.md` must preserve.
