import { useState } from 'react';
import { Search, Map as MapIcon, List, ChevronRight, ZoomIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { stations, REMOTE_BASE } from '../lib/data';
import { getName } from '../lib/utils';
import { getStationServiceHours } from '../lib/timetable';
import { getServiceDay, isWithinServiceHours } from '../lib/service';
import { useLanguage } from '../contexts/language';
import { useImage } from '../contexts/image';
import { useClock } from '../hooks/useClock';

const StationList = () => {
  const { t, language } = useLanguage();
  const { showImage } = useImage();
  const [searchTerm, setSearchTerm] = useState('');
  const serviceDay = getServiceDay(useClock());
  const query = searchTerm.trim().toLocaleLowerCase();
  const filteredStations = stations.filter(station =>
    Object.values(station.name).some(name => name.toLocaleLowerCase().includes(query)) ||
    Object.values(station.line).some(line => line.toLocaleLowerCase().includes(query))
  );
  const displayTime = (value) => {
    const [hour, minute] = value.split(':').map(Number);
    const time = `${String(hour % 24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    return hour >= 24 ? `${time} ${t('station_next_day')}` : time;
  };

  return (
    <div className="min-h-full bg-slate-50">
      <div className="bg-white p-6 pb-4 shadow-sm rounded-b-[32px] mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('nav_station')}</h1>
        {!serviceDay.calendarKnown && (
          <p role="status" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            {t('calendar_unknown')}
          </p>
        )}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            aria-label={t('station_search_placeholder')}
            placeholder={t('station_search_placeholder')}
            className="pl-12 h-12 rounded-2xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />
        </div>
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl h-12">
            <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium flex items-center justify-center gap-2">
              <List className="w-4 h-4" /> {t('station_tab_list')}
            </TabsTrigger>
            <TabsTrigger value="map" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium flex items-center justify-center gap-2">
              <MapIcon className="w-4 h-4" /> {t('station_tab_map')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-0 pt-6">
            <div className="space-y-4">
              {filteredStations.length === 0 && (
                <p role="status" className="py-6 text-center text-sm text-slate-500">{t('station_search_empty')}</p>
              )}
              {filteredStations.map(station => {
                const hours = getStationServiceHours(station.id)[serviceDay.dayType];
                const isOpen = isWithinServiceHours(hours, serviceDay.operatingMinute);
                return (
                  <Card key={station.id} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
                    <div className="flex min-h-28">
                      <button
                        type="button"
                        className="w-32 shrink-0 relative group cursor-pointer"
                        aria-label={`${getName(station.name, language)}: ${t('station_click_to_zoom')}`}
                        onClick={() => showImage(station.image, getName(station.name, language))}
                      >
                        <img src={station.image} alt={getName(station.name, language)} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <ZoomIn className="text-white w-6 h-6" />
                        </div>
                        <div className="absolute top-2 left-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white">
                          {getName(station.line, language)}
                        </div>
                      </button>
                      <Link to={`/station/${station.id}`} className="flex-1 min-w-0 p-4 flex flex-col justify-center">
                        <h2 className="font-bold text-lg text-slate-900 mb-1">{getName(station.name, language)}</h2>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${isOpen && serviceDay.calendarKnown ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                            {!serviceDay.calendarKnown ? t('station_schedule_unconfirmed') : isOpen ? t('station_in_service') : t('station_out_of_service')}
                          </span>
                          {hours && <span>{displayTime(hours.first)} – {displayTime(hours.last)}</span>}
                        </div>
                        <div className="flex items-center text-blue-600 text-xs font-bold tracking-wider">
                          {t('station_view_details')} <ChevronRight className="w-3 h-3 ml-1" />
                        </div>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="map" className="mt-0 pt-6">
            <button type="button" aria-label={`${t('station_tab_map')}: ${t('station_click_to_zoom')}`} className="rounded-3xl overflow-hidden shadow-inner cursor-pointer group relative" onClick={() => showImage(`${REMOTE_BASE}route-map.png`, t('station_tab_map'))}>
              <img src={`${REMOTE_BASE}route-map.png`} alt={t('station_tab_map')} className="object-contain transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ZoomIn className="text-white w-10 h-10 drop-shadow-md" />
              </div>
            </button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StationList;
