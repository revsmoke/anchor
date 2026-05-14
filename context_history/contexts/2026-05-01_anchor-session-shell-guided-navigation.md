## Anchor Session Shell and Guided Navigation — 2026-05-01

### Phase
implementation

### Summary
Implemented a session-aware app shell so returning users no longer see the account card while authenticated bootstrap is pending. Added primary navigation, a compact menu control, logout, a Today-first guided view, and one-section-at-a-time product navigation.

### Files Created/Modified

| File | Purpose |
|------|---------|
| `public/index.html` | Added checking-session status, authenticated shell/nav/logout, and Today guided view. |
| `public/js/app.js` | Added no-store bootstrap fetches, signed-out/signed-in shell state, guided view routing, menu toggling, and logout behavior. |
| `public/css/app.css` | Styled shell, nav/menu, guided transitions, and responsive menu behavior. |
| `public/service-worker.js` | Bumped app-shell cache to v2, deleted old caches, and changed app-shell fetches to network-first. |
| `server/app.js` | Added `Cache-Control: no-store` to app bootstrap responses. |
| `tests/browser/*.spec.js` | Added session-shell coverage and updated feature tests to navigate intentionally. |
| `tests/api/pass1-auth-consent.test.js` | Added bootstrap no-store assertion. |
| `README.md` | Documented Today-first navigation, menu, logout, and service-worker behavior. |
| `CAPABILITY_LEDGER.md` | Recorded completed session-shell/guided UX capability. |
| `vertical-slice-dashboard-anchor-hardening.json` | Added hardening dashboard pass for session shell and guided UX. |
| `vertical-slice-dashboard.html` | Embedded updated hardening dashboard state. |

### Key Decisions
- Bootstrap owns initial UI state: show `Checking your Anchor session...` until `/api/app/bootstrap` confirms whether a session exists.
- The main app defaults to `Today`; every other feature remains available through semantic primary navigation.
- Logout clears the session cookie only and returns to Sign in. It does not delete account data.
- Service worker app-shell cache is network-first for HTML/CSS/JS/manifest and never handles `/api/*`.

### Technical Details
- `renderRoutineSetup()` now hides auth/onboarding and calls `showGuidedView("today")` instead of unhiding every feature section.
- `showGuidedView()` toggles all product sections, updates the current view label, and synchronizes `aria-pressed` on navigation buttons.
- `requestJson()` and public startup fetches use `cache: "no-store"`.
- `/api/app/bootstrap` returns `Cache-Control: no-store` for authenticated and unauthenticated responses.
- Incomplete-consent authenticated sessions now use a consent-only completion mode instead of trying to create the account again.
- Stale `anchor_live_webrtc` localStorage preferences are ignored and cleared when the server reports OpenAI voice is unavailable.
- Per-request live Realtime calls can force network hangup cleanup even when the global test config is not production/force-network.

### Testing/Verification
- RED tests were added first and failed for missing nav, visible auth during delayed bootstrap, stale `anchor-app-shell-v1`, and missing bootstrap cache headers.
- `bun run db:reset` passed.
- `bun run test` passed: 59 tests.
- `PORT=3212 bun run test:browser` passed: 41 tests, 1 live OpenAI test skipped.
- Manual smoke at `http://127.0.0.1:3210` passed for create-account, routine setup, Today nav, section switch, logout, and 0 console issues.

### State
completed

### Next Steps
- Live OpenAI browser coverage remains opt-in with `OPENAI_REALTIME_LIVE_TEST=1`.

### Related Files
- `PLAN.md`
- `README.md`
- `CAPABILITY_LEDGER.md`
