#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { analyzeFile, analyzeDirectory, projectMonthly } = require('../src/index');
const { renderText, renderJson, renderMarkdown } = require('../src/report');
const pkg = require('../package.json');

const HELP = `gha-budget - estimate the dollar cost of GitHub Actions workflows.

Usage:
  gha-budget [path]                    audit .github/workflows in [path] (default: cwd)
  gha-budget --file path/to/wf.yml
  gha-budget --runs-per-day=N          (default 20)
  gha-budget --minutes=N               assumed mean job runtime, default 5
  gha-budget --json | --markdown
  gha-budget --version | --help

Pricing source: GitHub Actions billing docs (per-minute, USD).
self-hosted runners are priced at $0/min (you pay your own infra).
matrix expansion is counted; minutes-per-job stays the same per matrix slot.
`;

function parseArgs(argv) {
  const a = { positional: [], format: 'text', minutes: 5, runsPerDay: 20 };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--help' || x === '-h') a.help = true;
    else if (x === '--version' || x === '-V') a.version = true;
    else if (x === '--json') a.format = 'json';
    else if (x === '--markdown' || x === '--md') a.format = 'markdown';
    else if (x === '--file') a.file = argv[++i];
    else if (x.startsWith('--file=')) a.file = x.slice(7);
    else if (x === '--minutes') a.minutes = Number(argv[++i]);
    else if (x.startsWith('--minutes=')) a.minutes = Number(x.slice(10));
    else if (x === '--runs-per-day') a.runsPerDay = Number(argv[++i]);
    else if (x.startsWith('--runs-per-day=')) a.runsPerDay = Number(x.slice(15));
    else if (x.startsWith('--')) { console.error('unknown flag: ' + x); process.exit(2); }
    else a.positional.push(x);
  }
  if (!Number.isFinite(a.minutes) || a.minutes <= 0) a.minutes = 5;
  if (!Number.isFinite(a.runsPerDay) || a.runsPerDay <= 0) a.runsPerDay = 20;
  return a;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { process.stdout.write(HELP); return 0; }
  if (args.version) { process.stdout.write(pkg.version + '\n'); return 0; }

  let workflows;
  try {
    if (args.file) {
      workflows = [analyzeFile(args.file, { minutes: args.minutes })];
    } else {
      const dir = args.positional[0] || process.cwd();
      workflows = analyzeDirectory(dir, { minutes: args.minutes });
    }
  } catch (err) {
    console.error(err && err.stack ? err.stack : String(err));
    return 2;
  }
  if (workflows.length === 0) {
    console.error('No workflow files found. Looked under .github/workflows of the path.');
    return 0;
  }

  const projection = projectMonthly(workflows, args.runsPerDay);
  const opts = { minutes: args.minutes };
  if (args.format === 'json') process.stdout.write(renderJson(workflows, projection, opts) + '\n');
  else if (args.format === 'markdown') process.stdout.write(renderMarkdown(workflows, projection, opts) + '\n');
  else process.stdout.write(renderText(workflows, projection, opts) + '\n');
  return 0;
}

process.exit(main());
