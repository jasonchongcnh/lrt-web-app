// The cached snapshot keeps useSyncExternalStore stable between actual changes.
// Writes notify mounted components in this tab; storage events cover other tabs.
export function createPreferenceStore(key, initialValue, normalize) {
  const serverSnapshot = normalize(initialValue);
  let snapshot = serverSnapshot;
  let previousRaw;
  let initialized = false;
  const listeners = new Set();

  function getSnapshot() {
    if (typeof window === 'undefined') return snapshot;
    let raw;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return snapshot;
    }
    if (!initialized || raw !== previousRaw) {
      previousRaw = raw;
      initialized = true;
      try {
        snapshot = normalize(raw === null ? initialValue : JSON.parse(raw));
      } catch {
        snapshot = normalize(initialValue);
      }
    }
    return snapshot;
  }

  function notify() {
    for (const listener of listeners) listener();
  }

  function handleStorage(event) {
    if (event.key === key || event.key === null) {
      getSnapshot();
      notify();
    }
  }

  function subscribe(listener) {
    listeners.add(listener);
    if (listeners.size === 1 && typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  }

  function setValue(value) {
    const current = getSnapshot();
    snapshot = normalize(typeof value === 'function' ? value(current) : value);
    initialized = true;
    try {
      const raw = JSON.stringify(snapshot);
      window.localStorage.setItem(key, raw);
      previousRaw = raw;
    } catch {
      // Storage may be denied or full; preferences still work for this session.
    }
    notify();
  }

  return { getSnapshot, getServerSnapshot: () => serverSnapshot, subscribe, setValue };
}
