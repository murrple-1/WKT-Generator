export interface IEnvironment {
  production: boolean;
  defaultMapTileUrlFormat: string;
  errorTileUrl: string | undefined;
  defaultWKT: string;
}
