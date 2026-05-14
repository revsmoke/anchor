# UI Pseudo-Functionality Review - Dashboard Lane

Scope: inspected `vertical-slice-dashboard.html`, `vertical-slice-dashboard-anchor-pass13.json`, `vertical-slice-dashboard-anchor-hardening.json`, `public/index.html`, `public/js/app.js`, and `public/css/app.css`. I also spot-checked tests and the capability ledger to avoid flagging routes that are actually covered.

No source code was modified.

## Top 3 Concerns

1. **Dashboard artifacts mark broad functionality as done even where the live UI is narrower.**
   `vertical-slice-dashboard.html:1135` and `vertical-slice-dashboard-anchor-hardening.json:451` show all status rows as `done`, while `vertical-slice-dashboard-anchor-pass13.json:132`, `:138`, `:150`, `:168`, `:174`, `:218`, `:236`, `:254`, and `:260` claim controls/states such as favorites, exercise timer, prompt chips, waveform/listening state, active goal, mute/reconnect, passcode/app lock, therapist sharing, notification permission, and quiet-hours validation. The inspected product UI only exposes smaller prototype surfaces for many of these.

2. **Notifications and offline capture wording overpromises real device behavior.**
   `public/index.html:905-936` presents "Notifications and Offline Capture", "Notification opt-in", quiet hours, and "Sync Offline Queue". In `public/js/app.js:1924-1940`, notification opt-in only saves settings through `/api/me/settings`; there is no `Notification.requestPermission`, push subscription, reminder scheduling, or visible permission state in the inspected app files. In `public/js/app.js:1943-1985`, offline sync is a manual `clientMutationId` form that sends or stores a synthetic `quick_check_in` mutation with `{ mood: 3 }`, not captured user actions from the broader app.

3. **Several date-sensitive dashboard outputs are hard-coded to the April 2026 demo window.**
   The UI labels "Insights and Weekly Review", "Session Prep Export", and "Export Data" read like current-user/current-period actions (`public/index.html:823-853`, `:857-891`). The client hard-codes `/api/weekly-review/2026-04-20` and export date ranges `2026-04-20` to `2026-04-28` in `public/js/app.js:1817-1824`, `:1842-1848`, and `:1876-1884`. That is fine for a seeded prototype, but misleading if treated as dynamic production functionality.

## Findings

### P1 - Static dashboard completion states exceed implemented UI breadth

Evidence:
- `vertical-slice-dashboard.html:1135-1195` embeds all visible hardening statuses as `done`.
- `vertical-slice-dashboard-anchor-hardening.json:451-524` marks all hardening layer/pass cells as `done`.
- `vertical-slice-dashboard-anchor-pass13.json:611-709` marks all pass 0-13 layer/pass cells as `done`.
- Claimed UI/functionality not visible in the inspected product files:
  - Favorites and timer: `vertical-slice-dashboard-anchor-pass13.json:132`, `:218`, `:562`.
  - Coach mode chips / prompt chips: `vertical-slice-dashboard-anchor-pass13.json:138`.
  - Voice waveform/listening, active goal, mute, reconnect: `vertical-slice-dashboard-anchor-pass13.json:150`, `:236`, `:580`.
  - Sharing consent, audio consent, passcode/app lock, therapist sharing, share revocation: `vertical-slice-dashboard-anchor-pass13.json:168`, `:254`, `:426-428`, `:598`.
  - Notification permission and quiet-hours client validation: `vertical-slice-dashboard-anchor-pass13.json:174`, `:260`, `:604`.

Why it matters:
The dashboard looks like an authoritative status artifact. A future agent or stakeholder could read it as proof that those UI states exist and are tested, when the inspected `public/index.html` and `public/js/app.js` expose only partial prototype flows.

### P1 - Notification controls save preferences but do not implement browser notifications

Evidence:
- UI claim/control: `public/index.html:905-924`.
- JS handler: `public/js/app.js:1924-1940`.
- Settings payload only persists `notificationOptIn`, `quietHoursStart`, and `quietHoursEnd`: `public/js/app.js:2000-2009`.
- No inspected app-file references to `Notification`, `PushManager`, `showNotification`, `requestPermission`, or browser notification permission handling.
- The dashboard explicitly claims notification permission surfaces and quiet-hours validation: `vertical-slice-dashboard-anchor-pass13.json:174`, `:260`, `:604`.

Why it matters:
"Notification opt-in" and quiet hours imply reminders or device notification permission. The current UI can only save a preference, so a user may think reminders are active when no browser notification path exists.

### P1 - Offline Capture is a manual synthetic mutation tester, not real capture

Evidence:
- UI wording: `public/index.html:905-936` says "Offline Capture" and "sync queued local mutations idempotently."
- The form only asks for `Client mutation id`: `public/index.html:929-934`.
- The sync handler sends queued mutations if present, otherwise creates a hard-coded `quick_check_in` mutation with `payload: { mood: 3 }`: `public/js/app.js:1947-1964`.
- Failed sync stores only that same synthetic mutation: `public/js/app.js:1968-1983`.
- Local queue persistence is only `localStorage` helpers: `public/js/app.js:1988-1998`.

Why it matters:
The UI label implies real offline capture of user actions across the app. The actual frontend path is closer to an idempotency/sync demo control.

### P2 - Skills "timer" is only a static running label

Evidence:
- Dashboard claim: `vertical-slice-dashboard-anchor-pass13.json:132`, `:218`, `:562`.
- Product UI includes `Start Exercise` and a `#skill-timer` status element: `public/index.html:667-681`.
- JS start handler only sets `activeSkillStartedAt` and `skillTimerEl.textContent = "Exercise running."`: `public/js/app.js:1404-1408`.
- There is no interval/countdown/duration progression in the inspected app JS; `rg` only found `setTimeout` for voice ICE/data-channel waits, not skill timing.
- Completion can auto-set `activeSkillStartedAt` if the user never pressed Start: `public/js/app.js:1419-1421`.

Why it matters:
"Guided exercise" and "timer" imply timed guidance or a countdown. The current behavior records timestamps and displays a static status, which is valid for a minimal session log but not a real timer.

### P2 - Insights, packet export, and privacy export are locked to seeded demo dates

Evidence:
- UI surfaces: `public/index.html:823-853`, `:857-891`.
- Insights always loads `GET /api/weekly-review/2026-04-20`: `public/js/app.js:1817-1824`.
- Session packet generation always sends `{ start: "2026-04-20", end: "2026-04-28" }`: `public/js/app.js:1842-1848`.
- Privacy export always sends the same April 2026 range: `public/js/app.js:1876-1884`.

Why it matters:
The labels do not tell the user these outputs are seeded/demo-period artifacts. If this is intended as a prototype fixture, the UI should name the fixture or derive dates from user state before claiming current insights/exports.

### P2 - Voice UI claims are broader than the visible control set

Evidence:
- Dashboard claim: `vertical-slice-dashboard-anchor-pass13.json:150`, `:236`, `:580`.
- Actual UI exposes live-agent toggle, do-not-save, availability text, start/end, transcript preview, and hidden audio: `public/index.html:795-820`.
- Live availability is configuration text only until the user starts a session: `public/js/app.js:296-305`.
- Live WebRTC path sends a generated test prompt over the data channel: `public/js/app.js:1707-1732`.
- End summary is also generated/static text depending on mode: `public/js/app.js:1776-1787`.

Why it matters:
The visible UI does not provide waveform/listening state, active goal, mute, reconnect UI, or a user-authored voice prompt surface. The current flow is suitable for server-mediated WebRTC smoke/prototype coverage, but the dashboard wording sounds like a fuller voice-coaching product.

### P2 - Privacy/Data Controls omit several controls claimed by the dashboard

Evidence:
- Product UI has transcript retention, trace retention, export, delete request, and execute delete: `public/index.html:857-902`.
- The settings payload hard-codes `audioConsent: false` and `shareConsent: false`: `public/js/app.js:2000-2009`.
- Dashboard claims include sharing consent, audio consent, passcode/app lock, therapist sharing, and share revocation: `vertical-slice-dashboard-anchor-pass13.json:168`, `:254`, `:426-428`, `:598`.

Why it matters:
The product UI does not expose these privacy/security controls. Marking them done in the dashboard may hide meaningful privacy work that remains unimplemented at the UI layer.

## Supported / Lower-Risk Notes

- Major navigation, auth, onboarding, check-in, diary, skills, coach, chain, voice, export, privacy, and offline routes appear wired in `public/js/app.js` through explicit event listeners and API calls.
- `public/css/app.css:307-314` sets global button/link touch targets to at least 44px, and `public/css/app.css:413-419` provides focus-visible outlines.
- The dashboard tool itself has real local edit/import/export/reset behavior: controls are present in `vertical-slice-dashboard.html:584-660`, grid editing/status behavior is implemented in `vertical-slice-dashboard.html:1382-1528`, and import/reset handlers are implemented in `vertical-slice-dashboard.html:1795-1839`.

## Recommended Follow-Up

- Split dashboard cells into "prototype supported", "demo/test fixture", and "not implemented in UI" instead of binary `done`.
- Rename or annotate prototype-only UI labels, especially Notifications, Offline Capture, Skill timer, Insights, and Exports.
- Add explicit tests for absence/presence of the claimed controls if those claims are intended to remain in the dashboard.
