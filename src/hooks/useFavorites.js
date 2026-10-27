import { useSyncExternalStore } from 'react';
import { stations } from '../lib/data';
import { createPreferenceStore } from './preferences';

const stationIds = new Set(stations.map(station => station.id));
const store = createPreferenceStore('macao-lrt.favorites', [], value => Object.freeze(
  Array.isArray(value) ? [...new Set(value.filter(id => stationIds.has(id)))] : [],
));

function toggleFavorite(id) {
  if (!stationIds.has(id)) return;
  store.setValue(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
}

export function useFavorites() {
  const favorites = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return { favorites, toggleFavorite };
}
