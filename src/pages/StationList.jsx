import React, { useState } from 'react';
import { Search, Map as MapIcon, List, ChevronRight, Info } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { stations } from '../lib/data';
import { getName } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const StationList = () => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredStations = stations.filter(s => 
    getName(s.name, language).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getName(s.line, language).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-full bg-slate-50">
      <div className="bg-white p-6 pb-4 shadow-sm rounded-b-[32px] mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('nav_station')}</h1>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder={t('station_search_placeholder')} 
            className="pl-12 h-12 rounded-2xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredStations.map((station) => (
                <Link to={`/station/${station.id}`} key={station.id} className="block">
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
                    <div className="flex h-28">
                      <div className="w-32 relative">
                        <img src={station.image} alt={getName(station.name, language)} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase">
                           {getName(station.line, language)}
                        </div>
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-center relative">
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{getName(station.name, language)}</h3>
                        <div className="flex items-center text-xs text-slate-500 mb-3">
                           <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded mr-2 font-bold">{t('station_open')}</span>
                           <span>05:30 - 00:30</span>
                        </div>
                        <div className="flex items-center text-blue-600 text-xs font-bold uppercase tracking-wider">
                           {t('station_view_details')} <ChevronRight className="w-3 h-3 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-0 pt-6">
            <div className="rounded-3xl overflow-hidden shadow-inner">
              <img src="/route-map.png" alt={t('station_route_map_alt')} className="w-full h-full object-cover" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StationList;
