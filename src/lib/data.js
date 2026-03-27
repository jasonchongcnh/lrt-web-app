export const stations = [
  // Taipa Line (L1)
  { 
    id: '1', 
    name: { en: 'Barra', zh: '媽閣站' }, 
    image: 'public/route_map.png', 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.534531, lat: 22.180788 }
  },
  { 
    id: '2', 
    name: { en: 'Ocean', zh: '海洋站' }, 
    image: 'https://images.unsplash.com/photo-1542367787-4baf35f3037d?auto=format&fit=crop&q=80&w=300&h=200', 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.534531, lat: 22.180788 }
  },
  { 
    id: '3', 
    name: { en: 'Jockey Club', zh: '馬會站' }, 
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=300&h=200', 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.552304, lat: 22.154209 }
  },
  { 
    id: '4', 
    name: { en: 'Stadium', zh: '運動場站' }, 
    image: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=300&h=200', 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.556949, lat: 22.151413 }
  },
  { 
    id: '5', 
    name: { en: 'Pai Kok', zh: '排角站' }, 
    image: 'https://images.unsplash.com/photo-1542367787-4baf35f3037d?auto=format&fit=crop&q=80&w=300&h=200', 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.559565, lat: 22.147918 }
  },
  { 
    id: '6', 
    name: { en: 'Cotai West', zh: '路氹西站' }, 
    image: 'https://images.unsplash.com/photo-1542367787-4baf35f3037d?auto=format&fit=crop&q=80&w=300&h=200', 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.562919, lat: 22.142109 }
  },
  { 
    id: '7', 
    name: { en: 'Lotus', zh: '蓮花站' }, 
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=300&h=200', 
    line: { en: 'Taipa Line / Hengqin Line', zh: '氹仔線 / 橫琴線' },
    coords: { lon: 113.564764, lat: 22.136424 }
  },
  { 
    id: '8', 
    name: { en: 'Union Hospital', zh: '協和醫院站' }, 
    image: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=300&h=200', 
    line: { en: 'Taipa Line / Seac Pai Van Line', zh: '氹仔線 / 石排灣線' },
    coords: { lon: 113.568326, lat: 22.135091 }
  },
  { 
    id: '9', 
    name: { en: 'East Asian Games', zh: '東亞運站' }, 
    image: 'https://images.unsplash.com/photo-1542367787-4baf35f3037d?auto=format&fit=crop&q=80&w=300&h=200', 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.550496, lat: 22.136961 }
  },
  { 
    id: '10', 
    name: { en: 'Cotai East', zh: '路氹東站' }, 
    image: 'https://images.unsplash.com/photo-1542367787-4baf35f3037d?auto=format&fit=crop&q=80&w=300&h=200', 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.574148, lat: 22.145229 }
  },
  { 
    id: '11', 
    name: { en: 'MUST', zh: '科大站' }, 
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=300&h=200', 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.575701, lat: 22.150121 }
  },
  { 
    id: '12', 
    name: { en: 'Airport', zh: '機場站' }, 
    image: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=300&h=200', 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.5760, lat: 22.1486 }
  },
  { 
    id: '13', 
    name: { en: 'Taipa Ferry Terminal', zh: '氹仔碼頭站' }, 
    image: 'https://images.unsplash.com/photo-1542367787-4baf35f3037d?auto=format&fit=crop&q=80&w=300&h=200', 
    line: { en: 'Taipa Line', zh: '氹仔線' },
    coords: { lon: 113.579, lat: 22.160 }
  },
  // Seac Pai Van Line (L2) - Union Hospital already defined above
  { 
    id: '14', 
    name: { en: 'Seac Pai Van', zh: '石排灣站' }, 
    image: 'https://images.unsplash.com/photo-1542367787-4baf35f3037d?auto=format&fit=crop&q=80&w=300&h=200', 
    line: { en: 'Seac Pai Van Line', zh: '石排灣線' },
    coords: { lon: 113.566693, lat: 22.128486 }
  },
  // Hengqin Line (L3) - Lotus already defined above
  { 
    id: '15', 
    name: { en: 'Hengqin', zh: '橫琴站' }, 
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=300&h=200', 
    line: { en: 'Hengqin Line', zh: '橫琴線' },
    coords: { lon: 113.5449167, lat: 22.1406595 }
  },
];

export const arrivals = [
  { stationId: '1', direction: { en: 'Taipa Ferry Terminal', zh: '氹仔碼頭' }, times: [2, 12, 22], status: 'On Time' },
  { stationId: '1', direction: { en: 'Barra', zh: '媽閣' }, times: [5, 15, 25], status: 'Delayed' },
  { stationId: '12', direction: { en: 'Barra', zh: '媽閣' }, times: [3, 13, 23], status: 'On Time' },
  { stationId: '12', direction: { en: 'Taipa Ferry Terminal', zh: '氹仔碼頭' }, times: [8, 18, 28], status: 'On Time' },
];

export const announcements = [
  { id: '1', title: { en: 'Weekend Maintenance', zh: '週末維護通知' }, image: 'https://images.unsplash.com/photo-1621955964441-c173e01c135b?auto=format&fit=crop&q=80&w=600&h=200' },
  { id: '2', title: { en: 'New Fares', zh: '新票價公告' }, image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600&h=200' },
];
