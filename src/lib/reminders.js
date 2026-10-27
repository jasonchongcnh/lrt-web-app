import { STATION_DIRECTIONS } from './arrivals.js';

export const LEAD_TIMES = [1, 5, 10, 15];
export const REPEATS = ['once', 'weekdays', 'weekends'];

export function validReminders(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item.id === 'string'
    && typeof item.stationId === 'string' && Object.hasOwn(STATION_DIRECTIONS, item.stationId)
    && STATION_DIRECTIONS[item.stationId].some((direction) => direction.id === item.directionId)
    && LEAD_TIMES.includes(item.leadMinutes) && REPEATS.includes(item.repeat)
    && Number.isFinite(item.createdAt)
    && (item.targetDeparture == null || Number.isFinite(item.targetDeparture))
    && (item.lastDeparture == null || Number.isFinite(item.lastDeparture)));
}

export function reminderOccurrence(reminder, arrivals, now, serviceDay) {
  if (reminder.repeat === 'weekdays' && (serviceDay.day === 0 || serviceDay.day === 6)) return null;
  if (reminder.repeat === 'weekends' && serviceDay.day !== 0 && serviceDay.day !== 6) return null;
  const entry = arrivals.find((arrival) => arrival.id === reminder.directionId);
  if (!entry) return null;
  const minute = Math.floor(now / 60_000) * 60_000;
  const departure = reminder.repeat === 'once'
    ? reminder.targetDeparture
    : entry.departures.find((time) => time >= minute && time > (reminder.lastDeparture ?? -1)
      && time - minute <= reminder.leadMinutes * 60_000);
  if (departure == null || departure < minute || departure <= (reminder.lastDeparture ?? -1)) return null;
  if (!entry.departures.includes(departure) || departure - minute > reminder.leadMinutes * 60_000) return null;
  return { departure, entry };
}
