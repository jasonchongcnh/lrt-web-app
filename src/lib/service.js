import { isCalendarKnown, isPublicHoliday } from './holidays.js';

const MACAU_OFFSET_MS = 8 * 60 * 60 * 1000;
const pad = (value) => String(value).padStart(2, '0');

// Use UTC accessors on a shifted timestamp so device timezone and DST cannot
// alter Macau's calendar day. Departures before 04:00 belong to the prior day.
export const getServiceDay = (timestamp = Date.now()) => {
  const macau = new Date(new Date(timestamp).getTime() + MACAU_OFFSET_MS);
  if (!Number.isFinite(macau.getTime())) throw new RangeError('Invalid service timestamp');
  const hour = macau.getUTCHours();
  const minute = macau.getUTCMinutes();
  if (hour < 4) macau.setUTCDate(macau.getUTCDate() - 1);
  const year = macau.getUTCFullYear();
  const date = `${year}-${pad(macau.getUTCMonth() + 1)}-${pad(macau.getUTCDate())}`;
  const day = macau.getUTCDay();
  const operatingHour = hour < 4 ? hour + 24 : hour;
  const holiday = isPublicHoliday(date);
  return {
    date,
    year,
    day,
    hour: operatingHour,
    minute,
    operatingMinute: operatingHour * 60 + minute,
    dayType: holiday || day === 0 || day === 6 ? 'weekend' : day === 5 ? 'fri' : 'mon_thu',
    calendarKnown: isCalendarKnown(year),
    holiday,
  };
};

export const isWithinServiceHours = (hours, operatingMinute) => {
  if (!hours) return false;
  const toMinutes = (value) => {
    const [hour, minute] = value.split(':').map(Number);
    return hour * 60 + minute;
  };
  return operatingMinute >= toMinutes(hours.first) && operatingMinute <= toMinutes(hours.last);
};
