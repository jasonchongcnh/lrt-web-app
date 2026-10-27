import { ArrowLeft, Bell, ChevronRight, FileText, Globe, Moon, Settings, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useLanguage } from '../contexts/language';
import { useReminders } from '../contexts/reminders';
import { useFavorites } from '../hooks/useFavorites';
import { useTheme } from '../hooks/useTheme';
import { stations } from '../lib/data';
import { getStationArrivals } from '../lib/arrivals';
import { getName } from '../lib/utils';
import { extraText } from '../lib/extraText';
import { settingsText } from '../lib/settingsText';

const LANGUAGES = [['zh', '繁體中文'], ['zh-CN', '简体中文'], ['en', 'English'], ['pt', 'Português']];

export default function My() {
  const { t, language, setLanguage } = useLanguage();
  const { reminders, removeReminder } = useReminders();
  const { favorites, toggleFavorite } = useFavorites();
  const { theme, setTheme } = useTheme();
  const text = (key, values) => settingsText(language, key, values);
  const savedStations = favorites.map(id => stations.find(station => station.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <header className="rounded-b-[32px] bg-blue-600 px-6 pb-8 pt-6 text-white shadow-lg">
        <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> {text('back')}
        </Link>
        <h1 className="flex items-center gap-3 text-2xl font-bold"><Settings className="h-6 w-6" />{extraText(language, 'settings')}</h1>
        <p className="mt-2 text-sm text-blue-100">{text('local')}</p>
      </header>

      <div className="mx-auto max-w-3xl space-y-5 p-4">
        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardContent className="space-y-5 p-5">
            <div>
              <label htmlFor="settings-language" className="mb-2 flex items-center gap-2 font-semibold text-slate-700"><Globe className="h-5 w-5 text-blue-500" />{t('my_language')}</label>
              <select id="settings-language" value={language} onChange={event => setLanguage(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-900">
                {LANGUAGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="settings-theme" className="mb-2 flex items-center gap-2 font-semibold text-slate-700"><Moon className="h-5 w-5 text-blue-500" />{text('appearance')}</label>
              <select id="settings-theme" value={theme} onChange={event => setTheme(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-900">
                <option value="light">{text('light')}</option>
                <option value="dark">{text('dark')}</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900"><Star className="h-5 w-5 text-amber-500" />{t('my_favorites')}</h2>
            {savedStations.length === 0 ? <p className="text-sm leading-relaxed text-slate-500">{text('noFavorites')}</p> : (
              <ul className="divide-y divide-slate-100">
                {savedStations.map(station => (
                  <li key={station.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Link to={`/station/${station.id}`} className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg py-2 font-semibold text-blue-600">
                      <span>{getName(station.name, language)}</span><ChevronRight className="h-4 w-4 shrink-0" />
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => toggleFavorite(station.id)} aria-label={`${extraText(language, 'favorite_remove')}: ${getName(station.name, language)}`}>
                      <Trash2 className="h-4 w-4 text-slate-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-900"><Bell className="h-5 w-5 text-blue-500" />{t('my_reminders')}</h2>
            <p className="mb-4 text-xs leading-relaxed text-slate-500">{extraText(language, 'reminder_scope')}</p>
            {reminders.length === 0 ? <p className="text-sm leading-relaxed text-slate-500">{text('noReminders')}</p> : (
              <ul className="divide-y divide-slate-100">
                {reminders.map(reminder => {
                  const station = stations.find(item => item.id === reminder.stationId);
                  if (!station) return null;
                  const direction = getStationArrivals(station.id).find(item => item.id === reminder.directionId);
                  return (
                    <li key={reminder.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1 space-y-1">
                        <Link to={`/station/${station.id}`} className="font-semibold text-blue-600">{getName(station.name, language)}</Link>
                        <p className="text-sm text-slate-700">{t('home_to')} {getName(direction?.direction, language)}</p>
                        <p className="text-xs text-slate-500">{text('before', { minutes: reminder.leadMinutes })} · {t(`reminder_${reminder.repeat}`)}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeReminder(reminder.id)} aria-label={`${extraText(language, 'reminder_cancel_action')}: ${getName(station.name, language)}`}>
                        <Trash2 className="h-4 w-4 text-slate-500" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <details className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer font-bold text-slate-900"><FileText className="mr-2 inline h-5 w-5 text-blue-500" />{text('info')}</summary>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
            <p>{text('about')}</p>
            <p>{text('privacy')}</p>
            <a href="https://mlm.com.mo/tc/route.html" target="_blank" rel="noreferrer" className="inline-block font-semibold text-blue-600 underline">{text('source')}</a>
          </div>
        </details>
      </div>
    </div>
  );
}
