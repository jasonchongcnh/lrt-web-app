export const REMOTE_BASE = 'https://jasonchongcnh.github.io/lrt-web-app/';

export const stations = [
  // Taipa Line (L1)
  { 
    id: '1', 
    name: { en: 'Barra', zh: '媽閣站' }, 
    image: `${REMOTE_BASE}Barra.jpg`, 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.529448, lat: 22.183645 }
  },
  { 
    id: '2', 
    name: { en: 'Ocean', zh: '海洋站' }, 
    image: `${REMOTE_BASE}Ocean.jpg`, 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.541308, lat: 22.157808 }
  },
  { 
    id: '3', 
    name: { en: 'Jockey Club', zh: '馬會站' }, 
    image: `${REMOTE_BASE}Jockey-Club.jpg`, 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.547273, lat: 22.157102 }
  },
  { 
    id: '4', 
    name: { en: 'Stadium', zh: '運動場站' }, 
    image: `${REMOTE_BASE}Stadium.jpg`, 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.551897, lat: 22.154351 }
  },
  { 
    id: '5', 
    name: { en: 'Pai Kok', zh: '排角站' }, 
    image: `${REMOTE_BASE}Pai-Kok.jpg`,
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.554558, lat: 22.150893 }
  },
  { 
    id: '6', 
    name: { en: 'Cotai West', zh: '路氹西站' }, 
    image: `${REMOTE_BASE}Cotai-West.jpg`,
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.557873, lat: 22.145079 }
  },
  { 
    id: '7', 
    name: { en: 'Lotus', zh: '蓮花站' }, 
    image: `${REMOTE_BASE}Lotus.jpg`, 
    line: { en: 'Taipa Line / Hengqin Line', zh: '氹仔線 / 橫琴線' },
    coords: { lon: 113.559826, lat: 22.139454 }
  },
  { 
    id: '8', 
    name: { en: 'Union Hospital', zh: '協和醫院站' }, 
    image: `${REMOTE_BASE}Union-Hospital.jpg`, 
    line: { en: 'Taipa Line / Seac Pai Van Line', zh: '氹仔線 / 石排灣線' },
    coords: { lon: 113.563344, lat: 22.138679 }
  },
  { 
    id: '9', 
    name: { en: 'East Asian Games', zh: '東亞運站' }, 
    image: `${REMOTE_BASE}East-Asian-Games.jpg`, 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.568666, lat: 22.142414 }
  },
  { 
    id: '10', 
    name: { en: 'Cotai East', zh: '路氹東站' }, 
    image: `${REMOTE_BASE}Cotai-East.jpg`,
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.569149, lat: 22.148239 }
  },
  { 
    id: '11', 
    name: { en: 'MUST', zh: '科大站' }, 
    image: `${REMOTE_BASE}MUST.jpg`, 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.570598, lat: 22.153058 }
  },
  { 
    id: '12', 
    name: { en: 'Airport', zh: '機場站' }, 
    image: `${REMOTE_BASE}Airport.jpg`, 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.574631, lat: 22.159417 }
  },
  { 
    id: '13', 
    name: { en: 'Taipa Ferry Terminal', zh: '氹仔碼頭站' }, 
    image: `${REMOTE_BASE}Taipa-Ferry-Terminal.jpg`, 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.573891, lat: 22.162984 }
  },
  // Seac Pai Van Line (L2) - Union Hospital already defined above
  { 
    id: '14', 
    name: { en: 'Seac Pai Van', zh: '石排灣站' }, 
    image: `${REMOTE_BASE}Seac-Pai-Van.jpg`, 
    line: { en: 'Seac Pai Van Line', zh: '石排灣線' },
    coords: { lon: 113.561600, lat: 22.131370 }
  },
  // Hengqin Line (L3) - Lotus already defined above
  { 
    id: '15', 
    name: { en: 'Hengqin', zh: '橫琴站' }, 
    image: `${REMOTE_BASE}Hengqin.jpg`, 
    line: { en: 'Hengqin Line', zh: '橫琴線' },
    coords: { lon: 113.544903, lat: 22.140646 }
  },
];

export const arrivals = [
  { stationId: '1', direction: { en: 'Taipa Ferry Terminal', zh: '氹仔碼頭' }, times: [2, 12, 22], status: 'On Time' },
  { stationId: '1', direction: { en: 'Barra', zh: '媽閣' }, times: [5, 15, 25], status: 'Delayed' },
  { stationId: '12', direction: { en: 'Barra', zh: '媽閣' }, times: [3, 13, 23], status: 'On Time' },
  { stationId: '12', direction: { en: 'Taipa Ferry Terminal', zh: '氹仔碼頭' }, times: [8, 18, 28], status: 'On Time' },
];

export const announcements = [
  { id: '1', title: { en: 'Weekend Maintenance', zh: '週末維護通知' }, image: `${REMOTE_BASE}Weekend-Maintenance.jpg` },
  { id: '2', title: { en: 'New Fares', zh: '新票價公告' }, image: `${REMOTE_BASE}New-Fares.jpg` },
];
