export interface IEnvironment {
  production: boolean;
  defaultMapTileUrlFormat: string;
  maxZoom: number;
  minZoom: number;
  initialZoom: number;
  errorTileUrl: string | undefined;
  defaultWKT: string;
}
