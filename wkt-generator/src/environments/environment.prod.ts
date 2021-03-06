import { IEnvironment } from './ienvironment';

export const environment: IEnvironment = {
  production: true,
  defaultMapTileUrlFormat: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  errorTileUrl: undefined,
  initialZoom: 4,
  maxZoom: 18,
  minZoom: 0,
  initialLatitude: 0,
  initialLongitude: 0,
  defaultWKT:
    'POLYGON ((-6.416016 59.624775, -13.447266 52.106582, -5.712891 49.094901, 3.779297 50.680581, 0.351563 61.649924, -6.416016 59.624775))',
};
