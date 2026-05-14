# Agent Repo Cleanup Plan

- [x] Verify repository location and current git status without changing state.
- [x] Inspect local branches, remote branches, and configured remotes.
- [x] Inspect recent commit history to identify Pass 1/2 context and branch ancestry.
- [x] Inventory untracked and modified files, grouping likely recent Pass 1/2 work versus pre-existing or unrelated changes.
- [x] Check concise diffs/stat summaries only, avoiding staging, commits, pulls, rebases, or pushes.
- [x] Write a concise cleanup verification report with branch/PR strategy, risks, and exact non-destructive recommended commands.
- [x] Mark this plan complete as each step finishes.
