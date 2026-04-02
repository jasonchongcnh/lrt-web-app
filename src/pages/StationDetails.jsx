import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Info, MapPin, Bell, Share2, ZoomIn, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { stations, arrivals } from '../lib/data';
import { 
  getNextBarraArrivals, 
  getNextOceanArrivals, 
  getNextJockeyClubArrivals, 
  getNextStadiumArrivals,
  getNextPaiKokArrivals,
  getNextCotaiOesteArrivals,
  getNextLotusArrivals,
  getNextLotusHengqinArrivals,
  getNextHospitalArrivals,
  getNextHospitalSPVArrivals,
  getNextEastAsianGamesArrivals,
  getNextCotaiLesteArrivals,
  getNextMustArrivals,
  getNextAirportArrivals,
  getNextTaipaFerryArrivals,
  getNextSeacPaiVanArrivals,
  getNextHengqinArrivals,
  getStationServiceHours
} from '../lib/timetable';
import { cn, getName } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

const StationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const station = stations.find(s => s.id === id) || stations[0];
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  const serviceHours = getStationServiceHours(id);

  const facilities = [
    { zh: '客戶服務中心', en: 'Customer Service Centre' },
    { zh: '升降機', en: 'Elevator' },
    { zh: '扶手電梯', en: 'Escalator' },
    { zh: '無障礙洗手間', en: 'Accessible Toilet' },
    { zh: '加闊閘機', en: 'Wide Gate' },
    { zh: '候車座椅', en: 'Platform Seats' },
    { zh: '車站摸讀平面圖', en: 'Tactile Station Layout Plan' },
    { zh: '育嬰枱', en: 'Baby Care Table' },
    { zh: '失明人士引導徑', en: 'Tactile Guide Path' },
    { zh: '自動體外心臟除顫器(AED)', en: 'AED' }
  ];

  // Specific facilities
  if (id === '1') { // Barra
    facilities.push({ zh: '哺乳室', en: 'Nursing Room' });
    facilities.push({ zh: '親子洗手間', en: 'Family Toilet' });
  } else if (id === '15') { // Hengqin
    facilities.push({ zh: '親子洗手間', en: 'Family Toilet' });
  }

  // Live arrivals based on station id/timetable
  const liveArrivals = (() => {
    if (id === '1') {
      const times = getNextBarraArrivals(3);
      return [{ direction: { en: 'Taipa Ferry Terminal (P1)', zh: '氹仔碼頭（1號月台）' }, times }];
    }
    if (id === '2') {
      return [
        { direction: { en: 'Taipa Ferry Terminal (P1)', zh: '氹仔碼頭（1號月台）' }, times: getNextOceanArrivals('Taipa', 3) },
        { direction: { en: 'Barra (P2)', zh: '媽閣（2號月台）' }, times: getNextOceanArrivals('Barra', 3) },
      ];
    }
    if (id === '3') {
      return [
        { direction: { en: 'Taipa Ferry Terminal (P1)', zh: '氹仔碼頭（1號月台）' }, times: getNextJockeyClubArrivals('Taipa', 3) },
        { direction: { en: 'Barra (P2)', zh: '媽閣（2號月台）' }, times: getNextJockeyClubArrivals('Barra', 3) },
      ];
    }
    if (id === '4') {
      return [
        { direction: { en: 'Taipa Ferry Terminal (P1)', zh: '氹仔碼頭（1號月台）' }, times: getNextStadiumArrivals('Taipa', 3) },
        { direction: { en: 'Barra (P2)', zh: '媽閣（2號月台）' }, times: getNextStadiumArrivals('Barra', 3) },
      ];
    }
    if (id === '5') {
      return [
        { direction: { en: 'Taipa Ferry Terminal (P1)', zh: '氹仔碼頭（1號月台）' }, times: getNextPaiKokArrivals('Taipa', 3) },
        { direction: { en: 'Barra (P2)', zh: '媽閣（2號月台）' }, times: getNextPaiKokArrivals('Barra', 3) },
      ];
    }
    if (id === '6') {
      return [
        { direction: { en: 'Taipa Ferry Terminal (P1)', zh: '氹仔碼頭（1號月台）' }, times: getNextCotaiOesteArrivals('Taipa', 3) },
        { direction: { en: 'Barra (P2)', zh: '媽閣（2號月台）' }, times: getNextCotaiOesteArrivals('Barra', 3) },
      ];
    }
    if (id === '7') {
      return [
        { direction: { en: 'Taipa Ferry Terminal (Taipa P1)', zh: '氹仔碼頭（氹仔線1號月台）' }, times: getNextLotusArrivals('Taipa', 3) },
        { direction: { en: 'Barra (Taipa P2)', zh: '媽閣（氹仔線2號月台）' }, times: getNextLotusArrivals('Barra', 3) },
        { direction: { en: 'Hengqin (Hengqin P3)', zh: '橫琴（橫琴線3號月台）' }, times: getNextLotusHengqinArrivals(3) },
      ];
    }
    if (id === '8') {
      return [
        { direction: { en: 'Taipa Ferry Terminal (Taipa P1)', zh: '氹仔碼頭（氹仔線1號月台）' }, times: getNextHospitalArrivals('Taipa', 3) },
        { direction: { en: 'Barra (Taipa P2)', zh: '媽閣（氹仔線2號月台）' }, times: getNextHospitalArrivals('Barra', 3) },
        { direction: { en: 'Seac Pai Van (SPV P3/4)', zh: '石排灣（石排灣線3/4號月台）' }, times: getNextHospitalSPVArrivals(3) },
      ];
    }
    if (id === '9') {
      return [
        { direction: { en: 'Taipa Ferry Terminal (P1)', zh: '氹仔碼頭（1號月台）' }, times: getNextEastAsianGamesArrivals('Taipa', 3) },
        { direction: { en: 'Barra (P2)', zh: '媽閣（2號月台）' }, times: getNextEastAsianGamesArrivals('Barra', 3) },
      ];
    }
    if (id === '10') {
      return [
        { direction: { en: 'Taipa Ferry Terminal (P1)', zh: '氹仔碼頭（1號月台）' }, times: getNextCotaiLesteArrivals('Taipa', 3) },
        { direction: { en: 'Barra (P2)', zh: '媽閣（2號月台）' }, times: getNextCotaiLesteArrivals('Barra', 3) },
      ];
    }
    if (id === '11') {
      return [
        { direction: { en: 'Taipa Ferry Terminal (P1)', zh: '氹仔碼頭（1號月台）' }, times: getNextMustArrivals('Taipa', 3) },
        { direction: { en: 'Barra (P2)', zh: '媽閣（2號月台）' }, times: getNextMustArrivals('Barra', 3) },
      ];
    }
    if (id === '12') {
      return [
        { direction: { en: 'Taipa Ferry Terminal (P1)', zh: '氹仔碼頭（1號月台）' }, times: getNextAirportArrivals('Taipa', 3) },
        { direction: { en: 'Barra (P2)', zh: '媽閣（2號月台）' }, times: getNextAirportArrivals('Barra', 3) },
      ];
    }
    if (id === '13') {
      return [{ direction: { en: 'Barra (P2)', zh: '媽閣（2號月台）' }, times: getNextTaipaFerryArrivals(3) }];
    }
    if (id === '14') {
      return [{ direction: { en: 'Union Hospital (P1/2)', zh: '協和醫院（1/2號月台）' }, times: getNextSeacPaiVanArrivals(3) }];
    }
    if (id === '15') {
      return [{ direction: { en: 'Lotus (P1)', zh: '蓮花（1號月台）' }, times: getNextHengqinArrivals(3) }];
    }
    return [];
  })();

  return (
    <div className="bg-white min-h-screen pb-20 relative">
      {/* Header Image Area */}
      <div className="relative h-56 w-full group cursor-pointer overflow-hidden" onClick={() => setActiveImage({
        url: station.image,
        title: getName(station.name, language)
      })}>
        <img src={station.image} alt={getName(station.name, language)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-lg" />
        </div>
        <div className="absolute top-0 left-0 right-0 p-4 pt-10 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent z-10">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={(e) => {
            e.stopPropagation();
            navigate(-1);
          }}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={(e) => e.stopPropagation()}>
              <Share2 className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("text-white hover:bg-white/20 rounded-full", isFavorite && "text-yellow-400")}
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
            >
              <Star className={cn("w-6 h-6", isFavorite && "fill-current")} />
            </Button>
          </div>
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
              {language === 'zh' ? '點擊查看大圖' : 'Click to zoom'}
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
            {liveArrivals.length > 0 ? liveArrivals.map((entry, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center">
                  {t('home_to')} {getName(entry.direction, language)}
                  <div className="h-px bg-slate-200 flex-1 ml-3"></div>
                </h3>
                <div className="space-y-3">
                  <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        {(!entry.times || entry.times.length === 0) ? (
                          <span className="text-sm font-bold text-slate-400">{language === 'zh' ? '非營運時間' : 'Out of Service'}</span>
                        ) : (
                          <>
                            <div className="flex items-baseline space-x-1">
                              <span className="text-2xl font-bold text-slate-900">{entry.times[0] ?? '-'}</span>
                              <span className="text-sm text-slate-500">{t('home_min')}</span>
                            </div>
                            <div className="flex items-center mt-1 space-x-2">
                              <span className="text-xs text-slate-400">
                                {t('station_next')}: {entry.times[1] ?? '-'} {t('home_min')}, {entry.times[2] ?? '-'} {t('home_min')}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      {(entry.times && entry.times.length > 0) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => setShowReminder(true)}
                        >
                          <Bell className="w-4 h-4 mr-1" />
                          {t('station_notify')}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400">
                <Info className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>{language === 'zh' ? '暫無班次資訊' : 'No arrival info'}</p>
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
                          <p className="text-xs font-bold text-blue-600 mb-1">{language === 'zh' ? '星期一至四' : 'Mon - Thu'}</p>
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>{t('station_first_train')}: {serviceHours.mon_thu?.first || '--:--'}</span>
                            <span>{t('station_last_train')}: {serviceHours.mon_thu?.last || '--:--'}</span>
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                          <p className="text-xs font-bold text-blue-600 mb-1">{language === 'zh' ? '星期五' : 'Friday'}</p>
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>{t('station_first_train')}: {serviceHours.fri?.first || '--:--'}</span>
                            <span>{t('station_last_train')}: {serviceHours.fri?.last || '--:--'}</span>
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                          <p className="text-xs font-bold text-blue-600 mb-1">{language === 'zh' ? '星期六、日及公眾假期' : 'Weekend & Holidays'}</p>
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>{t('station_first_train')}: {serviceHours.weekend?.first || '--:--'}</span>
                            <span>{t('station_last_train')}: {serviceHours.weekend?.last || '--:--'}</span>
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
                            {language === 'zh' ? f.zh : f.en}
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
                     {language === 'zh' ? '站點周邊資訊' : 'Station Surroundings'}
                   </h4>
                   
                   {/* Image interface */}
                   <div className="space-y-4">
                      {id === '1' ? (
                        <div 
                          className="w-auto bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2024/station_ST12.png",
                            title: language === 'zh' ? '媽閣站街道圖' : 'Barra Station Street Map'
                          })}
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
                                {language === 'zh' ? '媽閣站街道圖' : 'Barra Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      ) : id === '2' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2023/ST13.png",
                            title: language === 'zh' ? '海洋站街道圖' : 'Ocean Station Street Map'
                          })}
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
                                {language === 'zh' ? '馬會站街道圖' : 'Jockey Club Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      ) : id === '3' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2023/ST14.png",
                            title: language === 'zh' ? '馬會站街道圖' : 'Jockey Club Station Street Map'
                          })} 
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
                                {language === 'zh' ? '馬會站街道圖' : 'Jockey Club Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      ) : id === '4' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2023/ST15.png",
                            title: language === 'zh' ? '運動場站街道圖' : 'Stadium Station Street Map'
                          })}
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
                                {language === 'zh' ? '運動場站街道圖' : 'Stadium Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      ) : id === '5' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2023/ST16.png",
                            title: language === 'zh' ? '排角站街道圖' : 'Pai Kok Station Street Map'
                          })}
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
                                {language === 'zh' ? '排角站街道圖' : 'Pai Kok Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      ) : id === '6' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2023/ST17.png",
                            title: language === 'zh' ? '路氹西站街道圖' : 'Cotai West Station Street Map'
                          })}
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
                                {language === 'zh' ? '路氹西站街道圖' : 'Cotai West Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      ) : id === '7' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2024/Station_2024_DEC/Lotus_HQ_station.png",
                            title: language === 'zh' ? '蓮花站街道圖' : 'Lotus Station Street Map'
                          })}
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
                                {language === 'zh' ? '蓮花站街道圖' : 'Lotus Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      )  : id === '8' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2024/station_st18A.png",
                            title: language === 'zh' ? '協和醫院站街道圖' : 'Union Hospital Station Street Map'
                          })}
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
                                {language === 'zh' ? '協和醫院站街道圖' : 'Union Hospital Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      ) : id === '9' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2023/ST19.png",
                            title: language === 'zh' ? '東亞運站街道圖' : 'East Asia Games Station Street Map'
                          })}
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
                                {language === 'zh' ? '東亞運站街道圖' : 'East Asia Games Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      ) : id === '10' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2023/ST20.png",
                            title: language === 'zh' ? '路氹東站街道圖' : 'Cotai East Station Street Map'
                          })}
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
                                {language === 'zh' ? '路氹東站街道圖' : 'Cotai East Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      ) : id === '11' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2023/ST21.png",
                            title: language === 'zh' ? '科大站街道圖' : 'MUST Station Street Map'
                          })}
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
                                {language === 'zh' ? '科大站街道圖' : 'MUST Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      ) : id === '12' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2023/ST22.png",
                            title: language === 'zh' ? '機場站街道圖' : 'Airport Station Street Map'
                          })}
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
                                {language === 'zh' ? '機場站街道圖' : 'Airport Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      ) : id === '13' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2023/ST23.png",
                            title: language === 'zh' ? '氹仔碼頭站街道圖' : 'Tapia Ferry Terminal Station Street Map'
                          })}
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
                                {language === 'zh' ? '氹仔碼頭站街道圖' : 'Tapia Ferry Terminal Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      ) : id === '14' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2024/station_st18B.png",
                            title: language === 'zh' ? '石排灣站街道圖' : 'Seac Pai Van Station Street Map'
                          })}
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
                                {language === 'zh' ? '石排灣站街道圖' : 'Seac Pai Van Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      ) : id === '15' ? (
                        <div 
                          className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative"
                          onClick={() => setActiveImage({
                            url: "https://mlm.com.mo/images/stations/station_2024/STHQ.png",
                            title: language === 'zh' ? '橫琴站街道圖' : 'Hengqin Station Street Map'
                          })}
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
                                {language === 'zh' ? '橫琴站街道圖' : 'Hengqin Station Street Map'}
                              </p>
                              <span className="text-[10px] text-blue-500 font-bold flex items-center">
                                <ZoomIn className="w-3 h-3 mr-1" />
                                {language === 'zh' ? '點擊放大' : 'Click to zoom'}
                              </span>
                           </div>
                        </div>
                      ): (
                        <div className="aspect-video bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative group border-2 border-dashed border-slate-300">
                           <div className="text-center p-6">
                              <Share2 className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-50" />
                              <p className="text-xs text-slate-500">{language === 'zh' ? '周邊地圖 / 景點圖片預留位' : 'Placeholder for surrounding map / scenery'}</p>
                           </div>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lightbox Overlay */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setActiveImage(null)}
        >
          <div className="absolute top-10 right-6 flex space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 rounded-full h-12 w-12"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImage(null);
              }}
            >
              <X className="w-8 h-8" />
            </Button>
          </div>
          
          <div className="w-full max-w-4xl max-h-[80vh] relative group flex items-center justify-center">
            <img 
              src={activeImage.url} 
              alt={activeImage.title} 
              className="max-w-full max-h-full object-contain rounded-sm shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="mt-6 text-center text-white space-y-2 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-bold">{activeImage.title}</h3>
            <p className="text-sm text-white/60">
              {language === 'zh' ? '點擊背景或按右上角關閉' : 'Click background or top-right to close'}
            </p>
          </div>
        </div>
      )}

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
