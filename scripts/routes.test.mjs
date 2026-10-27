import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  LINES,
  adjustedStops,
  calculateFare,
  calculateTravelTime,
  fareForStops,
  pathToSegments,
  planRoute,
  shortestPath,
} from '../src/lib/routes.js';

test('Airport trips do not accidentally match the Barra–Ocean crossing', () => {
  assert.deepEqual(shortestPath('12', '9'), ['12', '11', '10', '9']);
  assert.deepEqual(calculateFare('12', '9', 'single'), { stops: 3, price: 6 });
  assert.deepEqual(calculateFare('9', '12', 'single'), { stops: 3, price: 6 });
  assert.equal(adjustedStops('12', '13'), 1);
  assert.equal(adjustedStops('12', '11'), 1);
});

test('each sea crossing counts as two fare stops in either direction', () => {
  assert.equal(adjustedStops('1', '2'), 2);
  assert.equal(adjustedStops('2', '1'), 2);
  assert.equal(adjustedStops('7', '15'), 2);
  assert.equal(adjustedStops('15', '7'), 2);
  assert.equal(adjustedStops('1', '15'), 9);
  assert.equal(adjustedStops('15', '1'), 9);
});

test('Union Hospital fare counting follows the endpoint rule', () => {
  assert.equal(adjustedStops('6', '9'), 2);
  assert.equal(adjustedStops('6', '10'), 3);
  assert.equal(adjustedStops('8', '9'), 1);
  assert.equal(adjustedStops('14', '9'), 2);
  assert.equal(adjustedStops('14', '15'), 4);
  assert.equal(adjustedStops('15', '13'), 7);
});

test('branch journeys retain every transfer and physical ride stop', () => {
  const route = planRoute('14', '15');
  assert.deepEqual(route, {
    path: ['14', '8', '7', '15'],
    legs: [
      { line: 'SeacPaiVan', from: '14', to: '8', stops: 1 },
      { line: 'Taipa', from: '8', to: '7', stops: 1 },
      { line: 'Hengqin', from: '7', to: '15', stops: 1 },
    ],
    time: 6,
  });
  assert.equal(planRoute('1', '3').time, 7);
});

test('staying at any station has zero fare and duration for all ticket types', () => {
  for (let id = 1; id <= 15; id += 1) {
    const station = String(id);
    assert.deepEqual(planRoute(station, station), { path: [station], legs: [], time: 0 });
    for (const type of ['single', 'stored', 'student', 'free']) {
      assert.deepEqual(calculateFare(station, station, type), { stops: 0, price: 0 });
    }
  }
});

test('fare boundaries and concessions share the configured bands', () => {
  for (const [stops, price] of [[1, 6], [3, 6], [4, 8], [6, 8], [7, 10], [9, 10], [10, 12], [12, 12]]) {
    assert.equal(fareForStops(stops, 'single'), price);
    assert.equal(fareForStops(stops, 'stored'), price / 2);
    assert.equal(fareForStops(stops, 'student'), price / 4);
    assert.equal(fareForStops(stops, 'free'), 0);
  }
});

test('all station pairs have symmetric paths, durations, and fares', () => {
  const ids = [...new Set(Object.values(LINES).flat())];
  assert.equal(ids.length, 15);
  for (const start of ids) {
    for (const end of ids) {
      const forward = planRoute(start, end);
      const reverse = planRoute(end, start);
      assert.deepEqual(forward.path, [...reverse.path].reverse(), `${start}–${end}: path`);
      assert.equal(forward.path.length, new Set(forward.path).size, `${start}–${end}: no repeated station`);
      assert.equal(forward.time, reverse.time, `${start}–${end}: duration`);
      assert.equal(forward.legs.reduce((sum, leg) => sum + leg.stops, 0), forward.path.length - 1);
      for (const type of ['single', 'stored', 'student', 'free']) {
        assert.deepEqual(calculateFare(start, end, type), calculateFare(end, start, type), `${start}–${end}/${type}`);
      }
    }
  }
});

test('invalid stations and fare types cannot produce a quoted fare', () => {
  for (const invalid of ['unknown', '', null, undefined, 1, '__proto__']) {
    assert.equal(shortestPath(invalid, '1'), null);
    assert.equal(shortestPath('1', invalid), null);
    assert.equal(planRoute(invalid, invalid), null);
    assert.deepEqual(calculateFare(invalid, '1'), { stops: null, price: null });
  }
  assert.equal(fareForStops(-1), null);
  assert.equal(fareForStops(1.5), null);
  assert.equal(fareForStops(null), null);
  assert.equal(fareForStops(3, 'max'), null);
  assert.equal(fareForStops(0, 'unknown'), null);
  assert.deepEqual(pathToSegments(['1', '15']), []);
  assert.equal(calculateTravelTime(['1', '15']), null);
});
