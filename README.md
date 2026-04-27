# gha-budget

[![npm](https://img.shields.io/npm/v/gha-budget.svg)](https://www.npmjs.com/package/gha-budget) [![ci](https://github.com/depmedicdev-byte/gha-budget/actions/workflows/test.yml/badge.svg)](https://github.com/depmedicdev-byte/gha-budget/actions/workflows/test.yml) [![license](https://img.shields.io/npm/l/gha-budget.svg)](./LICENSE)

Estimate the dollar cost of a GitHub Actions workflow before you commit it.
Per-runner pricing, matrix expansion, monthly projection. CLI and JSON
output.

> Try it without installing: paste a workflow into the
> [in-browser budget](https://depmedicdev-byte.github.io/budget.html). Same
> matrix expansion and pricing model, runs entirely client-side.

![demo](docs/demo.svg)

```bash
$ npx gha-budget --runs-per-day=30 --minutes=8

gha-budget  2026-04-27T05:55:00Z

Assumed: 8 min/job, 30 runs/day.

.github/workflows/ci.yml
  job                   runs-on               matrix  min/run  rate/min   per-run
  build                 ubuntu-latest         1       8        $0.008     $0.064
  test                  ubuntu-latest         6       48       $0.008     $0.384
  -> workflow per-run: $0.45

.github/workflows/release.yml
  job                   runs-on               matrix  min/run  rate/min   per-run
  build                 macos-latest          1       8        $0.080     $0.640
  -> workflow per-run: $0.64

All workflows per-run total: $1.09
Daily   (30 runs/day): $32.70
Monthly (30 days):     $981.00
```

## Why

You write a new GitHub Actions workflow. You merge it. Two weeks later
the CI bill triples. Why? You added a macOS matrix slot. macOS-latest is
10x the per-minute rate of ubuntu-latest.

Most teams discover this in the bill. `gha-budget` shows it before you
commit.

## Install

```bash
npm install -g gha-budget
# or run on demand
npx gha-budget
```

## Usage

```bash
gha-budget                         # audit .github/workflows of cwd
gha-budget path/to/repo            # audit a specific repo
gha-budget --file ci.yml           # one workflow file
gha-budget --runs-per-day=30       # default 20
gha-budget --minutes=8             # mean per-job runtime, default 5
gha-budget --json                  # machine-readable for CI
gha-budget --markdown              # PR-comment friendly
```

## Pricing model

Source: [GitHub Actions billing docs](https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions).
Per-minute, USD, for GitHub-hosted standard runners (paid use beyond
free monthly minutes).

| Runner family | per-minute |
| - | - |
| ubuntu-* (2-core) | $0.008 |
| ubuntu-* 4-core | $0.016 |
| ubuntu-* 8-core | $0.032 |
| windows-* (2-core) | $0.016 |
| macos-* (3-core) | $0.080 |
| macos-* xlarge | $0.160 |
| self-hosted | $0.000 |

Matrix expansion is counted: a job with `os: [ubuntu, windows, macos]`
and `node: [18, 20]` becomes 6 matrix slots. Each slot pays the runner
rate for the assumed minutes.

## Caveats

This is a budget estimate, not a guarantee.

- The big unknown is real per-job runtime. Default of 5 min is the
  community median for small workflows. Override with `--minutes=N` or
  use the per-job timing from your billing dashboard for sharper numbers.
- `if:` conditions, `continue-on-error`, and dynamic matrix
  (`fromJSON()`) cannot be statically evaluated. They count as if they
  always run.
- Free-tier minutes are credited monthly. The dollar number you see
  here is the post-free-tier rate. If you stay under the free quota,
  out-of-pocket is zero; the budget here still tells you when you're
  about to exit the free tier.

## Companion tools

- [`ci-doctor`](https://www.npmjs.com/package/ci-doctor) - audit GHA
  workflows for waste, cost, security gaps. Use both: `ci-doctor` finds
  the issues, `gha-budget` tells you what each one costs.
- [`depmedic`](https://www.npmjs.com/package/depmedic) - surgical npm
  vulnerability triage.
- [`cursor-rules-init`](https://www.npmjs.com/package/cursor-rules-init)
  - opinionated `.cursorrules` starters.

## Cut the bill

If `gha-budget` shows a number that surprises you, the deeper pattern
set for cutting it lives in the [GHA cost cookbook](https://buy.polar.sh/polar_cl_E2HGFeAVxJ64gU0Tv0qGwAueuxvhuq6A0pjhE4BWTyD)
($19, free updates within v1.x).

## License

MIT.
