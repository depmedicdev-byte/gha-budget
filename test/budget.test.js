'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeWorkflow, projectMonthly, expandMatrix, flattenRunsOn } = require('../src/index');
const { priceFor, familyFor } = require('../src/pricing');

const BASIC = `
name: ci
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
`;

const MATRIX = `
name: ci
on: [push]
jobs:
  test:
    runs-on: \${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20]
        exclude:
          - os: macos-latest
            node: 18
`;

const SELFHOST = `
name: ci
on: push
jobs:
  build:
    runs-on: self-hosted
    steps: [{ run: "echo hi" }]
`;

test('priceFor: known runner labels', () => {
  assert.equal(priceFor('ubuntu-latest'), 0.008);
  assert.equal(priceFor('windows-latest'), 0.016);
  assert.equal(priceFor('macos-latest'), 0.08);
  assert.equal(priceFor('macos-13-xlarge'), 0.16);
});

test('priceFor: unknown returns null', () => {
  assert.equal(priceFor('alien-linux-3000'), null);
});

test('familyFor: classifies', () => {
  assert.equal(familyFor('ubuntu-22.04'), 'ubuntu');
  assert.equal(familyFor('windows-2022'), 'windows');
  assert.equal(familyFor('macos-14'), 'macos');
  assert.equal(familyFor('self-hosted'), 'self-hosted');
});

test('expandMatrix: combos = product of array sizes minus excludes plus includes', () => {
  assert.equal(expandMatrix({ matrix: { os: ['a', 'b'], node: [1, 2, 3] } }), 6);
  assert.equal(expandMatrix({ matrix: { os: ['a', 'b'], exclude: [{ os: 'a' }, { os: 'b' }] } }), 1);
  assert.equal(expandMatrix(undefined), 1);
});

test('analyzeWorkflow: basic single ubuntu job', () => {
  const r = analyzeWorkflow('ci.yml', BASIC, { minutes: 5 });
  assert.equal(r.jobs.length, 1);
  const j = r.jobs[0];
  assert.equal(j.runsOn, 'ubuntu-latest');
  assert.equal(j.matrix, 1);
  assert.equal(j.minutesPerRun, 5);
  assert.equal(j.ratePerMinUsd, 0.008);
  assert.equal(j.costPerRunUsd, 0.04);
  assert.equal(r.totalCostPerRunUsd, 0.04);
});

test('analyzeWorkflow: matrix expands', () => {
  const r = analyzeWorkflow('ci.yml', MATRIX, { minutes: 5 });
  const j = r.jobs[0];
  // 3 OSes x 2 nodes - 1 excluded = 5 combos
  assert.equal(j.matrix, 5);
  assert.equal(j.minutesPerRun, 25);
});

test('analyzeWorkflow: self-hosted is $0', () => {
  const r = analyzeWorkflow('ci.yml', SELFHOST, { minutes: 5 });
  const j = r.jobs[0];
  assert.equal(j.selfHosted, true);
  assert.equal(j.costPerRunUsd, 0);
});

test('projectMonthly: rolls up daily and monthly', () => {
  const wf = analyzeWorkflow('ci.yml', BASIC, { minutes: 5 });
  const p = projectMonthly([wf], 20);
  assert.equal(p.totalPerRunUsd, 0.04);
  assert.equal(p.dailyUsd, 0.8);
  assert.equal(p.monthlyUsd, 24);
});

test('flattenRunsOn: handles string, array, and group form', () => {
  assert.deepEqual(flattenRunsOn('ubuntu-latest'), ['ubuntu-latest']);
  assert.deepEqual(flattenRunsOn(['ubuntu-latest', 'self-hosted']), ['ubuntu-latest', 'self-hosted']);
  assert.deepEqual(flattenRunsOn({ group: 'org/runners', labels: ['big'] }), ['org/runners', 'big']);
});
