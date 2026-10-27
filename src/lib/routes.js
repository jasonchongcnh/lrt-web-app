// Station IDs and fare rules are shared by the route planner and fare table.
export const LINES = Object.freeze({
  Taipa: Object.freeze(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13']),
  SeacPaiVan: Object.freeze(['8', '14']),
  Hengqin: Object.freeze(['7', '15']),
});

export const FARE_BANDS = Object.freeze([
  Object.freeze({ max: 3, single: 6, stored: 3, student: 1.5 }),
  Object.freeze({ max: 6, single: 8, stored: 4, student: 2 }),
  Object.freeze({ max: 9, single: 10, stored: 5, student: 2.5 }),
  Object.freeze({ max: 12, single: 12, stored: 6, student: 3 }),
]);

const FARE_TYPES = new Set(['single', 'stored', 'student', 'free']);
const edges = new Map();
const lineByEdge = new Map();
const edgeKey = (a, b) => `${a}:${b}`;

for (const [line, ids] of Object.entries(LINES)) {
  for (let i = 0; i < ids.length - 1; i += 1) {
    const a = ids[i];
    const b = ids[i + 1];
    if (!edges.has(a)) edges.set(a, new Set());
    if (!edges.has(b)) edges.set(b, new Set());
    edges.get(a).add(b);
    edges.get(b).add(a);
    lineByEdge.set(edgeKey(a, b), line);
    lineByEdge.set(edgeKey(b, a), line);
  }
}

export function shortestPath(start, end) {
  if (!edges.has(start) || !edges.has(end)) return null;
  const queue = [start];
  const previous = new Map([[start, null]]);
  for (let i = 0; i < queue.length; i += 1) {
    const current = queue[i];
    if (current === end) {
      const path = [];
      for (let node = end; node !== null; node = previous.get(node)) path.unshift(node);
      return path;
    }
    for (const next of edges.get(current)) {
      if (previous.has(next)) continue;
      previous.set(next, current);
      queue.push(next);
    }
  }
  return null;
}

function includesEdge(path, a, b) {
  return path.some((station, index) => index > 0 && (
    (path[index - 1] === a && station === b) ||
    (path[index - 1] === b && station === a)
  ));
}

export function adjustedStops(start, end) {
  const path = shortestPath(start, end);
  if (!path) return null;
  let stops = path.length - 1;
  // Each of the two sea crossings counts as two fare stops.
  if (includesEdge(path, '1', '2')) stops += 1;
  if (includesEdge(path, '7', '15')) stops += 1;
  // Union Hospital counts only when either endpoint is it or Seac Pai Van.
  const countsHospital = [start, end].some(id => id === '8' || id === '14');
  if (!countsHospital && path.includes('8')) stops -= 1;
  return Math.max(0, stops);
}

export function pathToSegments(path) {
  if (!path || path.length < 2) return [];
  const legs = [];
  for (let i = 1; i < path.length; i += 1) {
    const line = lineByEdge.get(edgeKey(path[i - 1], path[i]));
    if (!line) return [];
    const leg = legs[legs.length - 1];
    if (leg?.line === line) {
      leg.to = path[i];
      leg.stops += 1;
    } else {
      legs.push({ line, from: path[i - 1], to: path[i], stops: 1 });
    }
  }
  return legs;
}

export function calculateTravelTime(path) {
  if (!path) return 0;
  let minutes = 0;
  for (let i = 1; i < path.length; i += 1) {
    if (!lineByEdge.has(edgeKey(path[i - 1], path[i]))) return null;
    const isBarraOcean = (path[i - 1] === '1' && path[i] === '2') ||
      (path[i - 1] === '2' && path[i] === '1');
    minutes += isBarraOcean ? 5 : 2;
  }
  return minutes;
}

export function priceForBand(band, fareType = 'single') {
  if (!band || !FARE_TYPES.has(fareType)) return null;
  return fareType === 'free' ? 0 : band[fareType];
}

export function fareForStops(stops, fareType = 'single') {
  if (!Number.isInteger(stops) || stops < 0 || !FARE_TYPES.has(fareType)) return null;
  if (stops === 0) return 0;
  const band = FARE_BANDS.find(item => stops <= item.max) ?? FARE_BANDS[FARE_BANDS.length - 1];
  return priceForBand(band, fareType);
}

export function calculateFare(start, end, fareType = 'single') {
  const stops = adjustedStops(start, end);
  return { stops, price: fareForStops(stops, fareType) };
}

export function planRoute(start, end) {
  const path = shortestPath(start, end);
  return path ? { path, legs: pathToSegments(path), time: calculateTravelTime(path) } : null;
}
