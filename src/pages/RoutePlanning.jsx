import React, { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { getName } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { stations } from '../lib/data';

const RoutePlanning = () => {
  const { t, language } = useLanguage();
  const [fromStation, setFromStation] = useState('1');
  const [toStation, setToStation] = useState('13');
  const [fareType, setFareType] = useState('stored');
  const [fromLine, setFromLine] = useState('Taipa');
  const [toLine, setToLine] = useState('Taipa');

  const LINES = useMemo(() => ({
    Taipa: ['1','2','3','4','5','6','7','8','9','10','11','12','13'],
    SeacPaiVan: ['8','14'],
    Hengqin: ['7','15']
  }), []);

  const EDGES = useMemo(() => {
    const edges = {};
    const add = (a,b)=>{ (edges[a]=edges[a]||new Set()).add(b); (edges[b]=edges[b]||new Set()).add(a); };
    Object.values(LINES).forEach(arr=>{
      for (let i=0;i<arr.length-1;i++){ add(arr[i], arr[i+1]); }
    });
    return edges;
  }, [LINES]);

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

  const shortestPath = (start, end) => {
    if (!start || !end) return null;
    if (start === end) return [start];
    const q = [start];
    const prev = {};
    const seen = new Set([start]);
    let found = false;
    while (q.length) {
      const node = q.shift();
      for (const nb of (EDGES[node]||[])) {
        if (seen.has(nb)) continue;
        prev[nb] = node;
        if (nb === end) { found = true; break; }
        seen.add(nb);
        q.push(nb);
      }
      if (found) break;
    }
    if (!found && !prev[end]) return null;
    const path = [end];
    let cur = end;
    while (prev[cur]) { cur = prev[cur]; path.unshift(cur); }
    return path;
  };

  const isAdjacentOn = (lineKey, a, b) => {
    const arr = LINES[lineKey];
    for (let i=0;i<arr.length-1;i++){
      if ((arr[i]===a && arr[i+1]===b) || (arr[i]===b && arr[i+1]===a)) return true;
    }
    return false;
  };

  const edgeLine = (a,b) => {
    if (isAdjacentOn('Taipa', a, b)) return t('line_taipa');
    if (isAdjacentOn('SeacPaiVan', a, b)) return t('line_seacpaivan');
    if (isAdjacentOn('Hengqin', a, b)) return t('line_hengqin');
    return '';
  };

  const pathToSegments = (path) => {
    if (!path || path.length<2) return [];
    let curLine = edgeLine(path[0], path[1]);
    let start = path[0];
    let prev = path[1];
    const legs = [];
    for (let i=2;i<path.length;i++){
      const ln = edgeLine(prev, path[i]);
      if (ln !== curLine){
        legs.push({ line: curLine, from: start, to: prev, stops: Math.max(1, path.slice(path.indexOf(start), path.indexOf(prev)+1).length-1) });
        start = prev;
        curLine = ln;
      }
      prev = path[i];
    }
    legs.push({ line: curLine, from: start, to: prev, stops: Math.max(1, path.slice(path.indexOf(start), path.indexOf(prev)+1).length-1) });
    return legs;
  };

  const adjustedStops = (start, end) => {
    const path = shortestPath(start, end);
    if (!path) return null;
    let stops = path.length - 1;
    const hasBarraOcean = path.join(',').includes(['1','2'].join(',')) || path.join(',').includes(['2','1'].join(','));
    const hasHengqinLotus = path.join(',').includes(['15','7'].join(',')) || path.join(',').includes(['7','15'].join(','));
    if (hasBarraOcean) stops += 1;
    if (hasHengqinLotus) stops += 1;
    const isStartEndUH = (start === '8' || end === '8' || start === '14' || end === '14');
    if (!isStartEndUH) {
      if (path.includes('8') && path[0] !== '8' && path[path.length-1] !== '8') {
        stops = Math.max(0, stops - 1);
      }
    }
    return stops;
  };

  const calculateTravelTime = (path) => {
    if (!path || path.length < 2) return 0;
    let time = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i+1];
      // Barra (1) <-> Ocean (2) is 5 minutes
      if ((a === '1' && b === '2') || (a === '2' && b === '1')) {
        time += 5;
      } else {
        time += 2;
      }
    }
    return time;
  };

  const bands = [
    { max: 3, single: 6, stored: 3, student: 1.5 },
    { max: 6, single: 8, stored: 4, student: 2 },
    { max: 9, single: 10, stored: 5, student: 2.5 },
    { max: 12, single: 12, stored: 6, student: 3 },
  ];

  const route = useMemo(() => {
    const p = shortestPath(fromStation, toStation);
    if (!p) return null;
    return {
      path: p,
      legs: pathToSegments(p),
      time: calculateTravelTime(p)
    };
  }, [fromStation, toStation, language]);

  const result = useMemo(() => {
    const stops = adjustedStops(fromStation, toStation);
    if (stops == null) return { stops: '-', price: '-' };
    const band = bands.find(b => stops <= b.max) || bands[bands.length-1];
    if (fareType === 'free') return { stops, price: 0 };
    if (fareType === 'single') return { stops, price: band.single };
    if (fareType === 'stored') return { stops, price: band.stored };
    if (fareType === 'student') return { stops, price: band.student };
    return { stops, price: band.single };
  }, [fromStation, toStation, fareType]);

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
                            <span className="text-sm font-bold text-blue-100">{leg.line}</span>
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
