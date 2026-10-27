import { useEffect, useSyncExternalStore } from 'react';
import { createPreferenceStore } from './preferences';

const store = createPreferenceStore('macao-lrt.theme', 'light', value => value === 'dark' ? 'dark' : 'light');

export function useTheme() {
  const theme = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  return { theme, setTheme: store.setValue };
}
