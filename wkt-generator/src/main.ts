import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { Icon } from 'leaflet';

import '@geoman-io/leaflet-geoman-free';

import { AppModule } from '@app/app.module';
import { environment } from '@environments/environment';

Icon.Default.imagePath = '/assets/images/';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
