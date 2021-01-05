// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { IEnvironment } from './ienvironment';

export const environment: IEnvironment = {
  production: false,
  defaultMapTileUrlFormat: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  errorTileUrl: undefined,
  initialZoom: 4,
  maxZoom: 18,
  minZoom: 0,
  defaultWKT:
    'POLYGON ((-6.416016 59.624775, -13.447266 52.106582, -5.712891 49.094901, 3.779297 50.680581, 0.351563 61.649924, -6.416016 59.624775))',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
