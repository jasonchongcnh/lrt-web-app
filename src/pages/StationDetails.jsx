import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Info, MapPin, Bell, Share2, ZoomIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import ReminderDialog from '../components/ReminderDialog';
import { stations } from '../lib/data';
import { getStationServiceHours } from '../lib/timetable';
import { getStationArrivals } from '../lib/arrivals';
import { getServiceDay } from '../lib/service';
import { extraText } from '../lib/extraText';
import { getName } from '../lib/utils';
import { useLanguage } from '../contexts/language';
import { useImage } from '../contexts/image';
import { useReminders } from '../contexts/reminders';
import { useFavorites } from '../hooks/useFavorites';
import { useClock } from '../hooks/useClock';

const StationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { showImage } = useImage();
  
  const station = stations.find(s => s.id === id);
  const { favorites, toggleFavorite } = useFavorites();
  const { reminders, removeReminder } = useReminders();
  const [showReminder, setShowReminder] = useState(null);
  const now = useClock();
  if (!station) return <Navigate to="/station" replace />;
  const isFavorite = favorites.includes(id);
  const displayTime = (value) => {
    if (!value) return '--:--';
    const [hour, minute] = value.split(':');
    const time = String(Number(hour) % 24).padStart(2, '0') + ':' + minute;
    return Number(hour) >= 24 ? time + ' ' + t('station_next_day') : time;
  };

  const serviceHours = getStationServiceHours(id);

  const facilities = [
    { zh: '客戶服務中心', 'zh-CN': '客户服务中心', en: 'Customer Service Centre', pt: 'Centro de Atendimento ao Cliente' },
    { zh: '升降機', 'zh-CN': '电梯', en: 'Elevator', pt: 'Elevador' },
    { zh: '扶手電梯', 'zh-CN': '扶手电梯', en: 'Escalator', pt: 'Escada rolante' },
    { zh: '無障礙洗手間', 'zh-CN': '无障碍洗手间', en: 'Accessible Toilet', pt: 'Casa de banho acessível' },
    { zh: '加闊閘機', 'zh-CN': '加宽闸机', en: 'Wide Gate', pt: 'Porta larga' },
    { zh: '候車座椅', 'zh-CN': '候车座椅', en: 'Platform Seats', pt: 'Lugares na plataforma' },
    { zh: '車站摸讀平面圖', 'zh-CN': '车站摸读平面图', en: 'Tactile Station Layout Plan', pt: 'Planta tátil da estação' },
    { zh: '育嬰枱', 'zh-CN': '育婴台', en: 'Baby Care Table', pt: 'Mesa de cuidado para bebés' },
    { zh: '失明人士引導徑', 'zh-CN': '失明人士引导径', en: 'Tactile Guide Path', pt: 'Caminho de guia tátil' },
    { zh: '自動體外心臟除顫器(AED)', 'zh-CN': '自动体外心脏除颤器(AED)', en: 'AED', pt: 'AED' }
  ];

  // Specific facilities
  if (id === '1') { // Barra
    facilities.push({ zh: '哺乳室', 'zh-CN': '哺乳室', en: 'Nursing Room', pt: 'Sala de amamentação' });
    facilities.push({ zh: '親子洗手間', 'zh-CN': '亲子洗手间', en: 'Family Toilet', pt: 'Casa de banho para famílias' });
  } else if (id === '15') { // Hengqin
    facilities.push({ zh: '親子洗手間', 'zh-CN': '亲子洗手间', en: 'Family Toilet', pt: 'Casa de banho para famílias' });
  }

  const liveArrivals = getStationArrivals(id, 3, now);

  return (
    <div className="bg-white min-h-screen pb-20 relative">
      {/* Header Image Area */}
      <div className="relative h-56 w-full group cursor-pointer overflow-hidden" onClick={() => showImage(
        station.image,
        getName(station.name, language)
      )}>
        <img src={station.image} alt={getName(station.name, language)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-lg" />
        </div>
        <div className="absolute top-0 left-0 right-0 p-4 pt-10 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent z-10">
          <Button aria-label={t('nav_station')} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={(e) => {
            e.stopPropagation();
            if (window.history.state?.idx > 0) navigate(-1);
            else navigate('/station');
          }}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full"
            aria-label={extraText(language, isFavorite ? 'favorite_remove' : 'favorite_add')} aria-pressed={isFavorite}
            onClick={(event) => { event.stopPropagation(); toggleFavorite(id); }}>
            <Star className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} />
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{getName(station.name, language)}</h1>
              <div className="flex items-center text-white/80 text-sm mt-1">
                <Badge variant="outline" className="text-white border-white/40 mr-2">{getName(station.line, language)}</Badge>
              </div>
            </div>
            <div className="text-white/60 flex items-center text-[10px] font-medium bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
              <ZoomIn className="w-3 h-3 mr-1" />
              {t('station_click_to_zoom')}
            </div>
          </div>
        </div>
      </div>

      {!getServiceDay(now).calendarKnown && <p role="status" className="m-4 p-3 rounded-xl bg-amber-50 text-amber-800 text-sm">{t('calendar_unknown')}</p>}
      {/* Tabs */}
      <div className="px-4 py-4">
        <Tabs defaultValue="arrivals">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="arrivals">{t('station_tab_arrivals')}</TabsTrigger>
            <TabsTrigger value="info">{t('station_tab_info')}</TabsTrigger>
            <TabsTrigger value="area">{t('station_tab_area')}</TabsTrigger>
          </TabsList>

          <TabsContent value="arrivals" className="space-y-6">
            {liveArrivals.length > 0 ? liveArrivals.map((entry) => (
              <div key={entry.id}>
                <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center">
                  {t('home_to')} {getName(entry.direction, language)}
                  <div className="h-px bg-slate-200 flex-1 ml-3"></div>
                </h3>
                <div className="space-y-3">
                  <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        {(!entry.times || entry.times.length === 0) ? (
                          <span className="text-sm font-bold text-slate-400">{t('station_out_of_service')}</span>
                        ) : entry.times[0] === 0 ? (
                          <div>
                            <span className="text-lg font-bold text-blue-600">{t('station_arrived')}</span>
                            {entry.times.length > 1 && (
                              <div className="flex items-center mt-1 space-x-2">
                                <span className="text-xs text-slate-400">
                                  {t('station_next')}: {entry.times[1] ?? '-'} {t('home_min')}{entry.times[2] ? `, ${entry.times[2]} ${t('home_min')}` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : entry.times[0] === 1 ? (
                          <div>
                            <span className="text-lg font-bold text-blue-600">{t('station_arriving_soon')}</span>
                            {entry.times.length > 1 && (
                              <div className="flex items-center mt-1 space-x-2">
                                <span className="text-xs text-slate-400">
                                  {t('station_next')}: {entry.times[1] ?? '-'} {t('home_min')}{entry.times[2] ? `, ${entry.times[2]} ${t('home_min')}` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="flex items-baseline space-x-1">
                              <span className="text-2xl font-bold text-slate-900">{entry.times[0] ?? '-'}</span>
                              <span className="text-sm text-slate-500">{t('home_min')}</span>
                            </div>
                            <div className="flex items-center mt-1 space-x-2">
                              <span className="text-xs text-slate-400">
                                {t('station_next')}: {entry.times[1] ?? '-'} {t('home_min')}{entry.times[2] ? `, ${entry.times[2]} ${t('home_min')}` : ''}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      {(entry.times.length > 0 || reminders.some(item => item.stationId === id && item.directionId === entry.id)) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          aria-pressed={reminders.some(item => item.stationId === id && item.directionId === entry.id)}
                          onClick={() => {
                            const active = reminders.find(item => item.stationId === id && item.directionId === entry.id);
                            if (active) removeReminder(active.id);
                            else setShowReminder(entry);
                          }}
                        >
                          <Bell className="w-4 h-4 mr-1" />
                          {reminders.some(item => item.stationId === id && item.directionId === entry.id) ? extraText(language, 'reminder_cancel_action') : t('station_notify')}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400">
                <Info className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>{t('station_no_arrival_info')}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
             <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                <div className="flex items-start">
                   <Clock className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                   <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-2">{t('station_operating_hours')}</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                          <p className="text-xs font-bold text-blue-600 mb-1">{t('station_mon_thu')}</p>
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>{t('station_first_train')}: {displayTime(serviceHours.mon_thu?.first)}</span>
                            <span>{t('station_last_train')}: {displayTime(serviceHours.mon_thu?.last)}</span>
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                          <p className="text-xs font-bold text-blue-600 mb-1">{t('station_fri')}</p>
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>{t('station_first_train')}: {displayTime(serviceHours.fri?.first)}</span>
                            <span>{t('station_last_train')}: {displayTime(serviceHours.fri?.last)}</span>
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                          <p className="text-xs font-bold text-blue-600 mb-1">{t('station_weekend')}</p>
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>{t('station_first_train')}: {displayTime(serviceHours.weekend?.first)}</span>
                            <span>{t('station_last_train')}: {displayTime(serviceHours.weekend?.last)}</span>
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
                <div className="flex items-start">
                   <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                   <div>
                      <h4 className="font-bold text-slate-900 mb-2">{t('station_facilities')}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {facilities.map((f, i) => (
                          <Badge key={i} variant="secondary" className="bg-white border-slate-200 text-slate-700 font-normal">
                            {language === 'zh' ? f.zh : (language === 'zh-CN' ? f['zh-CN'] : (language === 'pt' ? f.pt : f.en))}
                          </Badge>
                        ))}
                      </div>
                   </div>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="area" className="space-y-6">
             <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                   <h4 className="font-bold text-slate-900 mb-3 flex items-center">
                     <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                     {t('station_surroundings')}
                   </h4>
                   
                   {/* Image interface */}
                   <div className="space-y-4">
                      {id === '1' ? (
                        <div 
                          className="w-auto bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2024/station_ST12.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2024/station_ST12.png" 
                             alt="Barra Station Street Map" 
                             className="w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      ) : id === '2' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2023/ST13.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2023/ST13.png" 
                             alt="Ocean Station Street Map" 
                             className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      ) : id === '3' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2023/ST14.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2023/ST14.png" 
                             alt="Jockey Club Station Street Map" 
                             className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      ) : id === '4' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2023/ST15.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2023/ST15.png" 
                             alt="Stadium Station Street Map" 
                             className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      ) : id === '5' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2023/ST16.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2023/ST16.png" 
                             alt="Pai Kok Station Street Map" 
                             className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      ) : id === '6' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2023/ST17.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2023/ST17.png" 
                             alt="Cotai West Station Street Map" 
                             className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      ) : id === '7' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2024/Station_2024_DEC/Lotus_HQ_station.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2024/Station_2024_DEC/Lotus_HQ_station.png" 
                             alt="Lotus Station Street Map" 
                             className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      )  : id === '8' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2024/station_st18A.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2024/station_st18A.png" 
                             alt="Union Hospital Station Street Map" 
                             className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      ) : id === '9' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2023/ST19.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2023/ST19.png" 
                             alt="East Asia Games Station Street Map" 
                             className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      ) : id === '10' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2023/ST20.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2023/ST20.png" 
                             alt="Cotai East Station Street Map" 
                             className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      ) : id === '11' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2023/ST21.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2023/ST21.png" 
                             alt="MUST Station Street Map" 
                             className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      ) : id === '12' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2023/ST22.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2023/ST22.png" 
                             alt="Airport Station Street Map"
                             className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      ) : id === '13' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2023/ST23.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2023/ST23.png" 
                             alt="Tapia Ferry Terminal Station Street Map"
                             className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      ) : id === '14' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2024/station_st18B.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2024/station_st18B.png" 
                             alt="Seac Pai Van Station Street Map"
                             className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      ) : id === '15' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => showImage(
                            "https://mlm.com.mo/images/stations/station_2024/STHQ.png",
                            `${getName(station.name, language)} ${t('station_street_map')}`
                          )}
                        >
                           <img 
                             src="https://mlm.com.mo/images/stations/station_2024/STHQ.png" 
                             alt="Hengqin Station Street Map"
                             className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md" />
                           </div>
                           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                              <p className="text-xs text-slate-500 font-medium">
                                {getName(station.name, language)} {t('station_street_map')}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {t('station_click_to_zoom')}
                              </span>
                           </div>
                        </div>
                      ): (
                        <div className="aspect-video bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative group border-2 border-dashed border-slate-300">
                           <div className="text-center p-6">
                              <Share2 className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-50" />
                              <p className="text-xs text-slate-500">{t('station_placeholder_map')}</p>
                           </div>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>


      {showReminder && <ReminderDialog stationId={id} direction={showReminder} onClose={() => setShowReminder(null)} />}
    </div>
  );
};

export default StationDetails;
