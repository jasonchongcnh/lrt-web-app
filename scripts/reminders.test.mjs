import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getStationArrivals, STATION_DIRECTIONS } from '../src/lib/arrivals.js';
import { reminderOccurrence, validReminders } from '../src/lib/reminders.js';
import { getServiceDay } from '../src/lib/service.js';

const now = Date.parse('2026-09-07T08:01:00+08:00');
const day = getServiceDay(now);
const arrivals = getStationArrivals('1', 3, now);
const departure = arrivals[0].departures[0];
const reminder = { id: '1:taipa', stationId: '1', directionId: 'taipa', leadMinutes: 15,
  repeat: 'once', targetDeparture: departure, createdAt: now, lastDeparture: null };

test('all 28 station directions share the same stable arrival interface', () => {
  assert.equal(Object.keys(STATION_DIRECTIONS).length, 15);
  assert.equal(Object.values(STATION_DIRECTIONS).flat().length, 28);
  for (const stationId of Object.keys(STATION_DIRECTIONS)) {
    for (const entry of getStationArrivals(stationId, 3, now)) {
      assert.equal(new Set(entry.departures).size, entry.departures.length);
      assert.ok(entry.times.every(value => Number.isInteger(value) && value >= 0));
      assert.equal(entry.times.length, entry.departures.length);
      for (const language of ['en', 'zh', 'zh-CN', 'pt']) assert.ok(entry.direction[language]);
    }
  }
  assert.deepEqual(getStationArrivals('unknown', 3, now), []);
  assert.deepEqual(getStationArrivals('__proto__', 3, now), []);
});

test('arrival identity stays fixed while its countdown changes', () => {
  const first = getStationArrivals('1', 3, now)[0];
  const later = getStationArrivals('1', 3, now + 60_000)[0];
  const common = first.departures.filter(value => later.departures.includes(value));
  assert.ok(common.length);
  for (const value of common) {
    assert.equal(first.times[first.departures.indexOf(value)] - later.times[later.departures.indexOf(value)], 1);
  }
  assert.equal(first.id, later.id);
});

test('out-of-service directions have no synthetic countdown or reminder occurrence', () => {
  const midnightGap = Date.parse('2026-09-07T03:00:00+08:00');
  for (const id of Object.keys(STATION_DIRECTIONS)) {
    for (const entry of getStationArrivals(id, 3, midnightGap)) {
      assert.deepEqual(entry.times, []);
      assert.equal(entry.status, 'Out of Service');
    }
  }
  assert.equal(reminderOccurrence(reminder, [], now, day), null);
});

test('only saved, valid directions and options can become reminders', () => {
  assert.deepEqual(validReminders(null), []);
  assert.deepEqual(validReminders([null, {}, { ...reminder, stationId: '__proto__' }, { ...reminder, stationId: 'bad' },
    { ...reminder, directionId: 'barra' }, { ...reminder, leadMinutes: -1 },
    { ...reminder, repeat: 'invalid' }, { ...reminder, targetDeparture: Infinity }]), []);
  assert.deepEqual(validReminders([reminder]), [reminder]);
});

test('a one-time reminder is tied to its chosen train and threshold', () => {
  assert.ok(reminderOccurrence(reminder, arrivals, now, day));
  assert.equal(reminderOccurrence({ ...reminder, leadMinutes: 1 }, arrivals, departure - 2 * 60_000, day), null);
  assert.ok(reminderOccurrence({ ...reminder, leadMinutes: 1 }, arrivals, departure - 60_000, day));
  assert.equal(reminderOccurrence(reminder, arrivals, departure + 60_000, day), null);
  assert.equal(reminderOccurrence({ ...reminder, lastDeparture: departure }, arrivals, now, day), null);
  const nextTrain = getStationArrivals('1', 3, departure + 60_000);
  assert.equal(reminderOccurrence(reminder, nextTrain, departure + 60_000, day), null);
});

test('recurring reminders deduplicate each train while allowing a later departure', () => {
  const recurring = { ...reminder, repeat: 'weekdays' };
  assert.ok(reminderOccurrence(recurring, arrivals, now, day));
  const notified = { ...recurring, lastDeparture: departure };
  const next = reminderOccurrence(notified, arrivals, now, day);
  assert.ok(next.departure > departure);
  assert.equal(reminderOccurrence({ ...notified, lastDeparture: arrivals[0].departures.at(-1) }, arrivals, now, day), null);
  const later = getStationArrivals('1', 3, departure + 60_000);
  const occurrence = reminderOccurrence(notified, later, departure + 60_000, getServiceDay(departure + 60_000));
  assert.ok(occurrence);
  assert.ok(occurrence.departure > departure);
  assert.equal(reminderOccurrence(recurring, arrivals, now, { day: 6 }), null);
  assert.equal(reminderOccurrence({ ...recurring, repeat: 'weekends' }, arrivals, now, day), null);
  assert.ok(reminderOccurrence({ ...recurring, repeat: 'weekends' }, arrivals, now, { day: 0 }));
});
