import { useCallback, useEffect, useRef, useState } from 'react';
import { ReminderContext } from './reminders';
import { useLanguage } from './language';
import { getStationArrivals } from '../lib/arrivals';
import { reminderOccurrence, validReminders } from '../lib/reminders';
import { getServiceDay } from '../lib/service';
import { stations } from '../lib/data';
import { getName } from '../lib/utils';
import { extraText } from '../lib/extraText';

const STORAGE_KEY = 'lrt-reminders';
function readReminders() {
  try { return validReminders(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
  catch { return []; }
}

export function ReminderProvider({ children }) {
  const { language, t } = useLanguage();
  const [reminders, setReminders] = useState(readReminders);
  const [notice, setNotice] = useState(null);
  const delivered = useRef(new Set());
  const showNotice = useCallback((message) => setNotice({ message }), []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders)); }
    catch { /* Browser storage can be disabled; reminders still work in this tab. */ }
  }, [reminders]);

  const removeReminder = useCallback((id) => {
    setReminders((previous) => previous.filter((reminder) => reminder.id !== id));
  }, []);
  const addReminder = useCallback((options) => {
    const createdAt = Date.now();
    const entry = getStationArrivals(options.stationId, 3, createdAt).find((arrival) => arrival.id === options.directionId);
    if (!entry?.departures.length) {
      showNotice(extraText(language, 'reminder_no_train'));
      return false;
    }
    const id = `${options.stationId}:${options.directionId}`;
    const reminder = { ...options, id, createdAt, targetDeparture: entry.departures[0], lastDeparture: null };
    if (!validReminders([reminder]).length) return false;
    setReminders((previous) => [...previous.filter((item) => item.id !== id), reminder]);
    showNotice(extraText(language, 'reminder_saved'));
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try { Promise.resolve(Notification.requestPermission()).catch(() => 'denied'); }
      catch { /* The in-app notice remains available if this browser cannot request permission. */ }
    }
    return true;
  }, [language, showNotice]);

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      const handled = new Map();
      const expired = new Set();
      const messages = [];
      for (const reminder of reminders) {
        if (reminder.repeat === 'once' && reminder.targetDeparture < Math.floor(now / 60_000) * 60_000) {
          expired.add(reminder.id);
          continue;
        }
        const occurrence = reminderOccurrence(reminder, getStationArrivals(reminder.stationId, 100, now), now, getServiceDay(now));
        if (!occurrence) continue;
        const key = reminder.id + ':' + reminder.createdAt + ':' + occurrence.departure;
        if (delivered.current.has(key)) continue;
        delivered.current.add(key);
        handled.set(reminder.id, occurrence.departure);
        const station = stations.find((item) => item.id === reminder.stationId);
        const message = extraText(language, 'reminder_due', {
          station: getName(station.name, language), direction: getName(occurrence.entry.direction, language),
          minutes: Math.max(0, Math.ceil((occurrence.departure - now) / 60_000)),
        });
        messages.push(message);
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try { new Notification(t('reminder_train_arriving_title'), { body: message, tag: key }); }
          catch { /* The in-app notice works when OS notifications are unsupported. */ }
        }
      }
      if (messages.length) setNotice({ message: messages.join('\n') });
      if (handled.size || expired.size) {
        setReminders((previous) => previous
          .filter((item) => !expired.has(item.id) && !(handled.has(item.id) && item.repeat === 'once'))
          .map((item) => handled.has(item.id) ? { ...item, lastDeparture: handled.get(item.id) } : item));
      }
    };
    const timer = setInterval(check, 1000);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, [reminders, language, t]);

  return (
    <ReminderContext.Provider value={{ reminders, addReminder, removeReminder, showNotice }}>
      {children}
      {notice && (
        <div role="status" aria-live="polite" className="fixed top-4 left-4 right-4 z-[10010] mx-auto max-w-lg rounded-2xl bg-slate-900 text-white shadow-xl p-4 flex items-center gap-4">
          <p className="flex-1 text-sm whitespace-pre-line">{notice.message}</p>
          <button type="button" onClick={() => setNotice(null)} aria-label={extraText(language, 'close')} className="px-3 py-2 rounded-lg border border-white/40">×</button>
        </div>
      )}
    </ReminderContext.Provider>
  );
}
