import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { Icon } from 'leaflet';
import 'leaflet-draw';

import { AppModule } from '@app/app.module';
import { environment } from '@environments/environment';

Icon.Default.imagePath = '/assets/images/';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
