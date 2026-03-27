import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Info, MapPin, Bell, Share2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { stations, arrivals } from '../lib/data';
import { getNextBarraArrivals, getNextOceanArrivals, getNextJockeyClubArrivals, getNextStadiumArrivals } from '../lib/timetable';
import { cn, getName } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

const StationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const station = stations.find(s => s.id === id) || stations[0];
  const stationArrivals = arrivals.filter(a => a.stationId === id); 
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  // Live arrivals based on station id/timetable
  const liveArrivals = (() => {
    if (id === '1') {
      const times = getNextBarraArrivals(3);
      return [
        { direction: { en: 'Taipa Ferry Terminal', zh: '氹仔碼頭' }, times }
      ];
    }
    if (id === '2') {
      const t1 = getNextOceanArrivals('Taipa', 3);
      const t2 = getNextOceanArrivals('Barra', 3);
      return [
        { direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: t1 },
        { direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: t2 },
      ];
    }
    if (id === '3') {
      const t1 = getNextJockeyClubArrivals('Taipa', 3);
      const t2 = getNextJockeyClubArrivals('Barra', 3);
      return [
        { direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: t1 },
        { direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: t2 },
      ];
    }
    if (id === '4') {
      const t1 = getNextStadiumArrivals('Taipa', 3);
      const t2 = getNextStadiumArrivals('Barra', 3);
      return [
        { direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: t1 },
        { direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: t2 },
      ];
    }
    // Fallback mock for other stations
    return [
      { direction: { en: 'Taipa Ferry Terminal', zh: '氹仔碼頭' }, times: [4, 12, 25] }
    ];
  })();

  return (
    <div className="bg-white min-h-screen pb-20 relative">
      {/* Header Image Area */}
      <div className="relative h-56 w-full">
        <img src={station.image} alt={getName(station.name, language)} className="w-full h-full object-cover" />
        <div className="absolute top-0 left-0 right-0 p-4 pt-10 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("text-white hover:bg-white/20 rounded-full", isFavorite && "text-yellow-400")}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Star className={cn("w-6 h-6", isFavorite && "fill-current")} />
            </Button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{getName(station.name, language)}</h1>
              <div className="flex items-center text-white/80 text-sm mt-1">
                <Badge variant="outline" className="text-white border-white/40 mr-2">{getName(station.line, language)}</Badge>
                <span>{t('station_zone')} A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-4">
        <Tabs defaultValue="arrivals">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="arrivals">{t('station_tab_arrivals')}</TabsTrigger>
            <TabsTrigger value="info">{t('station_tab_info')}</TabsTrigger>
            <TabsTrigger value="area">{t('station_tab_area')}</TabsTrigger>
          </TabsList>

          <TabsContent value="arrivals" className="space-y-6">
            {liveArrivals.map((entry, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center">
                  {t('home_to')} {getName(entry.direction, language)}
                  <div className="h-px bg-slate-200 flex-1 ml-3"></div>
                </h3>
                <div className="space-y-3">
                  <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl font-bold text-slate-900">{entry.times[0] ?? '-'}</span>
                          <span className="text-sm text-slate-500">{t('home_min')}</span>
                        </div>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="text-xs text-slate-400">
                            {t('station_next')}: {entry.times[1] ?? '-'} {t('home_min')}, {entry.times[2] ?? '-'} {t('home_min')}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => setShowReminder(true)}
                      >
                        <Bell className="w-4 h-4 mr-1" />
                        {t('station_notify')}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
             <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <div className="flex items-start">
                   <Clock className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
                   <div>
                      <h4 className="font-medium text-slate-900">{t('station_operating_hours')}</h4>
                      <p className="text-sm text-slate-600">{t('station_first_train')}: 05:30</p>
                      <p className="text-sm text-slate-600">{t('station_last_train')}: 23:45</p>
                   </div>
                </div>
                <div className="flex items-start">
                   <Info className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
                   <div>
                      <h4 className="font-medium text-slate-900">{t('station_facilities')}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="secondary">{t('station_elevator')}</Badge>
                        <Badge variant="secondary">{t('station_restroom')}</Badge>
                        <Badge variant="secondary">{t('station_atm')}</Badge>
                      </div>
                   </div>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="area" className="flex items-center justify-center py-10 text-slate-400">
             <div className="text-center">
               <MapPin className="w-10 h-10 mx-auto mb-2 opacity-20" />
               <p>{t('station_map_unavailable')}</p>
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reminder Bottom Sheet Mock */}
      {showReminder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-t-2xl p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">{t('reminder_title')}</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowReminder(false)}>{t('reminder_cancel')}</Button>
              </div>
              
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">{t('reminder_type')}</label>
                    <div className="flex gap-2">
                       <Button variant="default" size="sm" className="flex-1">{t('reminder_before_arrival')}</Button>
                       <Button variant="outline" size="sm" className="flex-1">{t('reminder_before_exit')}</Button>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">{t('reminder_time_before')}</label>
                    <div className="grid grid-cols-3 gap-2">
                       <Button variant="outline" size="sm">5 {t('home_min')}</Button>
                       <Button variant="default" size="sm">10 {t('home_min')}</Button>
                       <Button variant="outline" size="sm">15 {t('home_min')}</Button>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">{t('reminder_repeat')}</label>
                    <select className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                       <option>{t('reminder_once')}</option>
                       <option>{t('reminder_weekdays')}</option>
                       <option>{t('reminder_weekends')}</option>
                    </select>
                 </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setShowReminder(false)}>
                 {t('reminder_save')}
              </Button>
           </div>
        </div>
      )}
    </div>
  );
};

export default StationDetails;
