import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as timetable from '../src/lib/timetable.js';

// Keep this independent of the application's station/platform dispatch tables.
// The fixture is a reviewed transcription of the archived official images.
const fixtureUrl = new URL('./fixtures/2026-09/timetables.json', import.meta.url);
const DAY_TYPES = ['mon_thu', 'fri', 'weekend'];
const DIRECTIONS = [
  ['1', 'barraTimetable', 'getNextBarraArrivals', []],
  ['2', 'oceanPlatform1ToTaipaFerryTimetable', 'getNextOceanArrivals', ['Taipa']],
  ['2', 'oceanPlatform2ToBarraTimetable', 'getNextOceanArrivals', ['Barra']],
  ['3', 'jockeyClubPlatform1ToTaipaFerryTimetable', 'getNextJockeyClubArrivals', ['Taipa']],
  ['3', 'jockeyClubPlatform2ToBarraTimetable', 'getNextJockeyClubArrivals', ['Barra']],
  ['4', 'stadiumPlatform1ToTaipaFerryTimetable', 'getNextStadiumArrivals', ['Taipa']],
  ['4', 'stadiumPlatform2ToBarraTimetable', 'getNextStadiumArrivals', ['Barra']],
  ['5', 'paiKokPlatform1ToTaipaFerryTimetable', 'getNextPaiKokArrivals', ['Taipa']],
  ['5', 'paiKokPlatform2ToBarraTimetable', 'getNextPaiKokArrivals', ['Barra']],
  ['6', 'cotaiOestePlatform1ToTaipaFerryTimetable', 'getNextCotaiOesteArrivals', ['Taipa']],
  ['6', 'cotaiOestePlatform2ToBarraTimetable', 'getNextCotaiOesteArrivals', ['Barra']],
  ['7', 'lotusTaipaPlatform1ToTaipaFerryTimetable', 'getNextLotusArrivals', ['Taipa']],
  ['7', 'lotusTaipaPlatform2ToBarraTimetable', 'getNextLotusArrivals', ['Barra']],
  ['7', 'lotusHengqinPlatform3ToHengqinTimetable', 'getNextLotusHengqinArrivals', []],
  ['8', 'hospitalTaipaPlatform1ToTaipaFerryTimetable', 'getNextHospitalArrivals', ['Taipa']],
  ['8', 'hospitalTaipaPlatform2ToBarraTimetable', 'getNextHospitalArrivals', ['Barra']],
  ['8', 'hospitalSPVPlatform3ToSeacPaiVanTimetable', 'getNextHospitalSPVArrivals', []],
  ['9', 'eastAsianGamesPlatform1ToTaipaFerryTimetable', 'getNextEastAsianGamesArrivals', ['Taipa']],
  ['9', 'eastAsianGamesPlatform2ToBarraTimetable', 'getNextEastAsianGamesArrivals', ['Barra']],
  ['10', 'cotaiLestePlatform1ToTaipaFerryTimetable', 'getNextCotaiLesteArrivals', ['Taipa']],
  ['10', 'cotaiLestePlatform2ToBarraTimetable', 'getNextCotaiLesteArrivals', ['Barra']],
  ['11', 'mustPlatform1ToTaipaFerryTimetable', 'getNextMustArrivals', ['Taipa']],
  ['11', 'mustPlatform2ToBarraTimetable', 'getNextMustArrivals', ['Barra']],
  ['12', 'airportPlatform1ToTaipaFerryTimetable', 'getNextAirportArrivals', ['Taipa']],
  ['12', 'airportPlatform2ToBarraTimetable', 'getNextAirportArrivals', ['Barra']],
  ['13', 'taipaFerryTimetableToBarra', 'getNextTaipaFerryArrivals', []],
  ['14', 'seacPaiVanToHospitalTimetable', 'getNextSeacPaiVanArrivals', []],
  ['15', 'hengqinToLotusTimetable', 'getNextHengqinArrivals', []],
];
const directionNames = DIRECTIONS.map(([, name]) => name).sort();
const exportedSchedules = Object.fromEntries(
  Object.entries(timetable).filter(([, value]) => value && typeof value === 'object'),
);
const NativeDate = globalThis.Date;

// Model the device's local date methods explicitly, so these checks run on any
// host timezone without depending on process.env.TZ support on Windows.
function withClock(instant, timezoneOffset, callback) {
  const timestamp = typeof instant === 'number' ? instant : NativeDate.parse(instant);
  assert.ok(Number.isFinite(timestamp), 'The test instant must be valid');
  class FixedDate extends NativeDate {
    constructor(...args) {
      super(...(args.length ? args : [timestamp]));
    }
    static now() { return timestamp; }
    localDate() { return new NativeDate(this.getTime() - timezoneOffset * 60_000); }
    getTimezoneOffset() { return timezoneOffset; }
    getHours() { return this.localDate().getUTCHours(); }
    getMinutes() { return this.localDate().getUTCMinutes(); }
    getDay() { return this.localDate().getUTCDay(); }
    getDate() { return this.localDate().getUTCDate(); }
    getMonth() { return this.localDate().getUTCMonth(); }
    getFullYear() { return this.localDate().getUTCFullYear(); }
    setDate(day) {
      const local = this.localDate();
      local.setUTCDate(day);
      return this.setTime(local.getTime() + timezoneOffset * 60_000);
    }
  }
  const previousDate = globalThis.Date;
  globalThis.Date = FixedDate;
  try {
    return callback();
  } finally {
    globalThis.Date = previousDate;
  }
}

function flattened(schedule) {
  return Object.entries(schedule)
    .flatMap(([hour, minutes]) => minutes.map((minute) => Number(hour) * 60 + minute))
    .sort((a, b) => a - b);
}

function expectedArrivals(schedule, operatingMinute, count) {
  const upcoming = flattened(schedule)
    .filter((departure) => departure >= operatingMinute && departure <= operatingMinute + 60)
    .slice(0, count)
    .map((departure) => departure - operatingMinute);
  return upcoming.length ? upcoming : null;
}

function operatingInstant(date, minute) {
  return NativeDate.parse(date + 'T00:00:00+08:00') + minute * 60_000;
}

function validateScheduleSet(data, label) {
  assert.deepEqual(Object.keys(data).sort(), directionNames, label + ': exact direction coverage');
  for (const [name, table] of Object.entries(data)) {
    assert.deepEqual(Object.keys(table).sort(), [...DAY_TYPES].sort(), label + '/' + name + ': day types');
    for (const dayType of DAY_TYPES) {
      const schedule = table[dayType];
      assert.ok(schedule && typeof schedule === 'object' && !Array.isArray(schedule), name + '/' + dayType + ': schedule object');
      const hours = Object.keys(schedule);
      assert.ok(hours.length > 0, name + '/' + dayType + ': nonempty schedule');
      let previousDeparture = -1;
      for (const hourKey of hours) {
        const hour = Number(hourKey);
        assert.ok(Number.isInteger(hour) && String(hour) === hourKey && hour >= 4 && hour < 28,
          name + '/' + dayType + ': hour must be an operating-day hour from 4 through 27');
        const minutes = schedule[hourKey];
        assert.ok(Array.isArray(minutes) && minutes.length > 0, name + '/' + dayType + '/' + hour + ': nonempty minute list');
        for (const minute of minutes) {
          assert.ok(Number.isInteger(minute) && minute >= 0 && minute < 60,
            name + '/' + dayType + '/' + hour + ': minute must be 0 through 59');
          const departure = hour * 60 + minute;
          assert.ok(departure > previousDeparture,
            name + '/' + dayType + '/' + hour + ': departures must be chronological without duplicates');
          previousDeparture = departure;
        }
      }
    }
  }
}

let fixture;
let fixtureError;
try {
  fixture = JSON.parse(readFileSync(fixtureUrl, 'utf8'));
} catch (error) {
  fixtureError = error;
}

// Top-level tests run sequentially; the clock override is always synchronous
// and restored before the next assertion/test can run.
test('all 28 exported directions contain valid chronological schedules', () => {
  assert.equal(DIRECTIONS.length, 28);
  validateScheduleSet(exportedSchedules, 'application');
});

test('all 84 schedules exactly match the archived September 2026 transcription', () => {
  assert.ifError(fixtureError);
  validateScheduleSet(fixture, 'fixture');
  for (const name of directionNames) {
    for (const dayType of DAY_TYPES) {
      assert.deepEqual(timetable[name][dayType], fixture[name][dayType], name + '/' + dayType);
    }
  }
});

const SCENARIOS = [
  ['ordinary Monday', '2026-09-07T08:01:00+08:00', 'mon_thu', 8 * 60 + 1],
  ['ordinary Friday', '2026-09-11T23:55:00+08:00', 'fri', 23 * 60 + 55],
  ['Saturday', '2026-09-12T08:01:00+08:00', 'weekend', 8 * 60 + 1],
  ['Sunday', '2026-09-13T08:01:00+08:00', 'weekend', 8 * 60 + 1],
  ['weekday public holiday', '2026-10-01T08:01:00+08:00', 'weekend', 8 * 60 + 1],
  ['Friday public holiday', '2026-10-02T08:01:00+08:00', 'weekend', 8 * 60 + 1],
  ['Saturday midnight uses Friday', '2026-09-12T00:05:00+08:00', 'fri', 24 * 60 + 5],
  ['Monday midnight uses Sunday', '2026-09-14T00:05:00+08:00', 'weekend', 24 * 60 + 5],
  ['holiday midnight uses preceding weekday', '2026-10-01T00:05:00+08:00', 'mon_thu', 24 * 60 + 5],
  ['after holiday midnight uses holiday', '2026-10-03T00:05:00+08:00', 'weekend', 24 * 60 + 5],
  ['03:59 remains previous operating day', '2026-09-12T03:59:00+08:00', 'fri', 27 * 60 + 59],
  ['04:00 starts the next operating day', '2026-09-12T04:00:00+08:00', 'weekend', 4 * 60],
];

for (const [label, instant, dayType, minute] of SCENARIOS) {
  test('arrivals: ' + label + ' in different device timezones', () => {
    assert.ifError(fixtureError);
    // JavaScript offsets: Macau, UTC, UTC-7, and UTC+5:30.
    for (const offset of [-480, 0, 420, -330]) {
      withClock(instant, offset, () => {
        for (const [, name, getter, args] of DIRECTIONS) {
          for (const count of [1, 2, 3, 100]) {
            assert.deepEqual(timetable[getter](...args, count), expectedArrivals(fixture[name][dayType], minute, count),
              label + '/' + name + '/offset=' + offset + '/count=' + count);
          }
        }
      });
    }
  });
}


test('operating-day cutoff and holiday selection use the date before midnight', () => {
  // Distinct sentinels make day selection observable even during the real
  // overnight service gap, when every real timetable would return null.
  const table = timetable.barraTimetable;
  const original = Object.fromEntries(DAY_TYPES.map((dayType) => [dayType, table[dayType]]));
  try {
    table.mon_thu = { 4: [0], 24: [3], 27: [59] };
    table.fri = { 4: [1], 24: [4], 27: [58] };
    table.weekend = { 4: [2], 24: [5], 27: [57] };
    const cases = [
      ['2026-09-12T03:57:00+08:00', [1]],
      ['2026-09-12T03:59:00+08:00', null],
      ['2026-09-12T04:00:00+08:00', [2]],
      ['2026-09-14T03:57:00+08:00', [0]],
      ['2026-09-14T04:00:00+08:00', [0]],
      ['2026-10-01T00:00:00+08:00', [3]],
      ['2026-10-03T00:00:00+08:00', [5]],
    ];
    for (const offset of [-480, 0, 420, -330]) {
      for (const [instant, expected] of cases) {
        withClock(instant, offset, () => {
          assert.deepEqual(timetable.getNextBarraArrivals(3), expected, instant + '/offset=' + offset);
        });
      }
    }
  } finally {
    Object.assign(table, original);
  }
});

for (const [dayType, date] of [['mon_thu', '2026-09-07'], ['fri', '2026-09-11'], ['weekend', '2026-09-12']]) {
  test('arrival boundaries for every direction: ' + dayType, () => {
    assert.ifError(fixtureError);
    for (const [, name, getter, args] of DIRECTIONS) {
      const departures = flattened(fixture[name][dayType]);
      const first = departures[0];
      const last = departures[departures.length - 1];
      // Check all departure instants, hour transitions, and both sides of the
      // 60-minute lookup window. Times >= 28:00 belong to a different day.
      const minutes = new Set([...departures, first - 61, first - 60, first - 1, last + 1]);
      for (let hour = 6; hour <= 24; hour += 1) minutes.add(hour * 60 - 1);
      for (const minute of minutes) {
        if (minute < 4 * 60 || minute >= 28 * 60) continue;
        withClock(operatingInstant(date, minute), -480, () => {
          assert.deepEqual(timetable[getter](...args, 3), expectedArrivals(fixture[name][dayType], minute, 3),
            name + '/' + dayType + '/operating-minute=' + minute);
        });
      }
    }
  });
}

test('service hours cover every platform at all 15 stations, including extended hours', () => {
  assert.ifError(fixtureError);
  const format = (minute) => String(Math.floor(minute / 60)).padStart(2, '0') + ':' + String(minute % 60).padStart(2, '0');
  for (let stationId = 1; stationId <= 15; stationId += 1) {
    const platformNames = DIRECTIONS.filter(([id]) => id === String(stationId)).map(([, name]) => name);
    const expected = Object.fromEntries(DAY_TYPES.map((dayType) => {
      const departures = platformNames.flatMap((name) => flattened(fixture[name][dayType]));
      return [dayType, { first: format(Math.min(...departures)), last: format(Math.max(...departures)) }];
    }));
    assert.deepEqual(timetable.getStationServiceHours(String(stationId)), expected, 'station ' + stationId);
  }
  assert.deepEqual(timetable.getStationServiceHours('unknown'), { mon_thu: null, fri: null, weekend: null });
});
