# Repository Cleanup Plan

- [x] Capture the current local/remote branch state without changing files.
- [x] Delegate read-only cleanup verification to an agent and review the report.
- [x] Identify which dirty files belong to the completed Pass 1/Pass 2 work versus pre-existing or unrelated work.
- [x] Decide a safe branch and PR strategy that avoids losing user work.
- [x] Create or switch to an appropriate feature branch if needed.
- [x] Stage only the intended files for the cleanup/PR unit.
- [x] Run targeted verification for the staged unit.
- [x] Commit the staged unit with a focused message.
- [x] Push the branch and prepare/open the PR if the local/remote state is clean.
- [x] Update context history with the repo cleanup outcome.
