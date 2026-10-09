import assert from 'node:assert/strict';
import test from 'node:test';
import { buildReportSummary } from '../src/services/reportAnalytics.ts';

const startDate = new Date('2026-10-01T00:00:00.000Z');
const endDate = new Date('2026-10-07T23:59:59.999Z');

test('summarizes incident totals, categories, status, trend, and coarse locations', () => {
  const records = [
    { id: '1', occurredAt: new Date('2026-10-01T08:00:00Z'), category: 'snare', status: 'SUBMITTED', latitude: 7.873, longitude: 80.771, area: null },
    { id: '2', occurredAt: new Date('2026-10-01T12:00:00Z'), category: 'snare', status: 'REVIEWED', latitude: 7.879, longitude: 80.779, area: null },
    { id: '3', occurredAt: new Date('2026-10-07T12:00:00Z'), category: 'carcass', status: 'SUBMITTED', latitude: null, longitude: null, area: null },
  ];

  const summary = buildReportSummary('incidents', records, 7, startDate, endDate);

  assert.equal(summary.total, 3);
  assert.equal(summary.categories[0].label, 'Snare');
  assert.equal(summary.categories[0].count, 2);
  assert.equal(summary.statuses[0].count, 2);
  assert.equal(summary.trend.length, 7);
  assert.equal(summary.trend[0].count, 2);
  assert.equal(summary.areas[0].label, '7.9, 80.8');
  assert.equal(summary.recordsWithoutArea, 1);
});

test('returns stable empty summaries without inventing report data', () => {
  const summary = buildReportSummary('community', [], 30, startDate, endDate);

  assert.equal(summary.total, 0);
  assert.deepEqual(summary.categories, []);
  assert.deepEqual(summary.statuses, []);
  assert.deepEqual(summary.areas, []);
  assert.equal(summary.trend.length, 5);
  assert.equal(summary.averagePerWeek, 0);
});

test('counts records with incomplete category and location fields', () => {
  const records = [
    { id: '1', occurredAt: new Date('2026-10-03T12:00:00Z'), category: null, status: null, latitude: null, longitude: 80.7, area: null },
  ];

  const summary = buildReportSummary('incidents', records, 7, startDate, endDate);

  assert.equal(summary.recordsWithoutCategory, 1);
  assert.equal(summary.recordsWithoutArea, 1);
});