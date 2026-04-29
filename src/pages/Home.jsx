import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, ChevronRight, Bell, AlertTriangle, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { stations, arrivals, announcements } from '../lib/data';
import { cn, getName } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useImage } from '../contexts/ImageContext';
import { 
  getNextBarraArrivals, 
  getNextOceanArrivals, 
  getNextJockeyClubArrivals, 
  getNextStadiumArrivals, 
  getNextPaiKokArrivals, 
  getNextCotaiOesteArrivals,
  getNextLotusArrivals,
  getNextHospitalArrivals,
  getNextEastAsianGamesArrivals,
  getNextCotaiLesteArrivals,
  getNextMustArrivals,
  getNextAirportArrivals,
  getNextTaipaFerryArrivals,
  getNextHospitalSPVArrivals,
  getNextSeacPaiVanArrivals,
  getNextLotusHengqinArrivals,
  getNextHengqinArrivals
} from '../lib/timetable';

const Home = () => {
  const { t, language, setLanguage } = useLanguage();
  const { showImage } = useImage();
  const [reminders, setReminders] = useState({});
  const [barraTimes, setBarraTimes] = useState([]);
  const [notifyScheduledFor, setNotifyScheduledFor] = useState(null);
  const notifyRef = useRef(null);
  const [currentStation, setCurrentStation] = useState(stations[0]);
  const [noNearby, setNoNearby] = useState(false);
  const [manualLine, setManualLine] = useState('Taipa Line');
  const imminentRef = useRef({});
  const LINES = {
    'Taipa Line': ['Barra','Ocean','Jockey Club','Stadium','Pai Kok','Cotai West','Lotus','Union Hospital','East Asian Games','Cotai East','MUST','Airport','Taipa Ferry Terminal'],
    'Seac Pai Van Line': ['Union Hospital','Seac Pai Van'],
    'Hengqin Line': ['Lotus','Hengqin']
  };
  const [manualStation, setManualStation] = useState('Barra');
  const LINE_LABELS = {
    'Taipa Line': { zh: '氹仔線', en: 'Taipa Line' },
    'Seac Pai Van Line': { zh: '石排灣線', en: 'Seac Pai Van Line' },
    'Hengqin Line': { zh: '橫琴線', en: 'Hengqin Line' }
  };

  const [userLocation, setUserLocation] = useState(null);
  const [locAccuracy, setLocAccuracy] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const stationMarkersRef = useRef({});
  
  const toRad = d => (d * Math.PI) / 180;
  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // km
  };

  const initMap = (lat, lon, accuracy) => {
    if (window.L && mapRef.current && !mapInstance.current) {
      // Initialize Leaflet map
      mapInstance.current = window.L.map(mapRef.current).setView([lat, lon], 15);
      
      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      // Custom SVG Icons
      const userIcon = window.L.divIcon({
        className: 'bg-transparent',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 drop-shadow-md" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="#ffffff"></circle></svg>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const stationIcon = window.L.divIcon({
        className: 'bg-transparent',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#eab308" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7 drop-shadow-md transition-transform hover:scale-110" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="#ffffff"></circle></svg>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
      });

      // Add user marker
      userMarkerRef.current = window.L.marker([lat, lon], { icon: userIcon }).addTo(mapInstance.current)
        .bindPopup(t('home_your_location'));

      if (accuracy) {
        accuracyCircleRef.current = window.L.circle([lat, lon], {
          radius: accuracy,
          color: '#38bdf8',
          fillColor: '#38bdf8',
          fillOpacity: 0.15,
          weight: 2
        }).addTo(mapInstance.current);
      }

      // Add station markers
      stations.forEach(s => {
        if (s.coords) {
          const marker = window.L.marker([s.coords.lat, s.coords.lon], { icon: stationIcon }).addTo(mapInstance.current);
          
          marker.bindTooltip(getName(s.name, language), { permanent: false, direction: 'top', offset: [0, -28] });
          
          marker.on('click', () => {
            setCurrentStation(s);
            setNoNearby(false);
            setManualStation(s.name.en);
            setManualLine(prev => {
              if (LINES[prev] && LINES[prev].includes(s.name.en)) return prev;
              const found = Object.entries(LINES).find(([_, stns]) => stns.includes(s.name.en));
              return found ? found[0] : prev;
            });
          });

          stationMarkersRef.current[s.id] = marker;
        }
      });
    } else if (mapInstance.current) {
      mapInstance.current.setView([lat, lon]);
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([lat, lon]);
      }
      if (accuracy) {
        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.setLatLng([lat, lon]);
          accuracyCircleRef.current.setRadius(accuracy);
        } else {
          accuracyCircleRef.current = window.L.circle([lat, lon], {
            radius: accuracy,
            color: '#38bdf8',
            fillColor: '#38bdf8',
            fillOpacity: 0.15,
            weight: 2
          }).addTo(mapInstance.current);
        }
      }
    }
  };

  const handleLocationSuccess = (lat, lon, accuracy) => {
    setUserLocation({ lat, lon });
    setLocAccuracy(accuracy);
    setIsLocating(false);
    initMap(lat, lon, accuracy);
    
    let nearest = null;
    let best = Infinity;
    for (const s of stations) {
      if (!s.coords) continue;
      const d = haversine(lat, lon, s.coords.lat, s.coords.lon);
      if (d < best) { best = d; nearest = s; }
    }
    // Sensitivity set to 500m (0.5km)
    if (nearest && best <= 0.5) {
      setCurrentStation(nearest);
      setManualStation(nearest.name.en);
      setNoNearby(false);
      setManualLine(prev => {
        if (LINES[prev] && LINES[prev].includes(nearest.name.en)) return prev;
        const found = Object.entries(LINES).find(([_, stns]) => stns.includes(nearest.name.en));
        return found ? found[0] : prev;
      });
    } else {
      setCurrentStation(stations[0]); // Barra
      setManualStation('Barra');
      setManualLine('Taipa Line');
      setNoNearby(true);
    }
  };

  const requestGeolocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => handleLocationSuccess(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
        () => { 
          setIsLocating(false);
          setCurrentStation(stations[0]); 
          setNoNearby(true);
          // Default to Barra if location fails
          initMap(22.180788, 113.534531); 
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      setCurrentStation(stations[0]);
      setNoNearby(true);
    }
  };

  useEffect(() => {
    const updateTimes = () => {
      const times = getNextBarraArrivals(2);
      setBarraTimes(times);
    };
    
    updateTimes();
    const interval = setInterval(updateTimes, 60000);

    requestGeolocation();

    return () => {
      clearInterval(interval);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const s = stations.find(s => s.name.en === manualStation);
    if (s) {
      setCurrentStation(s);
      setNoNearby(false);
    }
  }, [manualStation]);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try { Notification.requestPermission(); } catch {}
    }
  }, []);

  const toggleReminder = (id) => {
    setReminders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const nearbyStation = currentStation;
  // Use real-time data for Barra, otherwise show mock times for selected station
  const getArrivals = () => {
    if (nearbyStation.id === '1') {
      const times = getNextBarraArrivals(2);
      if (!times) return [{ stationId: '1', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: [], status: 'Out of Service' }];
      return [{ stationId: '1', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times, status: '' }];
    }
    if (nearbyStation.id === '2') {
      const toTaipa = getNextOceanArrivals('Taipa', 1);
      const toBarra = getNextOceanArrivals('Barra', 1);
      const res = [];
      if (toTaipa) res.push({ stationId: '2', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: toTaipa, status: '' });
      else res.push({ stationId: '2', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: [], status: 'Out of Service' });
      
      if (toBarra) res.push({ stationId: '2', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: toBarra, status: '' });
      else res.push({ stationId: '2', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: [], status: 'Out of Service' });
      return res;
    }
    if (nearbyStation.id === '3') {
      const toTaipa = getNextJockeyClubArrivals('Taipa', 1);
      const toBarra = getNextJockeyClubArrivals('Barra', 1);
      const res = [];
      if (toTaipa) res.push({ stationId: '3', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: toTaipa, status: '' });
      else res.push({ stationId: '3', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: [], status: 'Out of Service' });
      
      if (toBarra) res.push({ stationId: '3', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: toBarra, status: '' });
      else res.push({ stationId: '3', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: [], status: 'Out of Service' });
      return res;
    }
    if (nearbyStation.id === '4') {
      const toTaipa = getNextStadiumArrivals('Taipa', 1);
      const toBarra = getNextStadiumArrivals('Barra', 1);
      const res = [];
      if (toTaipa) res.push({ stationId: '4', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: toTaipa, status: '' });
      else res.push({ stationId: '4', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: [], status: 'Out of Service' });
      
      if (toBarra) res.push({ stationId: '4', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: toBarra, status: '' });
      else res.push({ stationId: '4', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: [], status: 'Out of Service' });
      return res;
    }
    if (nearbyStation.id === '5') {
      const toTaipa = getNextPaiKokArrivals('Taipa', 1);
      const toBarra = getNextPaiKokArrivals('Barra', 1);
      const res = [];
      if (toTaipa) res.push({ stationId: '5', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: toTaipa, status: '' });
      else res.push({ stationId: '5', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: [], status: 'Out of Service' });
      
      if (toBarra) res.push({ stationId: '5', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: toBarra, status: '' });
      else res.push({ stationId: '5', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: [], status: 'Out of Service' });
      return res;
    }
    if (nearbyStation.id === '6') {
      const toTaipa = getNextCotaiOesteArrivals('Taipa', 1);
      const toBarra = getNextCotaiOesteArrivals('Barra', 1);
      const res = [];
      if (toTaipa) res.push({ stationId: '6', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: toTaipa, status: '' });
      else res.push({ stationId: '6', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: [], status: 'Out of Service' });
      
      if (toBarra) res.push({ stationId: '6', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: toBarra, status: '' });
      else res.push({ stationId: '6', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: [], status: 'Out of Service' });
      return res;
    }
    if (nearbyStation.id === '7') {
      const toTaipa = getNextLotusArrivals('Taipa', 1);
      const toBarra = getNextLotusArrivals('Barra', 1);
      const toHengqin = getNextLotusHengqinArrivals(1);
      const res = [];
      
      if (manualLine === 'Taipa Line') {
        // Taipa Line Platforms
        if (toTaipa) res.push({ stationId: '7', direction: { en: 'Taipa Ferry Terminal (Taipa Line P1)', zh: '氹仔碼頭（1號月台）' }, times: toTaipa, status: '' });
        else res.push({ stationId: '7', direction: { en: 'Taipa Ferry Terminal (Taipa Line P1)', zh: '氹仔碼頭（1號月台）' }, times: [], status: 'Out of Service' });
        
        if (toBarra) res.push({ stationId: '7', direction: { en: 'Barra (Taipa Line P2)', zh: '媽閣（2號月台）' }, times: toBarra, status: '' });
        else res.push({ stationId: '7', direction: { en: 'Barra (Taipa Line P2)', zh: '媽閣（2號月台）' }, times: [], status: 'Out of Service' });
      } else if (manualLine === 'Hengqin Line') {
        // Hengqin Line Platform
        if (toHengqin) res.push({ stationId: '7', direction: { en: 'Hengqin (Hengqin Line P3)', zh: '橫琴（3號月台）' }, times: toHengqin, status: '' });
        else res.push({ stationId: '7', direction: { en: 'Hengqin (Hengqin Line P3)', zh: '橫琴（3號月台）' }, times: [], status: 'Out of Service' });
      } else {
        // Fallback: show all if not properly matched (e.g. initial load without specific line logic)
        if (toTaipa) res.push({ stationId: '7', direction: { en: 'Taipa Ferry Terminal (Taipa Line P1)', zh: '氹仔碼頭（1號月台）' }, times: toTaipa, status: '' });
        else res.push({ stationId: '7', direction: { en: 'Taipa Ferry Terminal (Taipa Line P1)', zh: '氹仔碼頭（1號月台）' }, times: [], status: 'Out of Service' });
        
        if (toBarra) res.push({ stationId: '7', direction: { en: 'Barra (Taipa Line P2)', zh: '媽閣（2號月台）' }, times: toBarra, status: '' });
        else res.push({ stationId: '7', direction: { en: 'Barra (Taipa Line P2)', zh: '媽閣（2號月台）' }, times: [], status: 'Out of Service' });

        if (toHengqin) res.push({ stationId: '7', direction: { en: 'Hengqin (Hengqin Line P3)', zh: '橫琴（3號月台）' }, times: toHengqin, status: '' });
        else res.push({ stationId: '7', direction: { en: 'Hengqin (Hengqin Line P3)', zh: '橫琴（3號月台）' }, times: [], status: 'Out of Service' });
      }
      
      return res;
    }
    if (nearbyStation.id === '8') {
      const toTaipa = getNextHospitalArrivals('Taipa', 1);
      const toBarra = getNextHospitalArrivals('Barra', 1);
      const toSPV = getNextHospitalSPVArrivals(1);
      const res = [];
      
      if (manualLine === 'Taipa Line') {
        // Taipa Line Platforms
        if (toTaipa) res.push({ stationId: '8', direction: { en: 'Taipa Ferry Terminal (Taipa Line P1)', zh: '氹仔碼頭（1號月台）' }, times: toTaipa, status: '' });
        else res.push({ stationId: '8', direction: { en: 'Taipa Ferry Terminal (Taipa Line P1)', zh: '氹仔碼頭（1號月台）' }, times: [], status: 'Out of Service' });
        
        if (toBarra) res.push({ stationId: '8', direction: { en: 'Barra (Taipa Line P2)', zh: '媽閣（2號月台）' }, times: toBarra, status: '' });
        else res.push({ stationId: '8', direction: { en: 'Barra (Taipa Line P2)', zh: '媽閣（2號月台）' }, times: [], status: 'Out of Service' });
      } else if (manualLine === 'Seac Pai Van Line') {
        // Seac Pai Van Line Platform
        if (toSPV) res.push({ stationId: '8', direction: { en: 'Seac Pai Van (SPV Line P3/4)', zh: '石排灣（3/4號月台）' }, times: toSPV, status: '' });
        else res.push({ stationId: '8', direction: { en: 'Seac Pai Van (SPV Line P3/4)', zh: '石排灣（3/4號月台）' }, times: [], status: 'Out of Service' });
      } else {
        // Fallback
        if (toTaipa) res.push({ stationId: '8', direction: { en: 'Taipa Ferry Terminal (Taipa Line P1)', zh: '氹仔碼頭（1號月台）' }, times: toTaipa, status: '' });
        else res.push({ stationId: '8', direction: { en: 'Taipa Ferry Terminal (Taipa Line P1)', zh: '氹仔碼頭（1號月台）' }, times: [], status: 'Out of Service' });
        
        if (toBarra) res.push({ stationId: '8', direction: { en: 'Barra (Taipa Line P2)', zh: '媽閣（2號月台）' }, times: toBarra, status: '' });
        else res.push({ stationId: '8', direction: { en: 'Barra (Taipa Line P2)', zh: '媽閣（2號月台）' }, times: [], status: 'Out of Service' });

        if (toSPV) res.push({ stationId: '8', direction: { en: 'Seac Pai Van (SPV Line P3/4)', zh: '石排灣（3/4號月台）' }, times: toSPV, status: '' });
        else res.push({ stationId: '8', direction: { en: 'Seac Pai Van (SPV Line P3/4)', zh: '石排灣（3/4號月台）' }, times: [], status: 'Out of Service' });
      }
      
      return res;
    }
    if (nearbyStation.id === '9') {
      const toTaipa = getNextEastAsianGamesArrivals('Taipa', 1);
      const toBarra = getNextEastAsianGamesArrivals('Barra', 1);
      const res = [];
      if (toTaipa) res.push({ stationId: '9', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: toTaipa, status: '' });
      else res.push({ stationId: '9', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: [], status: 'Out of Service' });
      
      if (toBarra) res.push({ stationId: '9', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: toBarra, status: '' });
      else res.push({ stationId: '9', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: [], status: 'Out of Service' });
      return res;
    }
    if (nearbyStation.id === '10') {
      const toTaipa = getNextCotaiLesteArrivals('Taipa', 1);
      const toBarra = getNextCotaiLesteArrivals('Barra', 1);
      const res = [];
      if (toTaipa) res.push({ stationId: '10', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: toTaipa, status: '' });
      else res.push({ stationId: '10', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: [], status: 'Out of Service' });
      
      if (toBarra) res.push({ stationId: '10', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: toBarra, status: '' });
      else res.push({ stationId: '10', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: [], status: 'Out of Service' });
      return res;
    }
    if (nearbyStation.id === '11') {
      const toTaipa = getNextMustArrivals('Taipa', 1);
      const toBarra = getNextMustArrivals('Barra', 1);
      const res = [];
      if (toTaipa) res.push({ stationId: '11', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: toTaipa, status: '' });
      else res.push({ stationId: '11', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: [], status: 'Out of Service' });
      
      if (toBarra) res.push({ stationId: '11', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: toBarra, status: '' });
      else res.push({ stationId: '11', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: [], status: 'Out of Service' });
      return res;
    }
    if (nearbyStation.id === '12') {
      const toTaipa = getNextAirportArrivals('Taipa', 1);
      const toBarra = getNextAirportArrivals('Barra', 1);
      const res = [];
      if (toTaipa) res.push({ stationId: '12', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: toTaipa, status: '' });
      else res.push({ stationId: '12', direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' }, times: [], status: 'Out of Service' });
      
      if (toBarra) res.push({ stationId: '12', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: toBarra, status: '' });
      else res.push({ stationId: '12', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: [], status: 'Out of Service' });
      return res;
    }
    if (nearbyStation.id === '13') {
      const times = getNextTaipaFerryArrivals(2);
      if (!times) return [{ stationId: '13', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times: [], status: 'Out of Service' }];
      return [{ stationId: '13', direction: { en: 'Barra (Platform 2)', zh: '媽閣（2號月台）' }, times, status: '' }];
    }
    if (nearbyStation.id === '14') {
      const times = getNextSeacPaiVanArrivals(2);
      if (!times) return [{ stationId: '14', direction: { en: 'Union Hospital (Platform 1/2)', zh: '協和醫院（1/2號月台）' }, times: [], status: 'Out of Service' }];
      return [{ stationId: '14', direction: { en: 'Union Hospital (Platform 1/2)', zh: '協和醫院（1/2號月台）' }, times, status: '' }];
    }
    if (nearbyStation.id === '15') {
      const times = getNextHengqinArrivals(2);
      if (!times) return [{ stationId: '15', direction: { en: 'Lotus (Platform 1)', zh: '蓮花（1號月台）' }, times: [], status: 'Out of Service' }];
      return [{ stationId: '15', direction: { en: 'Lotus (Platform 1)', zh: '蓮花（1號月台）' }, times, status: '' }];
    }
    const mockTimes = [3, 9];
    return mockTimes.map((m) => ({
      stationId: nearbyStation.id,
      direction: { en: 'Taipa Ferry Terminal (Platform 1)', zh: '氹仔碼頭（1號月台）' },
      times: [m],
      status: ''
    }));
  };

  const currentArrivals = getArrivals();

  useEffect(() => {
    const arrs = currentArrivals || [];
    arrs.forEach((a, idx) => {
      const mins = Array.isArray(a.times) ? a.times[0] : null;
      if (mins == null) return;
      if (mins <= 1 && mins >= 0) {
        const key = `${nearbyStation.id}-${idx}-${mins}`;
        if (!imminentRef.current[key]) {
          imminentRef.current[key] = true;
          const title = t('reminder_train_arriving_title');
          const body = t('reminder_train_arriving_body')
            .replace('{station}', getName(nearbyStation.name, language))
            .replace('{direction}', getName(a.direction, language));
            
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try { new Notification(title, { body: body, tag: 'arrival-imminent' }); } catch {}
          }
          alert(body);
        }
      }
    });
  }, [currentArrivals, nearbyStation, language, t]);

  return (
    <div className="pb-6 space-y-6">
      {/* Header */}
      <div className="bg-blue-600 p-6 pt-10 text-white rounded-b-[32px] shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full shadow-sm bg-white p-0.5 object-cover" />
                <div>
                  <h1 className="text-2xl font-bold">{t('app_name')}</h1>
                  <p className="text-blue-100 text-sm mt-1">{t('welcome_message')}</p>
                </div>
              </div>
              <div className="flex bg-blue-500/30 p-1 rounded-xl backdrop-blur-sm border border-white/10">
                <button 
                  onClick={() => setLanguage('zh')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    language === 'zh' ? "bg-white text-blue-600 shadow-sm" : "text-blue-100 hover:text-white"
                  )}
                >
                  繁
                </button>
                <button 
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    language === 'en' ? "bg-white text-blue-600 shadow-sm" : "text-blue-100 hover:text-white"
                  )}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Nearby Station Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="flex items-center text-blue-50 mb-3">
            <MapPin className="w-4 h-4 mr-2" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{getName(nearbyStation.name, language)}</span>
            </div>
          </div>
          
          {/* Embedded Map Container */}
          <div className="w-full h-48 rounded-xl overflow-hidden mb-4 relative bg-slate-200 shadow-inner group">
            <div ref={mapRef} className="w-full h-full" id="map-container"></div>
            
            {/* Manual Locate Button - Positioned below Zoom Controls */}
            <Button 
              size="icon"
              className={cn(
                "absolute top-[84px] left-[10px] w-[34px] h-[34px] rounded-sm shadow-md transition-all z-[1000] border-2 border-black/20",
                isLocating ? "bg-blue-100 text-blue-600 animate-pulse" : "bg-white text-slate-700 hover:bg-slate-50"
              )}
              onClick={requestGeolocation}
              disabled={isLocating}
            >
              <MapPin className={cn("w-4 h-4", isLocating && "animate-bounce")} />
            </Button>

            {/* Accuracy Indicator Overlay */}
            {locAccuracy && (
              <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-white pointer-events-none z-10 border border-white/10">
                {t('home_accuracy')}: ±{Math.round(locAccuracy)}m
              </div>
            )}

            {(isLocating || (!userLocation && !noNearby)) && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100/30 backdrop-blur-[1px]">
                <div className="bg-white/90 p-3 rounded-2xl shadow-xl flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-xs font-medium text-slate-600">
                    {t('home_locating')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {noNearby && (
            <div className="mb-3 text-xs text-yellow-100 bg-yellow-500/20 border border-yellow-300/40 rounded p-2">
              {t('home_no_lrt_near')}
            </div>
          )}
          <div className="space-y-3">
            {currentArrivals.map((arrival, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white text-slate-800 p-3 rounded-xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className={cn("w-2 h-8 rounded-full", arrival.status === 'Out of Service' ? "bg-slate-300" : "bg-blue-500")}></div>
                  <div>
                    <p className="font-bold text-sm">{getName(arrival.direction, language)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                   <div className="text-right">
                    {arrival.status === 'Out of Service' ? (
                      <span className="text-sm font-bold text-slate-400">
                        {t('station_out_of_service')}
                      </span>
                    ) : arrival.times[0] === 0 ? (
                      <span className="text-base font-bold text-blue-600">{t('station_arrived')}</span>
                    ) : arrival.times[0] === 1 ? (
                      <span className="text-base font-bold text-blue-600">{t('station_arriving_soon')}</span>
                    ) : (
                      <>
                        <span className="text-xl font-bold text-blue-600">{arrival.times[0]}</span>
                        <span className="text-xs text-gray-500 ml-1">{t('home_min')}</span>
                      </>
                    )}
                  </div>
                  {arrival.status !== 'Out of Service' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("h-8 w-8 rounded-full", reminders[`${arrival.stationId}-${idx}`] ? "text-blue-600 bg-blue-50" : "text-gray-300")}
                      onClick={() => {
                        toggleReminder(`${arrival.stationId}-${idx}`);
                        if (!reminders[`${arrival.stationId}-${idx}`]) {
                          const alertMsg = t('reminder_set_alert')
                            .replace('{station}', getName(nearbyStation.name, language))
                            .replace('{direction}', getName(arrival.direction, language))
                            .replace('{min}', arrival.times[0]);
                          alert(alertMsg);
                        }
                      }}
                    >
                      <Bell className="w-4 h-4" fill={reminders[`${arrival.stationId}-${idx}`] ? "currentColor" : "none"} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual station selection */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <h2 className="text-lg font-bold text-slate-800 mb-3">{t('home_select_station')}</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">{t('home_select_line')}</label>
              <select value={manualLine} onChange={(e)=>{ setManualLine(e.target.value); setManualStation(LINES[e.target.value][0]); }} className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-slate-50">
                {Object.keys(LINES).map(line => (<option key={line} value={line}>{getName(LINE_LABELS[line], language)}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">{t('home_select_station')}</label>
              <select value={manualStation} onChange={(e)=> setManualStation(e.target.value)} className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-slate-50">
                {LINES[manualLine].map(n => {
                  const alias = { 
                    'Taipa Ferry': 'Taipa Ferry Terminal',
                    'Taipa Ferry Terminal': 'Taipa Ferry Terminal'
                  };
                  const target = alias[n] || n;
                  const sObj = stations.find(s => s.name.en === target || s.name.zh === target);
                  const label = sObj ? getName(sObj.name, language) : (language==='zh'? n : n);
                  return (<option key={n} value={n}>{label}</option>);
                })}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
