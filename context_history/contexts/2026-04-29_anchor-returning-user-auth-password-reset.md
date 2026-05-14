## Anchor Returning User Auth and Password Reset — 2026-04-29 23:20 EDT

### Phase
implementation

### Summary
Implemented the returning-user auth slice for Anchor. The first screen now supports distinct Sign in and Create account modes, returning users resume saved app state through a bootstrap route, and local/dev users can complete a fully testable forgot-password flow with one-time reset codes.

### Files Created/Modified

| File | Purpose |
|------|---------|
| `public/index.html` | Replaced signup-only consent surface with semantic account access UI and password reset `<dialog>`. |
| `public/js/app.js` | Added auth mode state, sign-in, account creation, bootstrap resume, password reset request/confirm, and dialog behavior. |
| `public/css/app.css` | Added calm transitions, dialog styling, focus states, segmented auth controls, and reduced-motion support. |
| `server/app.js` | Added `/api/app/bootstrap`, password reset request/confirm routes, reset code creation, and quiet unauthenticated bootstrap. |
| `server/db.js` | Added bootstrap data loader, password reset token persistence, attempt lockout, password update/session invalidation, and deletion cleanup. |
| `db/migrations/016_password_reset_tokens.sql` | Added reset-token table with hashed token, expiry, attempt count, and lock timestamp. |
| `tests/api/pass1-auth-consent.test.js` | Added bootstrap, password reset, production no-code, and reset lockout coverage. |
| `tests/browser/pass1-consent.spec.js` | Added segmented auth, returning sign-in, password reset dialog, and resume coverage. |
| `README.md` | Documented Sign in/Create account and forgot-password behavior. |
| `CAPABILITY_LEDGER.md` | Recorded completed slice evidence and verification. |
| `vertical-slice-dashboard-anchor-hardening.json` | Added completed auth/reset pass across all layers. |
| `vertical-slice-dashboard.html` | Embedded updated dashboard state with the auth/reset pass. |

### Key Decisions
- Used a local/dev visible reset code instead of email delivery so the prototype flow is fully browser-testable.
- Returned a quiet unauthenticated bootstrap state when no session cookie exists to avoid console noise on first load.
- Added token-level lockout after repeated invalid reset codes, while leaving IP/email rate limiting for a future production email-delivery slice.
- Hid the account access card after successful returning-user sign-in so the resumed app state is clear.

### Technical Details
- `GET /api/app/bootstrap` returns unauthenticated state without sensitive data when no session exists, and authenticated state with consent completion, onboarding status, today anchors, daily plan, and next step when signed in.
- Password reset tokens store Argon2 hashes only; production responses omit `devResetCode`.
- Successful reset consumes the token, updates the password hash, and deletes existing sessions for that user.
- Privacy deletion now removes `password_reset_tokens` alongside other user-owned data.

### Testing/Verification
- RED verified before implementation: API tests failed on missing bootstrap/reset routes; browser tests failed on missing segmented auth/reset UI.
- `bun run db:reset` passed with migrations 001-016.
- `bun run test` passed: 58 unit/API tests.
- `PORT=3212 bun run test:browser` passed: 35 browser tests, 1 live OpenAI test skipped by default.
- `APP_ENV=production APP_ORIGIN=https://anchor.example DATABASE_URL=${DATABASE_URL:-postgres://localhost:5432/anchor_local} SESSION_SECRET=private-beta-session-secret OPENAI_API_KEY=sk-test REALTIME_MODEL=gpt-realtime TEXT_MODEL=gpt-4.1-mini TRACE_RETENTION_DAYS=30 bun run check:private-beta` passed.
- Manual smoke at `http://127.0.0.1:3210` passed: create account, onboard, clear cookies, sign back in, resume main app, auth card hidden, 0 console/page errors.
- QA re-check confirmed prior findings resolved.

### State
completed

### Next Steps
- Add real email delivery and abuse throttling before public launch.
- Consider a visible logout/account switch affordance if multi-account use becomes common.

### Related Files
- `PLAN.md`
- `SPEC.md`
- `CAPABILITY_LEDGER.md`
- `vertical-slice-dashboard-anchor-hardening.json`
