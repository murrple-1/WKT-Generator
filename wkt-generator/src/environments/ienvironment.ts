export interface IEnvironment {
  production: boolean;
  defaultMapTileUrlFormat: string;
  maxZoom: number;
  minZoom: number;
  initialZoom: number;
  initialLatitude: number;
  initialLongitude: number;
  errorTileUrl: string | undefined;
  defaultWKT: string;
}
