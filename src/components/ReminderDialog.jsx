import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/language';
import { useReminders } from '../contexts/reminders';
import { LEAD_TIMES } from '../lib/reminders';
import { extraText } from '../lib/extraText';
import { getName } from '../lib/utils';
import { Button } from './ui/button';

export default function ReminderDialog({ stationId, direction, onClose }) {
  const { language, t } = useLanguage();
  const { addReminder } = useReminders();
  const [leadMinutes, setLeadMinutes] = useState(1);
  const [repeat, setRepeat] = useState('once');
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog ref={dialogRef} onCancel={onClose} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}
      aria-labelledby="reminder-title" className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl p-6 backdrop:bg-black/50 shadow-xl">
      <form onSubmit={(event) => {
        event.preventDefault();
        if (addReminder({ stationId, directionId: direction.id, leadMinutes, repeat })) onClose();
      }} className="space-y-5">
        <h2 id="reminder-title" className="text-lg font-bold">{t('reminder_title')}</h2>
        <p className="text-sm">{getName(direction.direction, language)}</p>
        <label className="block text-sm">{t('reminder_time_before')}
          <select value={leadMinutes} onChange={(event) => setLeadMinutes(Number(event.target.value))} className="block w-full border rounded-xl p-3 mt-2">
            {LEAD_TIMES.map((minutes) => <option key={minutes} value={minutes}>{minutes} {t('home_min')}</option>)}
          </select>
        </label>
        <label className="block text-sm">{t('reminder_repeat')}
          <select value={repeat} onChange={(event) => setRepeat(event.target.value)} className="block w-full border rounded-xl p-3 mt-2">
            <option value="once">{t('reminder_once')}</option>
            <option value="weekdays">{extraText(language, 'reminder_weekdays_trains')}</option>
            <option value="weekends">{extraText(language, 'reminder_weekends_trains')}</option>
          </select>
        </label>
        <p className="text-xs text-slate-500">{extraText(language, 'reminder_scope')}</p>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose}>{t('reminder_cancel')}</Button>
          <Button type="submit" className="flex-1 bg-blue-600">{t('reminder_save')}</Button>
        </div>
      </form>
    </dialog>
  );
}
