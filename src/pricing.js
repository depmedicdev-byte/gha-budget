'use strict';

// GitHub-hosted runner pricing per minute (USD), per the GitHub Actions
// billing docs. These are the published per-minute rates for paid use
// beyond the free monthly minutes. Free-tier minutes also count
// against your repo's quota at these multipliers, so this is the
// honest sticker price either way.
//
// Source: https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions
const PER_MINUTE_USD = {
  'ubuntu-latest': 0.008,
  'ubuntu-22.04': 0.008,
  'ubuntu-20.04': 0.008,
  'ubuntu-24.04': 0.008,
  'ubuntu-latest-4-core': 0.016,
  'ubuntu-latest-8-core': 0.032,
  'ubuntu-latest-16-core': 0.064,
  'windows-latest': 0.016,
  'windows-2022': 0.016,
  'windows-2019': 0.016,
  'windows-latest-4-core': 0.032,
  'windows-latest-8-core': 0.064,
  'macos-latest': 0.08,
  'macos-14': 0.08,
  'macos-13': 0.08,
  'macos-12': 0.08,
  'macos-latest-xlarge': 0.16,
  'macos-13-xlarge': 0.16,
  'macos-14-xlarge': 0.16,
};

const FREE_TIER_MULTIPLIER = {
  // For free-tier accounting, GitHub charges N minutes per real minute.
  ubuntu: 1,
  windows: 2,
  macos: 10,
};

function priceFor(runsOn) {
  if (typeof runsOn !== 'string') return null;
  const key = runsOn.trim().toLowerCase();
  if (key in PER_MINUTE_USD) return PER_MINUTE_USD[key];
  if (key.startsWith('ubuntu')) return PER_MINUTE_USD['ubuntu-latest'];
  if (key.startsWith('windows')) return PER_MINUTE_USD['windows-latest'];
  if (key.startsWith('macos')) return PER_MINUTE_USD['macos-latest'];
  if (key === 'self-hosted' || key.startsWith('self-hosted')) return 0;
  return null;
}

function familyFor(runsOn) {
  if (typeof runsOn !== 'string') return 'unknown';
  const key = runsOn.trim().toLowerCase();
  if (key.startsWith('ubuntu')) return 'ubuntu';
  if (key.startsWith('windows')) return 'windows';
  if (key.startsWith('macos')) return 'macos';
  if (key.startsWith('self-hosted') || key === 'self-hosted') return 'self-hosted';
  return 'unknown';
}

module.exports = { PER_MINUTE_USD, FREE_TIER_MULTIPLIER, priceFor, familyFor };
