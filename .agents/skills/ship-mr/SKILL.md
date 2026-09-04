---
name: ship-mr
description: "Create or update a focused Merge Request for the wisp repository and shepherd it until ready to merge. Use when the user says ship MR, submit/create/push an MR, 提交 MR, 提 MR, 发 MR, 合并到 main, or asks to deliver the current change through Codebase. Covers scoped commits, main-branch synchronization, wisp-specific validation, MR creation/update, CI and review follow-up, conflict resolution, and final readiness reporting."
---

# Ship Wisp MR

Deliver one coherent change to `inf/wisp` through Codebase and keep working until the MR is genuinely ready to merge. Use the `codebase` CLI for MR operations.

Two invocation modes:
- **ship-mr** (default): create/update MR, shepherd to green CI + approved, then stop and report.
- **ship-full**: same as ship-mr, then after the MR is fully approved and mergeable, merge it to main and verify.

To trigger ship-full, the user must say "ship full", "ship and merge", "提交并合并", "提 MR 并合并", or explicitly ask to merge after creating the MR. Ship-mr alone does NOT merge.

## Authorization boundary

- Treat invocation as authorization to create a branch, stage files that belong to the requested change, commit, push, create or update an MR, and address CI/review findings.
- **ship-mr mode**: Do not merge, bypass checks, close an MR, or delete remote data unless the user explicitly requests that action.
- **ship-full mode**: After all completion-contract criteria are met (green CI, mergeable, no unresolved threads), merge the MR to main using `codebase mr merge -N <number> -R inf/wisp --yes`, then verify the MR status is `merged` and update local `main` without discarding unrelated work.
- Preserve unrelated user changes. Never stage with `git add .` or `git add -A`. Stage an explicit file list after reviewing the diff.
- Never commit secrets or local artifacts. Pay special attention to `.env`, credentials, generated coverage/build output, root `web/`, `apps/web/node_modules/`, and `apps/web/dist/`.
- Do not block delivery solely because no Meego/work-item ID is available.

## Completion contract

Do not report an MR as ready until all of these are true for the latest pushed commit:

1. The diff is focused and targets `main`.
2. Relevant local checks and user-visible acceptance have passed.
3. Every visible CI check has completed without failure; `neutral` policy checks are acceptable only when Codebase considers them passing.
4. `codebase mr status` reports `Mergeable: true`, including review and conflict gates.
5. `codebase mr comment list --unresolved` returns zero threads.
6. The worktree has no uncommitted changes created by this delivery. Pre-existing unrelated changes may remain and must be reported.

## Phase 1: Inspect and scope

Run independent read-only checks in parallel where possible:

```bash
git status --short --branch
git diff --stat
git diff --check
git log --oneline --decorate -8
git remote -v
```

Then:

1. Read the repository `AGENTS.md` and any narrower instructions covering changed files.
2. Inspect both unstaged and staged diffs. Identify pre-existing or unrelated files before editing or staging.
3. Confirm the MR has one purpose. Split unrelated work instead of bundling it.
4. Search open MRs for the current source branch before creating another:

```bash
codebase mr list -R inf/wisp --status open --page-size 100
```

5. Determine the change surface: Go/backend, React/frontend, Docker/config, protobuf, documentation, or repository Skill.

## Phase 2: Branch and synchronize

The target branch is `main` unless the user explicitly chooses another branch. Never commit feature work directly on `main`.

1. Fetch the latest target:

```bash
git fetch origin main
```

2. If currently on `main`, create a short conventional branch such as `feat/<topic>`, `fix/<topic>`, `refactor/<topic>`, or `docs/<topic>`. Creating the branch preserves current working changes.
3. Commit only the scoped files with a Conventional Commit message.
4. Rebase the feature branch onto `origin/main` before the first push when needed. Resolve conflicts by preserving both the target-branch intent and the requested change, then rerun affected checks.
5. For an already-pushed branch that must be rebased, use `git push --force-with-lease`, never plain `--force`. Do not rewrite a shared branch without confirming ownership and scope.

## Phase 3: Validate efficiently

Create the MR as soon as scoped low-cost checks pass, then run full CI-equivalent validation while CI runs.

First, run the mandatory quick checks:

```bash
git diff --check
```

Then run the relevant local checks and CI-equivalent validation for the changed surface before pushing. Choose repository commands that cover the affected backend, frontend, deployment, and lifecycle contracts, and record the exact commands and results in the MR description.

Key rules:
- Run Go tests with `GOTOOLCHAIN=go1.25.0` and `-gcflags="all=-N -l"` (required by mockey).
- Run `make lint` for Go changes and address lint failures before pushing.
- When coverage gates apply, add tests for uncovered paths until both overall (Go 80%, frontend 20%) and diff coverage (Go 80%, frontend 80%) gates pass.

For user-visible changes, execute an acceptance path from the user's perspective and capture concise evidence for the MR description:
- UI: build/run the current frontend and exercise the affected route or interaction.
- API/SSE: call the real endpoint and verify status plus meaningful response/event behavior.
- CLI/Make/Docker: run the exact documented command and verify exit status, health, and access URL.
- Browser/CDP: use `make test-cdp-e2e` for the containerized CDP E2E path when its prerequisites are available. Use `npm run test:cdp` only for the manual live-Gateway smoke path with a caller-owned loopback Chrome and an isolated profile; it is not a CI substitute.
- No user-visible behavior: state why acceptance is not applicable instead of inventing a scenario.

If validation generates files, keep only intentional source changes. Never stage reports, coverage, caches, or compiled output unless the repository explicitly tracks them.

## Phase 4: Commit, push, and create or update the MR

Stage explicit paths and re-check the staged diff:

```bash
git add <path>...
git diff --cached --check
git diff --cached --stat
git commit -m "<type>(<scope>): <summary>"
git push -u origin HEAD
```

Create the MR if none exists for the source branch:

```bash
codebase mr create -R inf/wisp \
  --source <branch> \
  --target main \
  --title "<conventional title>" \
  --body "<description>"
```

Immediately configure normal merge behavior:

```bash
codebase mr edit -N <number> -R inf/wisp --squash --delete-branch
```

If an MR already exists, inspect it before updating; keep its target, title, and description aligned with the actual latest diff.

Use this concise body structure:

```markdown
## Summary
- Problem and outcome
- Key implementation choice

## Validation
- `command` — result
- User-visible acceptance and actual result, or no-user-facing rationale

## Risk and rollback
- Main risk, compatibility note, and rollback path
```

Do not claim a check was run if it was not. Put useful acceptance output directly in the body; do not reference inaccessible local temporary files.

## Phase 5: Shepherd CI, review, and conflicts

Start monitoring immediately after push so CI runs while remaining local checks finish:

```bash
codebase mr watch -N <number> -R inf/wisp \
  --exit-on-mergeable --fail-fast --timeout 1200
```

If the watch times out with checks still pending, report progress and continue watching. Do not treat a timeout as a failed MR. After every push, ensure monitoring covers the new head commit.

### CI failure

1. List all checks, not only required checks:

```bash
codebase mr checks list -N <number> -R inf/wisp
```

2. Inspect every failed check's `Text` or use `codebase mr checks view --check-run-id <id>`.
3. Reproduce locally when possible, fix the root cause, rerun relevant validation, commit, and push.
4. Retry a job without code changes only when evidence points to infrastructure/flakiness and the equivalent local check passes. Record that reasoning.

### CDP-specific validation and flake triage

Treat `make test-cdp-e2e` as a separate, environment-sensitive acceptance signal. Before running it, confirm that the target supplies its own isolated browser/CDP endpoint, a scoped Gateway environment, and cleanup on both success and failure. Never point it at a shared or publicly reachable DevTools endpoint.

When it fails, preserve the target's browser/report/diagnostic artifacts and classify the failure before retrying: browser or CDP startup, container/network/readiness, application assertion, or genuine product regression. Retry once only for evidence-backed infrastructure or browser-startup flakiness, in a fresh scoped environment; do not retry assertion failures to manufacture a pass. Record skipped runs and the reason in the MR validation notes. A failure of the manual `npm run test:cdp` path should be triaged separately because it depends on caller-owned Chrome state.

### Review comments

List unresolved threads and handle every one, including comments created by automated reviewers:

```bash
codebase mr comment list -N <number> -R inf/wisp --unresolved
```

- Valid issue: fix, validate, commit, push, reply if useful, then resolve.
- Not applicable: reply with concrete reasoning, then resolve.
- Never resolve a thread without addressing its substance. Resolve the agent's own threads before declaring readiness.

### Merge conflict

```bash
git fetch origin main
git rebase origin/main
# resolve and validate
git push --force-with-lease
```

Do not choose conflict sides mechanically. Inspect the target-branch changes and preserve current contracts.

## Phase 6: Final audit and handoff

Run final checks against the latest MR head:

```bash
codebase mr status -N <number> -R inf/wisp
codebase mr checks list -N <number> -R inf/wisp
codebase mr comment list -N <number> -R inf/wisp --unresolved
git status --short --branch
```

Report only the useful outcome:

- MR number and URL
- latest commit
- user-visible acceptance result or no-user-facing rationale
- local checks run
- CI, review, conflict, and unresolved-comment status
- any pre-existing unrelated worktree files left untouched
- whether user action remains, such as explicit approval to merge

Never say "ready" based only on green CI. Review gates, mergeability, unresolved comments, acceptance, and local worktree state are part of the contract.

## Phase 7 (ship-full only): Merge to main

This phase runs ONLY when invoked as ship-full. Before merging, re-run the final audit and confirm ALL of:
1. Every CI check is green (succeeded).
2. `codebase mr status` reports `Mergeable: true`.
3. Zero unresolved comment threads.
4. No uncommitted local changes from this delivery.
5. The user explicitly asked for ship-full / merge.

An actual CDP browser run is additionally required before ship-full only when it is part of the requested acceptance criteria or Codebase exposes it as a required check. A skipped or unavailable CDP environment must be reported honestly.

Then:

```bash
codebase mr merge -N <number> -R inf/wisp --yes
```

After merge:
1. Verify MR status is `merged`.
2. Update local `main`:
   ```bash
   git fetch origin main
   git checkout main
   git pull --ff-only origin main
   ```
3. Delete the local feature branch: `git branch -d <branch>`.
4. Report: merged as commit `<sha>`, local main updated, branch cleaned up.

If merge fails due to a conflict or stale CI, return to Phase 5 (rebase/fix/reshepherd) rather than bypassing.

## Explicit merge request

When the user separately and explicitly asks to merge, first repeat the final audit. If still ready, obtain any confirmation required by the active Codebase tooling policy, then use the non-interactive merge command. After merge, verify MR status and update local `main` without discarding unrelated work.
