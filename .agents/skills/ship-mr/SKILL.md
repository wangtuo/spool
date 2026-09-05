---
name: ship-mr
description: "Create or update a focused Pull Request for the spool repository (wangtuo/spool on GitHub) and shepherd it until ready to merge. Use when the user says ship MR/PR, submit/create/push a PR, 提交 MR/PR, 提 PR, 发 PR, 合并到 main, ship full, or asks to deliver the current change through GitHub. Covers scoped commits, main-branch synchronization, Jekyll build validation, PR creation/update, checks and review follow-up, conflict resolution, and final readiness reporting. Always goes through a PR — never push feature work straight to main."
---

# Ship Spool PR

Deliver one coherent change to `wangtuo/spool` on GitHub as a Pull Request and keep working until the PR is genuinely ready to merge. Use the `gh` CLI for PR operations. This is a Jekyll / GitHub Pages site; `main` is the deployment branch (Pages builds and publishes it automatically).

Always deliver through a PR: create a feature branch, push it, open a PR against `main`. Do **not** commit feature work directly on `main`, even for small content/link fixes.

First, confirm the tooling is authenticated:

```bash
gh auth status   # must be logged in as wangtuo on github.com
```

Two invocation modes:
- **ship-mr** (default): create/update the PR, shepherd it to mergeable + reviewed, then stop and report.
- **ship-full**: same as ship-mr, then after the PR is fully mergeable, squash-merge it to `main` and verify.

To trigger ship-full, the user must say "ship full", "ship and merge", "提交并合并", "提 PR 并合并", or explicitly ask to merge after creating the PR. Ship-mr alone does NOT merge.

## Authorization boundary

- Treat invocation as authorization to create a branch, stage files that belong to the requested change, commit, push, create or update a PR, and address checks/review findings.
- **ship-mr mode**: Do not merge, bypass checks, close a PR, or delete remote data unless the user explicitly requests that action.
- **ship-full mode**: After all completion-contract criteria are met, merge with `gh pr merge <number> -R wangtuo/spool --squash --delete-branch`, then verify the PR state is `MERGED` and update local `main` without discarding unrelated work.
- Preserve unrelated user changes. Never stage with `git add .` or `git add -A`. Stage an explicit file list after reviewing the diff.
- Never commit secrets or build artifacts. Never stage `_site/`, `.jekyll-cache/`, `node_modules/`, `.trae/`, `.worktrees/`, `test-results/`, `backup/`, `vendor/`, or `.bundle/`.

## Completion contract

Do not report a PR as ready until all of these are true for the latest pushed commit:

1. The diff is focused and targets `main`.
2. `git diff --check` is clean and `bundle exec jekyll build` succeeds with **zero Liquid warnings/errors**.
3. Every visible check has completed without failure. This repo currently has **no GitHub Actions workflows**, so `gh pr checks` reports no checks — that is treated as passing. If workflows are added later, they must all be green.
4. `gh pr view` reports `mergeable: MERGEABLE` (and `mergeStateStatus: CLEAN`, or `BLOCKED` only by an unmet required review that the user must supply).
5. There are zero unresolved review threads.
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

1. Read the repository `AGENTS.md` (if present) and any narrower instructions covering the changed files.
2. Inspect both unstaged and staged diffs. Identify pre-existing or unrelated files before editing or staging.
3. Confirm the PR has one purpose. Split unrelated work instead of bundling it.
4. Search open PRs for the current source branch before creating another:

```bash
gh pr list -R wangtuo/spool --state open
```

5. Determine the change surface: Jekyll templates/layouts (`_layouts/`, `_includes/`, `*.html`), posts/content (`_posts/`, `series/`, `*.md`), site data/config (`_data/`, `_config.yml`), styles/scripts (`assets/`), or repository skill/tooling (`.agents/`).

## Phase 2: Branch and synchronize

The target branch is `main` unless the user explicitly chooses another. Never commit feature work directly on `main`.

1. Fetch the latest target:

```bash
git fetch origin main
```

2. If currently on `main`, create a short conventional branch such as `feat/<topic>`, `fix/<topic>`, `refactor/<topic>`, or `docs/<topic>`. Creating the branch preserves current working changes.
3. Commit only the scoped files with a Conventional Commit message (this repo uses Chinese summaries, e.g. `fix: 修复站内链接与 Liquid 代码块渲染`).
4. Rebase the feature branch onto `origin/main` before the first push when needed. Resolve conflicts by preserving both the target-branch intent and the requested change, then rerun the Jekyll build.
5. For an already-pushed branch that must be rebased, use `git push --force-with-lease`, never plain `--force`.

## Phase 3: Validate

Create the PR as soon as the cheap checks pass. The required local checks for this repo are:

```bash
git diff --check
bundle exec jekyll build
```

- `jekyll build` must finish with `done in ...` and **no** `Liquid Warning` / `Liquid syntax error` lines. A warning almost always means a post's code sample contains `{{` or `{%` that Liquid swallowed — wrap that block in `{% raw %}...{% endraw %}`.
- Record the exact commands and their result in the PR description. Do not claim a check was run if it was not.

For user-visible changes (templates, links, layout, CSS/JS), optionally sanity-check by serving `_site/` locally and loading the affected route. This is not a required gate — the `jekyll build` is — but if you do it, put the concrete result in the PR body and do not reference inaccessible local temp files. Examples of what to look for: broken in-site links (`/spool/spool/...` double-baseurl, or `.html` links that should be directory URLs), missing code in highlighted blocks, wrong nav active state.

If validation generates files, keep only intentional source changes. Never stage the generated `_site/` output, caches, or coverage.

## Phase 4: Commit, push, and create or update the PR

Stage explicit paths and re-check the staged diff:

```bash
git add <path>...
git diff --cached --check
git diff --cached --stat
git commit -m "<type>(<scope>): <summary>"
git push -u origin HEAD
```

Create the PR if none exists for the source branch:

```bash
gh pr create -R wangtuo/spool \
  --base main \
  --head <branch> \
  --title "<conventional title>" \
  --body "$(cat <<'EOF'
## Summary
- Problem and outcome
- Key implementation choice

## Validation
- `git diff --check` — result
- `bundle exec jekyll build` — result (note: zero Liquid warnings)
- User-visible check and actual result, or no-user-facing rationale

## Risk and rollback
- Main risk, compatibility note, and rollback path
EOF
)"
```

Squash-merge with branch deletion is chosen at merge time (Phase 7), not at create time.

If a PR already exists, inspect it before updating (`gh pr view <n> -R wangtuo/spool`); keep its base, title, and description aligned with the latest diff.

## Phase 5: Shepherd checks, review, and conflicts

Start monitoring immediately after push:

```bash
gh pr checks <number> -R wangtuo/spool --watch
```

With no workflows configured this returns immediately with no checks (treated as passing). If checks are ever added and one fails: inspect it with `gh pr checks <number> -R wangtuo/spool`, reproduce locally (almost always via `bundle exec jekyll build`), fix the root cause, commit, and push. Retry a check without code changes only when evidence points to infrastructure flakiness; record that reasoning.

### Review comments

List unresolved review threads. For a solo repo this is normally empty; when reviews exist, use the GraphQL API to count unresolved threads:

```bash
gh api graphql -f query='
{
  repository(owner:"wangtuo", name:"spool") {
    pullRequest(number:<number>) {
      reviewThreads(first:50) {
        nodes { isResolved comments(first:1){ nodes { path body } } }
      }
    }
  }
}' --jq '[.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved==false)] | length'
```

Expect `0`. Handle each unresolved thread:
- Valid issue: fix, run `bundle exec jekyll build`, commit, push, reply if useful, then resolve the thread.
- Not applicable: reply with concrete reasoning, then resolve.
- Never resolve a thread without addressing its substance.

### Merge conflict

```bash
git fetch origin main
git rebase origin/main
# resolve conflicts, then:
bundle exec jekyll build   # must still be clean
git push --force-with-lease
```

Do not choose conflict sides mechanically. Inspect the target-branch changes and preserve current behavior.

## Phase 6: Final audit and handoff

Run final checks against the latest PR head:

```bash
gh pr view <number> -R wangtuo/spool --json number,url,state,mergeable,mergeStateStatus,reviewDecision,headRefOid
gh pr checks <number> -R wangtuo/spool
git status --short --branch
```

Confirm `mergeable` is `MERGEABLE`, checks are passing/absent, and unresolved-thread count is `0` (Phase 5 query).

Report only the useful outcome:

- PR number and URL
- latest commit SHA
- validation run (`git diff --check`, `bundle exec jekyll build` result) and any user-visible check
- checks/review/conflict/unresolved-thread status
- any pre-existing unrelated worktree files left untouched
- whether user action remains (explicit approval to merge for ship-full, or a required review)

Never say "ready" based only on green checks. Mergeability, unresolved comments, and local worktree state are part of the contract.

## Phase 7 (ship-full only): Merge to main

This phase runs ONLY when invoked as ship-full. Before merging, re-run the Phase 6 audit and confirm ALL of:
1. Checks are green (or no checks configured, which is the current state).
2. `gh pr view` reports `mergeable: MERGEABLE`.
3. Zero unresolved review threads.
4. No uncommitted local changes from this delivery.
5. The user explicitly asked for ship-full / merge.

Then squash-merge and delete the remote branch:

```bash
gh pr merge <number> -R wangtuo/spool --squash --delete-branch
```

After merge:
1. Verify the PR merged:
   ```bash
   gh pr view <number> -R wangtuo/spool --json state --jq .state   # expect: MERGED
   ```
2. Update local `main`:
   ```bash
   git checkout main
   git pull --ff-only origin main
   ```
3. Delete the local feature branch: `git branch -d <branch>`.
4. GitHub Pages rebuilds and deploys `main` automatically (usually under a minute). Optionally spot-check the live result, e.g. `curl -s -o /dev/null -w '%{http_code}' https://wangtuo.github.io/spool/<path>/`.
5. Report: merged commit/SHA, local `main` updated, branch cleaned up, and the Pages deploy/spot-check result.

If merge fails due to a conflict or stale checks, return to Phase 5 (rebase/fix/reshepherd) rather than bypassing.

## Explicit merge request

When the user separately and explicitly asks to merge, first repeat the final audit (Phase 6). If still ready, run the Phase 7 merge command. After merge, verify PR state is `MERGED` and update local `main` without discarding unrelated work.
