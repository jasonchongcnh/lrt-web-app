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
    if (key==='Taipa') return language==='zh'?'氹仔線':'Taipa Line';
    if (key==='SeacPaiVan') return language==='zh'?'石排灣線':'Seac Pai Van Line';
    if (key==='Hengqin') return language==='zh'?'橫琴線':'Hengqin Line';
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
    if (isAdjacentOn('Taipa', a, b)) return language==='zh'?'氹仔線':'Taipa Line';
    if (isAdjacentOn('SeacPaiVan', a, b)) return language==='zh'?'石排灣線':'Seac Pai Van Line';
    if (isAdjacentOn('Hengqin', a, b)) return language==='zh'?'橫琴線':'Hengqin Line';
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
      legs: pathToSegments(p)
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
              <label className="text-xs text-slate-500 mb-1 block">{t('route_from')}</label>
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
              <label className="text-xs text-slate-700 mb-1 block">{t('route_to')}</label>
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
              <label className="text-xs text-slate-1000 mb-1 block">{t('route_fare_type')}</label>
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
                <span className="text-slate-400">{t('route_stops_count')}</span>
                <span>{result.stops}</span>
              </div>
              <div className="space-y-4">
                {route.legs.map((leg, idx) => (
                  <div key={idx} className="bg-white/5 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{leg.line}</span>
                      <span className="text-xs text-slate-300">{t('route_ride')} · {leg.stops} {t('route_stops_unit')}</span>
                    </div>
                    <div className="text-sm">
                      <div>{nameById(leg.from)} → {nameById(leg.to)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-slate-400">
                {t('route_notes')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanning;
