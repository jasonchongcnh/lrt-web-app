import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getServiceDay, isWithinServiceHours } from '../src/lib/service.js';
import { isCalendarKnown, isPublicHoliday } from '../src/lib/holidays.js';
import { translations } from '../src/lib/translations.js';
import { getNextBarraArrivals, getNextAirportArrivals } from '../src/lib/timetable.js';

test('official public holidays cover 2026 and 2027 without public-employee rest days', () => {
  assert.equal(isCalendarKnown(2026), true);
  assert.equal(isCalendarKnown(2027), true);
  for (const date of ['2026-02-17', '2026-04-03', '2026-10-02', '2027-02-08', '2027-03-26', '2027-05-13', '2027-06-09', '2027-09-16', '2027-10-08']) {
    assert.equal(isPublicHoliday(date), true, date);
    assert.equal(getServiceDay(`${date}T08:00:00+08:00`).dayType, 'weekend', date);
  }
  for (const date of ['2026-04-06', '2026-04-07', '2026-05-25', '2026-09-28', '2026-10-19', '2026-12-21', '2027-02-09', '2027-02-10', '2027-03-29', '2027-05-03', '2027-10-04', '2027-12-27']) {
    assert.equal(isPublicHoliday(date), false, date);
    assert.equal(getServiceDay(`${date}T08:00:00+08:00`).dayType, 'mon_thu', date);
  }
});

test('unreviewed years remain explicitly marked as unknown', () => {
  assert.equal(isCalendarKnown(2028), false);
  assert.equal(isPublicHoliday('2028-02-02'), null);
  const day = getServiceDay('2028-02-02T08:00:00+08:00');
  assert.equal(day.calendarKnown, false);
  assert.equal(day.holiday, null);
});

test('Macau service-day selection is independent of timezone notation and rolls over at 04:00', () => {
  const expected = getServiceDay('2027-03-27T00:05:00+08:00');
  assert.equal(expected.date, '2027-03-26');
  assert.equal(expected.dayType, 'weekend');
  assert.equal(expected.hour, 24);
  assert.equal(expected.operatingMinute, 1445);
  assert.deepEqual(getServiceDay('2027-03-26T16:05:00Z'), expected);
  assert.deepEqual(getServiceDay('2027-03-26T09:05:00-07:00'), expected);
  assert.deepEqual(getServiceDay('2027-03-26T21:35:00+05:30'), expected);
  assert.equal(getServiceDay('2027-03-29T03:59:00+08:00').date, '2027-03-28');
  const monday = getServiceDay('2027-03-29T04:00:00+08:00');
  assert.equal(monday.date, '2027-03-29');
  assert.equal(monday.dayType, 'mon_thu');
  assert.equal(monday.hour, 4);
  assert.equal(getServiceDay('2028-01-01T00:05:00+08:00').calendarKnown, true);
  assert.equal(getServiceDay('2028-01-01T04:00:00+08:00').calendarKnown, false);
});

test('station service status respects exact first/last and after-midnight hours', () => {
  const hours = { first: '06:30', last: '24:11' };
  assert.equal(isWithinServiceHours(hours, 6 * 60 + 29), false);
  assert.equal(isWithinServiceHours(hours, 6 * 60 + 30), true);
  assert.equal(isWithinServiceHours(hours, 24 * 60 + 11), true);
  assert.equal(isWithinServiceHours(hours, 24 * 60 + 12), false);
  assert.equal(isWithinServiceHours(null, 12 * 60), false);
});

test('arrival getters accept an explicit clock for stable countdowns and reminders', () => {
  assert.deepEqual(getNextBarraArrivals(2, Date.parse('2026-09-07T06:30:00+08:00')), [0, 10]);
  assert.deepEqual(getNextBarraArrivals(2, Date.parse('2026-09-07T06:31:00+08:00')), [9, 19]);
  const before = getNextAirportArrivals('Barra', 2, Date.parse('2026-09-07T08:00:00+08:00'));
  const after = getNextAirportArrivals('Barra', 2, Date.parse('2026-09-07T08:01:00+08:00'));
  if (before[0] > 0) assert.equal(after[0], before[0] - 1);
  assert.equal(getNextBarraArrivals(0, Date.parse('2026-09-07T06:30:00+08:00')), null);
});

test('all four locales provide the same nonempty translation keys', () => {
  const keys = Object.keys(translations.en).sort();
  for (const [language, values] of Object.entries(translations)) {
    assert.deepEqual(Object.keys(values).sort(), keys, language);
    for (const value of Object.values(values)) assert.equal(typeof value === 'string' && value.length > 0, true, language);
  }
});
