import { Component, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';

import {
  MapOptions,
  tileLayer,
  latLng,
  Map,
  Draw,
  FeatureGroup,
  Control,
  DrawEvents,
  LeafletEvent,
} from 'leaflet';

import { environment } from '@environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  leafletOptions: MapOptions = {
    layers: [
      tileLayer(environment.defaultMapTileUrlFormat, {
        maxZoom: 18,
      }),
    ],
    zoom: 4,
    maxZoom: 18,
    center: latLng(58.784771, -110.009441),
  };

  wkt = '';
  tileUrlFormat = environment.defaultMapTileUrlFormat;

  private map: Map | null = null;

  private unsubscribe$ = new Subject<void>();

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onMapReady(map: Map) {
    const editableLayer = new FeatureGroup();
    editableLayer.addTo(map);

    var drawControl = new Control.Draw({
      draw: {
        circlemarker: false,
        circle: false,
        marker: false,
        polyline: false,
      },
      edit: {
        featureGroup: editableLayer,
      },
    });
    map.addControl(drawControl);

    map.on(Draw.Event.CREATED, (e: LeafletEvent) => {
      const e_ = e as DrawEvents.Created;

      e_.layer.addTo(editableLayer);
    });

    this.map = map;
  }

  clearMap() {}

  parseInWKT() {}

  resetTileUrlFormat() {}

  parseInTileUrlFormat() {}
}
