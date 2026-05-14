# Install Log

## 2026-04-25 - Anchor Pass 0 dependencies

- Command: `bun install`
- Purpose: Install declared Pass 0 runtime/test dependencies from `package.json`.
- Packages installed: `postgres`, `@playwright/test`.
- Lockfile created: `bun.lock`.
- Undo: remove `node_modules`, `bun.lock`, and the dependency entries from `package.json`.

## 2026-04-25 - Playwright Chromium browser cache

- Command: `bunx playwright install chromium`
- Purpose: Install Chromium browser binaries needed for Playwright browser tests.
- Install location: user Playwright cache under `<user-home>/Library/Caches/ms-playwright`.
- Undo: run `bunx playwright uninstall chromium` or remove the corresponding Playwright cache entries.

## 2026-04-26 - Pass 1 password hashing

- Command: `bun add @node-rs/argon2`
- Purpose: Add Argon2 password hashing for account-required consent shell.
- Package installed: `@node-rs/argon2@2.0.2`
- Undo: run `bun remove @node-rs/argon2` and revise auth implementation to use a replacement hasher.
