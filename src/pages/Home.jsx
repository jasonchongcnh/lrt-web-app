import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, MapPin, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { stations } from '../lib/data';
import { LINES } from '../lib/routes';
import { getStationArrivals } from '../lib/arrivals';
import { getServiceDay } from '../lib/service';
import { cn, getName } from '../lib/utils';
import { extraText } from '../lib/extraText';
import { useLanguage } from '../contexts/language';
import { useReminders } from '../contexts/reminders';
import { useClock } from '../hooks/useClock';

const LINE_KEYS = { Taipa: 'line_taipa', SeacPaiVan: 'line_seacpaivan', Hengqin: 'line_hengqin' };
function distance(a, b) {
  const rad = (degrees) => degrees * Math.PI / 180;
  const deltaLat = rad(a.lat - b.lat);
  const deltaLon = rad(a.lon - b.lon);
  const haversine = Math.sin(deltaLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(deltaLon / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const { reminders, addReminder, removeReminder, showNotice } = useReminders();
  const now = useClock();
  const [selection, setSelection] = useState({ line: 'Taipa', stationId: '1' });
  const [geo, setGeo] = useState({ phase: 'loading', location: null, accuracy: null, noNearby: false });
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const mapRef = useRef(null);
  const requestRef = useRef(0);
  const mountedRef = useRef(false);
  const nearbyStation = stations.find((station) => station.id === selection.stationId);
  const currentArrivals = getStationArrivals(selection.stationId, 3, now);
  const selectStation = useCallback((stationId, line = null, fromGeolocation = false) => {
    if (!fromGeolocation) {
      requestRef.current += 1;
      setGeo((previous) => ({ ...previous, phase: previous.phase === 'loading' ? 'idle' : previous.phase }));
    }
    setSelection((previous) => ({
      stationId,
      line: line || (LINES[previous.line].includes(stationId) ? previous.line
        : Object.keys(LINES).find((key) => LINES[key].includes(stationId))),
    }));
  }, []);

  const requestGeolocation = useCallback(() => {
    const request = ++requestRef.current;
    setGeo((previous) => ({ ...previous, phase: 'loading' }));
    const complete = (position) => {
      if (!mountedRef.current || requestRef.current !== request) return;
      if (!position) {
        setGeo({ phase: 'unavailable', location: null, accuracy: null, noNearby: true });
        setSelection({ line: 'Taipa', stationId: '1' });
        return;
      }
      const location = { lat: position.coords.latitude, lon: position.coords.longitude };
      const inMacau = location.lat >= 22.11 && location.lat <= 22.22 && location.lon >= 113.51 && location.lon <= 113.62;
      const nearest = inMacau ? stations.reduce((best, station) =>
        distance(location, station.coords) < distance(location, best.coords) ? station : best, stations[0]) : stations[0];
      selectStation(nearest.id, null, true);
      setGeo({ phase: 'success', location, accuracy: position.coords.accuracy, noNearby: !inMacau });
    };
    if (!navigator.geolocation) complete(null);
    else navigator.geolocation.getCurrentPosition(complete, () => complete(null), {
      enableHighAccuracy: true, timeout: 8000, maximumAge: 0,
    });
  }, [selectStation]);
  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(requestGeolocation, 0);
    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
      clearTimeout(timer);
    };
  }, [requestGeolocation]);

  useEffect(() => {
    let map;
    const initialize = () => {
      if (map || !window.L || !mapRef.current) return;
      setMapUnavailable(false);
      const center = geo.location || stations[0].coords;
      map = window.L.map(mapRef.current).setView([center.lat, center.lon], 15);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      if (geo.location) {
        window.L.circleMarker([center.lat, center.lon], { radius: 9, color: '#fff', fillColor: '#2563eb', fillOpacity: 1 })
          .addTo(map).bindTooltip(t('home_your_location'));
        if (geo.accuracy) window.L.circle([center.lat, center.lon], { radius: geo.accuracy, weight: 1 }).addTo(map);
      }
      stations.forEach((station) => {
        window.L.circleMarker([station.coords.lat, station.coords.lon], {
          radius: 7, color: '#fff', fillColor: '#eab308', fillOpacity: 1,
        }).addTo(map).bindTooltip(getName(station.name, language)).on('click', () => selectStation(station.id));
      });
    };
    const timer = setTimeout(() => {
      if (window.L) initialize();
      else setMapUnavailable(true);
    }, 0);
    const script = document.getElementById('leaflet-script');
    script?.addEventListener('load', initialize, { once: true });
    return () => {
      clearTimeout(timer);
      script?.removeEventListener('load', initialize);
      map?.remove();
    };
  }, [geo.location, geo.accuracy, language, t, selectStation]);

  return (
    <div className="pb-6 space-y-6">
      <div className="bg-blue-600 p-6 pt-10 text-white rounded-b-[32px] shadow-lg">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <img src={import.meta.env.BASE_URL + 'logo.png?v=2'} alt="Macao LRT" className="w-12 h-12 rounded-full bg-white p-0.5 object-cover" />
            <div><h1 className="text-2xl font-bold">{t('app_name')}</h1><p className="text-blue-100 text-sm">{t('welcome_message')}</p></div>
          </div>
          <div className="flex gap-1 items-center">
            {[['zh', '繁'], ['zh-CN', '简'], ['en', 'EN'], ['pt', 'PT']].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setLanguage(value)} aria-pressed={language === value}
                className={cn('px-2 py-2 text-xs rounded-lg', language === value ? 'bg-white text-blue-600' : 'text-blue-100')}>{label}</button>
            ))}
            <Link to="/my" aria-label={extraText(language, 'settings')} className="p-2"><Settings size={20} /></Link>
          </div>
        </div>
        {!getServiceDay(now).calendarKnown && <p role="status" className="mb-3 text-xs text-yellow-100">{extraText(language, 'calendar_unknown')}</p>}
        <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
          <h2 className="flex items-center text-sm mb-3"><MapPin size={16} className="mr-2" />{getName(nearbyStation.name, language)}</h2>
          <div className="h-48 rounded-xl overflow-hidden relative bg-slate-200 mb-4">
            <div ref={mapRef} className="h-full w-full" />
            <Button type="button" size="icon" aria-label={t('home_locating')} disabled={geo.phase === 'loading'} onClick={requestGeolocation}
              className="absolute top-3 right-3 bg-white text-blue-600 z-[1000]"><MapPin size={18} /></Button>
            {geo.phase === 'loading' && <span className="absolute bottom-3 left-3 bg-white text-slate-700 p-2 rounded-lg text-xs z-[1000]">{t('home_locating')}</span>}
            {geo.accuracy && <span className="absolute bottom-3 right-3 bg-white text-slate-700 p-1 rounded text-xs z-[1000]">±{Math.round(geo.accuracy)} m</span>}
            {mapUnavailable && <p className="absolute inset-0 grid place-content-center text-slate-700 text-sm p-6 pointer-events-none">{extraText(language, 'map_unavailable')}</p>}
          </div>
          {geo.noNearby && <p className="mb-3 text-xs bg-yellow-500/20 p-2 rounded-lg">{t('home_no_lrt_near')}</p>}
          <div className="space-y-3">
            {currentArrivals.map((arrival) => {
              const reminder = reminders.find((item) => item.stationId === arrival.stationId && item.directionId === arrival.id);
              return (
                <div key={arrival.id} className="flex items-center justify-between gap-2 bg-white text-slate-800 p-3 rounded-xl">
                  <p className="text-sm font-bold flex-1">{getName(arrival.direction, language)}</p>
                  <span className="text-sm font-bold text-blue-600">
                    {!arrival.times.length ? t('station_out_of_service') : arrival.times[0] === 0 ? t('station_arrived')
                      : arrival.times[0] === 1 ? t('station_arriving_soon') : arrival.times[0] + ' ' + t('home_min')}
                  </span>
                  <Button type="button" variant="ghost" size="icon" disabled={!arrival.times.length && !reminder}
                    aria-label={extraText(language, reminder ? 'reminder_cancel_action' : 'reminder_set_action')}
                    aria-pressed={Boolean(reminder)} className={reminder ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}
                    onClick={() => {
                      if (reminder) { removeReminder(reminder.id); showNotice(extraText(language, 'reminder_removed')); }
                      else addReminder({ stationId: arrival.stationId, directionId: arrival.id, leadMinutes: 1, repeat: 'once' });
                    }}><Bell size={18} fill={reminder ? 'currentColor' : 'none'} /></Button>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-blue-100 mt-3">{extraText(language, 'reminder_scope')}</p>
        </div>
      </div>
      <div className="px-6">
        <div className="rounded-2xl border border-slate-100 p-4 space-y-3">
          <h2 className="text-lg font-bold text-slate-800">{t('home_select_station')}</h2>
          <label className="block text-sm text-slate-600">{t('home_select_line')}
            <select value={selection.line} onChange={(event) => selectStation(LINES[event.target.value][0], event.target.value)}
              className="block w-full p-3 mt-1 rounded-xl border border-slate-200 bg-slate-50">
              {Object.keys(LINES).map((line) => <option key={line} value={line}>{t(LINE_KEYS[line])}</option>)}
            </select>
          </label>
          <label className="block text-sm text-slate-600">{t('home_select_station')}
            <select value={selection.stationId} onChange={(event) => selectStation(event.target.value)}
              className="block w-full p-3 mt-1 rounded-xl border border-slate-200 bg-slate-50">
              {LINES[selection.line].map((id) => <option key={id} value={id}>{getName(stations.find((station) => station.id === id).name, language)}</option>)}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
