# Anchor Production-Hardening Implementation Plan

## Current Execution Scope

Supersede the completed Pass 0-13 walking skeleton with a private-beta production-hardening track.

Target decisions:

- Release target: private beta.
- Voice architecture: server-mediated WebRTC through OpenAI `/v1/realtime/calls`.
- Session prep sharing: export-only; therapist share links are deferred.
- Export artifact priority: JSON first; PDF remains optional/future.

## Strict Guardrails

- Do not expose `OPENAI_API_KEY` to the browser.
- Do not retain raw voice audio.
- Do not persist transcripts unless the user explicitly opts in.
- Do not cache sensitive API responses in the service worker.
- Do not implement therapist share links in this phase.
- Keep every pass browser-testable and runnable at `http://127.0.0.1:3210`.

## Checklist

- [x] Preserve completed Pass 8-13 plan in context history and make this the active `PLAN.md`.
- [x] Create hardening dashboard artifact with 6 production-hardening passes.
- [x] Write RED API tests for production config, secure cookies, CSRF, and request ids.
- [x] Write RED API/browser tests for server-mediated WebRTC voice setup and hangup.
- [x] Write RED API/browser tests for JSON export artifacts and authenticated downloads.
- [x] Write RED API/browser tests for privacy deletion execution.
- [x] Write RED browser/API tests for PWA install, service worker, and offline queue capture.
- [x] Write RED API tests for audit events and private-beta readiness checks.
- [x] Implement hardening Pass 1: Security and Production Config.
- [x] Implement hardening Pass 2: Real Voice Session Setup.
- [x] Implement hardening Pass 3: Real Export Artifacts.
- [x] Implement hardening Pass 4: Privacy Deletion Execution.
- [x] Implement hardening Pass 5: PWA Install and Offline Capture.
- [x] Implement hardening Pass 6: Observability, Audit, and Release Checks.
- [x] Run full `bun run db:reset`, `bun run test`, and `bun run test:browser`.
- [x] Perform manual browser smoke and console check.
- [x] Update dashboard JSON/HTML, capability ledger, local history, and NotebookLM.
