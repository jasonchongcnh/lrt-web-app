import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createPreferenceStore } from '../src/hooks/preferences.js';

function withStorage(run) {
  const previous = globalThis.window;
  const values = new Map();
  const events = new EventTarget();
  const storage = { blocked: false,
    getItem(key) { if (this.blocked) throw new Error('Storage disabled'); return values.get(key) ?? null; },
    setItem(key, value) { if (this.blocked) throw new Error('Storage disabled'); values.set(key, value); },
  };
  globalThis.window = {
    localStorage: storage,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
  };
  try { run({ values, storage, events }); }
  finally { if (previous === undefined) delete globalThis.window; else globalThis.window = previous; }
}
const normalize = value => Object.freeze(Array.isArray(value) ? value.filter(item => typeof item === 'string') : []);

test('preference snapshots stay stable and same-tab subscribers receive writes', () => withStorage(({ values }) => {
  const store = createPreferenceStore('saved', [], normalize);
  assert.equal(store.getSnapshot(), store.getSnapshot());
  let changes = 0;
  const unsubscribe = store.subscribe(() => changes++);
  store.setValue(['1']);
  assert.deepEqual(store.getSnapshot(), ['1']);
  store.setValue(previous => [...previous, '2']);
  assert.equal(changes, 2);
  assert.deepEqual(JSON.parse(values.get('saved')), ['1', '2']);
  unsubscribe();
  store.setValue([]);
  assert.equal(changes, 2);
}));

test('corrupt preferences fall back safely and cross-tab changes refresh the snapshot', () => withStorage(({ values, events }) => {
  values.set('saved', '{bad-json');
  const store = createPreferenceStore('saved', [], normalize);
  assert.deepEqual(store.getSnapshot(), []);
  let changes = 0;
  const unsubscribe = store.subscribe(() => changes++);
  values.set('saved', JSON.stringify(['15', null, 1]));
  const event = new Event('storage');
  event.key = 'saved';
  events.dispatchEvent(event);
  assert.equal(changes, 1);
  assert.deepEqual(store.getSnapshot(), ['15']);
  unsubscribe();
}));

test('preferences remain usable when browser storage is disabled', () => withStorage(({ storage }) => {
  storage.blocked = true;
  const store = createPreferenceStore('saved', [], normalize);
  store.setValue(['7']);
  assert.deepEqual(store.getSnapshot(), ['7']);
  store.setValue(previous => [...previous, '8']);
  assert.deepEqual(store.getSnapshot(), ['7', '8']);
}));
