import * as timetable from './timetable.js';
import { stations } from './data.js';

// A direction has a stable identity even when its next departure changes.
const taipa = (getter) => [
  { id: 'taipa', getter, args: ['Taipa'], destination: '13', platform: '1' },
  { id: 'barra', getter, args: ['Barra'], destination: '1', platform: '2' },
];
const branch = (id, getter, destination, platform) => ({ id, getter, args: [], destination, platform });
export const STATION_DIRECTIONS = {
  '1': [branch('taipa', 'getNextBarraArrivals', '13', '1')],
  '2': taipa('getNextOceanArrivals'),
  '3': taipa('getNextJockeyClubArrivals'),
  '4': taipa('getNextStadiumArrivals'),
  '5': taipa('getNextPaiKokArrivals'),
  '6': taipa('getNextCotaiOesteArrivals'),
  '7': [...taipa('getNextLotusArrivals'), branch('hengqin', 'getNextLotusHengqinArrivals', '15', '3')],
  '8': [...taipa('getNextHospitalArrivals'), branch('seacpaivan', 'getNextHospitalSPVArrivals', '14', '3/4')],
  '9': taipa('getNextEastAsianGamesArrivals'),
  '10': taipa('getNextCotaiLesteArrivals'),
  '11': taipa('getNextMustArrivals'),
  '12': taipa('getNextAirportArrivals'),
  '13': [branch('barra', 'getNextTaipaFerryArrivals', '1', '1/2')],
  '14': [branch('hospital', 'getNextSeacPaiVanArrivals', '8', '1/2')],
  '15': [branch('lotus', 'getNextHengqinArrivals', '7', '1')],
};
const platformLabel = { en: 'Platform', zh: '月台', 'zh-CN': '月台', pt: 'Plataforma' };

export function getStationArrivals(stationId, count = 3, now = Date.now()) {
  const definitions = Object.hasOwn(STATION_DIRECTIONS, stationId) ? STATION_DIRECTIONS[stationId] : [];
  return definitions.map((definition) => {
    const destination = stations.find((station) => station.id === definition.destination);
    const times = timetable[definition.getter](...definition.args, count, now) || [];
    const direction = Object.fromEntries(Object.entries(platformLabel).map(([language, label]) => [
      language, `${destination.name[language]} (${label} ${definition.platform})`,
    ]));
    return {
      id: definition.id,
      stationId,
      direction,
      times,
      departures: times.map((minutes) => Math.floor(now / 60_000) * 60_000 + minutes * 60_000),
      status: times.length ? '' : 'Out of Service',
    };
  });
}
