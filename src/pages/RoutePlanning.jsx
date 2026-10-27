import React, { useState } from 'react';
import { getName } from '../lib/utils';
import { useLanguage } from '../contexts/language';
import { stations } from '../lib/data';
import { LINES, calculateFare, planRoute } from '../lib/routes';

const RoutePlanning = () => {
  const { t, language } = useLanguage();
  const [fromStation, setFromStation] = useState('1');
  const [toStation, setToStation] = useState('13');
  const [fareType, setFareType] = useState('stored');
  const [fromLine, setFromLine] = useState('Taipa');
  const [toLine, setToLine] = useState('Taipa');

  const nameById = (id) => {
    const s = stations.find(s=>s.id===id);
    return s ? getName(s.name, language) : id;
  };
  const lineName = (key) => {
    if (key==='Taipa') return t('line_taipa');
    if (key==='SeacPaiVan') return t('line_seacpaivan');
    if (key==='Hengqin') return t('line_hengqin');
    return key;
  };

  const route = planRoute(fromStation, toStation);
  const result = calculateFare(fromStation, toStation, fareType);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="bg-white p-6 shadow-sm rounded-b-[32px] mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('nav_route')}</h1>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs text-slate-500 mb-1 block">{t('route_from_station')}</label>
              <div className="mb-2">
                <select value={fromLine} onChange={(e)=>{ 
                  const key = e.target.value; 
                  setFromLine(key); 
                  const first = LINES[key][0]; 
                  setFromStation(first); 
                }} className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-slate-50">
                  {Object.keys(LINES).map(k => (<option key={k} value={k}>{lineName(k)}</option>))}
                </select>
              </div>
              <select value={fromStation} onChange={(e)=>setFromStation(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 px-3 bg-slate-50">
                {LINES[fromLine].map(id => {
                  const s = stations.find(x=>x.id===id);
                  return <option key={id} value={id}>{s?getName(s.name, language):id}</option>;
                })}
              </select>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs text-slate-700 mb-1 block">{t('route_to_station')}</label>
              <div className="mb-2">
                <select value={toLine} onChange={(e)=>{ 
                  const key = e.target.value; 
                  setToLine(key); 
                  const last = LINES[key][LINES[key].length-1]; 
                  setToStation(last); 
                }} className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-slate-50">
                  {Object.keys(LINES).map(k => (<option key={k} value={k}>{lineName(k)}</option>))}
                </select>
              </div>
              <select value={toStation} onChange={(e)=>setToStation(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 px-3 bg-slate-50">
                {LINES[toLine].map(id => {
                  const s = stations.find(x=>x.id===id);
                  return <option key={id} value={id}>{s?getName(s.name, language):id}</option>;
                })}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1">
            <div className="col-span-1">
              <label className="text-xs text-slate-700 mb-1 block">{t('route_fare_type')}</label>
              <select value={fareType} onChange={(e)=>setFareType(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 px-3 bg-slate-50">
                <option value="single">{t('fare_type_single')}</option>
                <option value="stored">{t('fare_type_stored')}</option>
                <option value="student">{t('fare_type_student')}</option>
                <option value="free">{t('fare_type_free')}</option>
              </select>
            </div>
          </div>
          {route && (
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-sm">{t('route_total_fare')}</span>
                <span className="text-2xl font-bold">{typeof result.price==='number'?`MOP ${result.price.toFixed((result.price%1)?1:0)}`:'—'}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-slate-400">{t('route_estimated_time')}</span>
                <span className="font-medium text-lg">{route.time} {t('home_min')}</span>
              </div>
              <div className="space-y-4">
                {route.legs.map((leg, idx) => {
                  const isTransfer = idx > 0;
                  const transferStationId = isTransfer ? route.legs[idx-1].to : null;
                  let transferDistance = null;
                  if (transferStationId === '7') transferDistance = t('route_transfer_distance_lotus');
                  if (transferStationId === '8') transferDistance = t('route_transfer_distance_uh');

                  return (
                    <React.Fragment key={idx}>
                      {isTransfer && transferDistance && (
                        <div className="flex items-center justify-center my-2 text-xs text-blue-300 bg-blue-900/30 rounded-lg py-2 border border-blue-800/50">
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                          {t('route_transfer_walk')}: {transferDistance}
                        </div>
                      )}
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                            <span className="text-sm font-bold text-blue-100">{lineName(leg.line)}</span>
                          </div>
                          <span className="text-xs text-slate-300 bg-white/10 px-2 py-1 rounded-md">{t('route_ride_action')} · {leg.stops} {t('route_stops')}</span>
                        </div>
                        <div className="flex flex-col text-sm space-y-2">
                          <div className="flex items-center text-slate-200">
                            <div className="w-6 text-center text-slate-500 mr-2 text-xs font-bold">O</div>
                            {nameById(leg.from)}
                          </div>
                          <div className="flex items-center text-slate-200">
                            <div className="w-6 text-center text-slate-500 mr-2 text-xs font-bold">O</div>
                            {nameById(leg.to)}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="mt-4 text-xs text-slate-400">
                {t('route_fare_rules')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanning;
