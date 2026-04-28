# Contributing

Thanks for your interest. depmedic is a small, opinionated suite of CI
audit tools maintained by one person. We are happy to take well-scoped
contributions; here are the ground rules.

## What we want

- **Bug reports** with a minimal repro that fits in an issue body. The
  smaller the repro, the faster the fix.
- **New rules** that are: backed by a real-world failure mode, not just
  a stylistic preference; have a clear suggested fix; and ship with a
  test in `test/`.
- **Documentation fixes** of any size. README tweaks, examples, fixed
  typos: send a PR, no issue needed.
- **Cross-CI sister CLI work** (Drone, Jenkinsfile, TeamCity,
  Buildkite, Woodpecker, ...) - open an issue first to align on rule
  shape so the family stays consistent.

## What we do not want

- Cosmetic refactors with no behavior change.
- "Add support for X" PRs without a single concrete user.
- Vendored binaries, lockfile-only changes, or tooling churn.

## Workflow

1. Fork + branch from `main`.
2. Make the change. Run `npm test` (every project has a
   `node --test` suite).
3. Update the README / CHANGELOG if user-visible.
4. Open a PR. Describe the failure mode in plain English first, the
   change second. Reference the issue if there is one.

## Code style

- CommonJS unless the file is explicitly an .mjs runner.
- No build step on most CLIs - we publish the source.
- Two spaces, single quotes, trailing commas. Prettier defaults are
  fine.
- No emoji in code, README, or commit messages.

## Releases

I cut releases manually, usually in batches of 1-3 patch bumps after a
group of merged PRs. There is no SLA. If your PR is critical, ping me
on it and I will prioritize.

Thanks for caring enough to read this far.
