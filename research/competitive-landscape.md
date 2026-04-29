# Competitive Landscape Memo

As of April 2026, the strongest DBT-adjacent products cluster around three loops:
1. `daily check-in -> skill prompt -> reward/insight`
2. `routine scaffolding -> streaks/reminders -> progress feedback`
3. `human/AI support -> escalation to clinical care or crisis resources`

## Clinical baseline for a DBT daily-structure product

DBT is not just a content library. The core operating model is: diary card review, behavior/chain analysis, skills practice across the four modules, target prioritization, and between-session coaching. That means the product should help users record what happened, notice patterns, and pick the next skill fast, not merely read lessons.

Useful references:
- [DBT overview and targets](https://pmc.ncbi.nlm.nih.gov/articles/PMC5828478/)
- [DBT diary card and session structure](https://www.diary-card.com/)
- [UW diary card instructions](https://depts.washington.edu/uwbrtc/wp-content/uploads/NIMH4-S-DBT-Diary-Card-Instructions.pdf)

## Product landscape

### DBT-native apps

- [DBT Coach by Resiliens](https://www.resiliens.com/dbt-coach/)
  - Strong pattern match for a DBT daily structure app: interactive lessons, mood tracking, crisis tools, daily reminders, progress analytics, and clinician integration.
  - Best signal: it treats DBT as a practice system, not a reading app.
  - Watchout: broad feature surface can get heavy if the core daily flow is not extremely short.

- [DBT Diary Card](https://www.diary-card.com/)
  - Best-in-class for diary-card mechanics: daily 0-5 ratings, behaviors/sleep/meds/notes, skills library, therapist link code, safety plan, and PDF exports.
  - Strong clinician value: patient dashboard, trend charts, engagement monitoring, and session-ready reports.
  - Monetization is straightforward and explicit: therapist plan plus patient premium.
  - Watchout: it is function-first and emotionally neutral; it does not yet create strong habit momentum on its own.

### Habit and self-care apps

- [Finch](https://finchcare.com/mobile) and [Finch Help Center](https://help.finchcare.com/hc/en-us)
  - Strongest example of daily self-care retention design: small goals, energy/reward loops, adventures, quests, streaks, self-care areas, friends, and seasonal events.
  - Onboarding is gentle and highly scaffolded: users start with goals quickly, then the app expands into routines and social accountability.
  - Great pattern: optional social support that is encouraging rather than performative.
  - Safety/privacy pattern to borrow: mute tags/exercises, backups, and clear support paths.
  - Monetization: freemium with Finch Plus at `"$9.99/mo"` or `"$69.99/yr"` plus gifting and preview mechanics.
  - Watchout: the pet/reward layer can overshadow the behavior change goal if not carefully tied back to clinical intent.

- [Fabulous](https://www.thefabulous.co/) and [Help Center](https://help.thefabulous.co/en/support/solutions/articles/101000406368-how-to-subscribe-to-fabulous-apps)
  - Strong on routine formation and habit stacking. The product sells a “daily routine” promise, not isolated tasks.
  - Good pattern: onboarding that asks what the user wants to build, then guides them into pre-recorded coaching and short daily rituals.
  - Monetization is aggressively layered: web, in-app, monthly, annual, and lifetime paths. That creates flexibility but can also create friction and confusion.
  - Watchout: too many subscription paths and activation steps can become a trust tax.

- [Stoa](https://stoameditation.com/en) and [Stoa daily content](https://stoameditation.com/blog/daily-meditations/)
  - Strong voice-guided daily practice model: short meditations, daily guidance, lessons, and philosophy-backed routines.
  - Best pattern: concise daily content that maps to a stable morning or reset ritual.
  - Watchout: it is conceptually rich, but not a full behavior-change operating system.

### AI companion / guided support

- [Woebot Health](https://woebothealth.com/)
  - Important historical benchmark for conversational mental health support using CBT, IPT, and DBT elements.
  - Current state matters: the Woebot app was retired on June 30, 2025, and new users in the U.S. are limited to access-code or study/partner flows.
  - Product pattern worth emulating: conversational check-ins plus tools, with explicit “not crisis / not a replacement for care” guardrails.
  - Watchout: when the product becomes access-code gated, growth, continuity, and consumer discoverability all change materially.

- [Wysa](https://www.wysa.com/) and [FAQ](https://www.wysa.com/faq)
  - Strong current equivalent for AI-guided mental health support: AI coach, evidence-based tools, mood tracking, breathing exercises, and optional human coaching.
  - Strong safety stance: not for crisis, not for severe cases, and not a replacement for clinical care.
  - Best pattern: AI self-help plus live coaching as an escalation path.
  - Watchout: broad enterprise positioning can dilute the product story for direct-to-consumer users.

- [Earkick](https://earkick.com/privacy) and [Earkick research](https://earkick.com/research/ethical-ai-for-mental-health/)
  - Distinctive on privacy and multimodal logging: anonymous use, mood journaling, and voice/text/video check-ins.
  - Strong pattern: low-friction, no-login entry with strong privacy language and therapy-aligned prompts.
  - Watchout: anonymity reduces onboarding friction but also reduces continuity, accountability, and recovery across devices unless handled carefully.

### Voice-guided adjacent products

- [Headspace meditation](https://www.headspace.com/meditation) and [Headspace coaching](https://www.headspace.com/coaching-subscription)
  - Best-in-class for guided audio, short daily sessions, and coaching as a supplemental support layer.
  - Strong pattern: bite-sized content for “pause, reset, continue” moments.
  - Watchout: meditation apps can drift into passive listening unless they actively translate insight into action.

- [Calm](https://www.calm.com/mindfulness) and [Calm Dailies](https://support.calm.com/hc/en-us/articles/115005140414-Calm-Dailies)
  - Strong voice-led habit model: daily sessions, sleep stories, breathing, and routine-building.
  - Best pattern: predictable daily programming with a familiar instructor voice.
  - Watchout: sleep and meditation content alone do not create durable behavior change unless paired with planning, logging, or reflection.

## Patterns to emulate

- Make the daily action small enough to complete in under 2 minutes.
- Tie every check-in to a clear next step: skill, reflection, reset, or escalation.
- Use streaks, rewards, and progress summaries, but keep them subordinate to behavior change.
- Offer therapist/coach sharing, exports, or a review layer for users who want accountability.
- Make safety visible: crisis limitations, support contacts, and hard transitions when risk is elevated.
- Offer personalization that improves relevance without making onboarding feel like a questionnaire.
- Allow gentle social support, but keep it optional and low-pressure.
- Support offline or low-friction use where possible, with sync/backups as an explicit trust feature.

## Patterns to avoid

- Over-indexing on content libraries without daily execution mechanics.
- Heavy onboarding that asks too much before the first success.
- Subscription complexity that creates doubt, cancellation friction, or restore-purchase confusion.
- Gamification that is cute but disconnected from actual therapeutic progress.
- AI that sounds therapeutic without clear limits, crisis routing, or human backup.
- Community features that add shame, comparison, or public performance pressure.
- Journaling that produces data but no action, summary, or clinical handoff.

## Gaps and opportunities for a best-in-class DBT daily structure product

1. A single, fast daily loop built around: `rate -> note -> skill -> reflect -> next action`.
2. Chain analysis that can be started in one tap and resumed later, with clear prompts and examples.
3. A DBT-aware recommendation engine that suggests the next skill based on the user’s current target, not just recent engagement.
4. Clinician-sharing that is optional, granular, and session-ready from day one.
5. Voice support for “I need help right now” moments, but anchored to DBT skills and not generic encouragement.
6. Safety defaults that respect crisis risk without making the app feel like a sterile compliance product.
7. A warm, emotionally intelligent brand that still feels structured and credible.

## Bottom line

The market is split between:
- `DBT tools` that are clinically useful but dry
- `habit apps` that are engaging but not clinically deep
- `AI companions` that are supportive but often under-structured

The opportunity is to combine the best of all three: a daily DBT operating system that is emotionally supportive, clinically grounded, and frictionless enough to use every day.
