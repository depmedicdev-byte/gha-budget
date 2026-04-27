# Changelog

## 0.1.1 - 2026-04-27

- README points at the new in-browser budget tool at
  https://depmedicdev-byte.github.io/budget.html (zero-install demo).

## 0.1.0 - 2026-04-27

Initial release.

- CLI for `.github/workflows` directory or single file.
- Per-runner pricing model from GitHub Actions billing docs.
- Matrix expansion (counts include/exclude rules).
- Self-hosted runner detection (priced at $0).
- Output: text, JSON, or markdown (PR-comment friendly).
- Args: `--runs-per-day`, `--minutes`, `--file`, `--json`, `--markdown`.
- MIT licensed. Companion to `ci-doctor` and the GHA cost cookbook.
