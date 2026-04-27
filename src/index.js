'use strict';

const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');
const { priceFor, familyFor } = require('./pricing');

function listWorkflowFiles(dir) {
  const wf = path.join(dir, '.github', 'workflows');
  if (!fs.existsSync(wf)) {
    if (dir.endsWith('workflows') && fs.existsSync(dir)) {
      return readDir(dir);
    }
    return [];
  }
  return readDir(wf);
}

function readDir(d) {
  const out = [];
  for (const e of fs.readdirSync(d)) {
    const f = path.join(d, e);
    if (fs.statSync(f).isFile() && /\.ya?ml$/i.test(e)) out.push(f);
  }
  return out;
}

function flattenRunsOn(value) {
  if (!value) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string');
  if (typeof value === 'object') {
    const out = [];
    for (const v of Object.values(value)) {
      if (typeof v === 'string') out.push(v);
      else if (Array.isArray(v)) out.push(...v.filter((x) => typeof x === 'string'));
    }
    return out;
  }
  return [];
}

function expandMatrix(strategy) {
  if (!strategy || typeof strategy !== 'object') return 1;
  const m = strategy.matrix;
  if (!m || typeof m !== 'object') return 1;
  let combos = 1;
  for (const [k, v] of Object.entries(m)) {
    if (k === 'include' || k === 'exclude') continue;
    if (Array.isArray(v)) combos *= Math.max(1, v.length);
  }
  if (Array.isArray(m.include)) combos += m.include.length;
  if (Array.isArray(m.exclude)) combos = Math.max(1, combos - m.exclude.length);
  return Math.max(1, combos);
}

function analyzeJob(jobName, job, opts) {
  const minutes = opts.minutes;
  const matrixCombos = expandMatrix(job.strategy);
  const runsOnCandidates = flattenRunsOn(job['runs-on']);
  const runsOn = runsOnCandidates[0] || 'unknown';
  const ratePerMin = priceFor(runsOn);
  const family = familyFor(runsOn);
  const realMinutes = minutes * matrixCombos;
  const costPerRun = ratePerMin == null ? null : +(realMinutes * ratePerMin).toFixed(4);
  return {
    job: jobName,
    runsOn,
    family,
    matrix: matrixCombos,
    minutesPerRun: realMinutes,
    ratePerMinUsd: ratePerMin,
    costPerRunUsd: costPerRun,
    selfHosted: family === 'self-hosted',
  };
}

function analyzeWorkflow(filename, source, opts) {
  let doc;
  try { doc = YAML.parse(source); }
  catch (err) { return { filename, error: 'yaml-parse: ' + err.message, jobs: [] }; }
  if (!doc || typeof doc !== 'object') return { filename, error: 'empty workflow', jobs: [] };
  const jobs = doc.jobs && typeof doc.jobs === 'object' ? doc.jobs : {};
  const out = [];
  for (const [name, j] of Object.entries(jobs)) {
    if (!j || typeof j !== 'object') continue;
    out.push(analyzeJob(name, j, opts));
  }
  const known = out.filter((j) => j.costPerRunUsd != null);
  const totalPerRun = known.reduce((s, j) => s + j.costPerRunUsd, 0);
  return {
    filename,
    name: doc.name || path.basename(filename),
    jobs: out,
    knownJobs: known.length,
    totalCostPerRunUsd: +totalPerRun.toFixed(4),
  };
}

function projectMonthly(workflows, runsPerDay) {
  const totalPerRun = workflows.reduce((s, w) => s + (w.totalCostPerRunUsd || 0), 0);
  const daily = totalPerRun * runsPerDay;
  const monthly = daily * 30;
  return {
    runsPerDay,
    totalPerRunUsd: +totalPerRun.toFixed(4),
    dailyUsd: +daily.toFixed(2),
    monthlyUsd: +monthly.toFixed(2),
  };
}

function analyzeFile(file, opts) {
  const src = fs.readFileSync(file, 'utf8');
  return analyzeWorkflow(file.replace(/\\/g, '/'), src, opts);
}

function analyzeDirectory(dir, opts) {
  const files = listWorkflowFiles(dir);
  return files.map((f) => analyzeFile(f, opts));
}

module.exports = {
  analyzeFile,
  analyzeDirectory,
  analyzeWorkflow,
  projectMonthly,
  flattenRunsOn,
  expandMatrix,
};
