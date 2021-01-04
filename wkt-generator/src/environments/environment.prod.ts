import { IEnvironment } from './ienvironment';

export const environment: IEnvironment = {
  production: true,
  defaultMapTileUrlFormat: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  defaultWKT:
    'POLYGON ((-6.416016 59.624775, -13.447266 52.106582, -5.712891 49.094901, 3.779297 50.680581, 0.351563 61.649924, -6.416016 59.624775))',
};
