import { Component, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';

import { MapOptions, tileLayer, latLng, Map } from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  leafletOptions: MapOptions = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }),
    ],
    zoom: 4,
    maxZoom: 18,
    center: latLng(58.784771, -110.009441),
  };

  private map: Map | null = null;

  private unsubscribe$ = new Subject<void>();

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onMapReady(map: Map) {
    this.map = map;
  }
}
