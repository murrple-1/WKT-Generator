import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import { Subject } from 'rxjs';

import {
  Map,
  MapOptions,
  latLng,
  tileLayer,
  Polygon,
  polygon,
  LatLngLiteral,
  Marker,
  marker,
  LatLng,
} from 'leaflet';

import {
  GeoJSONGeometry,
  GeoJSONPosition,
  parse as parseWKT,
  stringify as stringifyWKT,
} from 'wellknown';

import * as ClipboardJS from 'clipboard';

import { environment } from '@environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy, AfterViewInit {
  @ViewChild('copyWKTButton', { static: true, read: ElementRef })
  private copyWKTButton?: ElementRef<HTMLButtonElement>;

  @ViewChild('wktTextArea', { static: true, read: ElementRef })
  private wktTextArea?: ElementRef<HTMLTextAreaElement>;

  leafletOptions: MapOptions = {
    zoom: environment.initialZoom,
    maxZoom: environment.maxZoom,
    minZoom: environment.minZoom,
    center: latLng(environment.initialLatitude, environment.initialLongitude),
  };

  wkt = environment.defaultWKT;
  readonly defaultTileUrlFormat = environment.defaultMapTileUrlFormat;
  tileUrlFormat = this.defaultTileUrlFormat;

  latitude = environment.initialLatitude.toString(10);
  longitude = environment.initialLongitude.toString(10);
  zoom = environment.initialZoom.toString(10);
  readonly minZoom = environment.minZoom;
  readonly maxZoom = environment.maxZoom;

  private map: Map | null = null;

  private tileLayer = tileLayer(this.tileUrlFormat, {
    errorTileUrl: environment.errorTileUrl,
    minZoom: environment.minZoom,
    maxZoom: environment.maxZoom,
  });
  private drawnLayer: Polygon | Marker | null = null;

  private clipboard: ClipboardJS | null = null;

  private unsubscribe$ = new Subject<void>();

  constructor(private zone: NgZone) {
    const geoJson = parseWKT(this.wkt);

    if (geoJson !== null) {
      if (geoJson.type === 'Point') {
        this.drawnLayer = marker([
          geoJson.coordinates[0],
          geoJson.coordinates[1],
        ]);
      } else if (geoJson.type === 'Polygon') {
        this.drawnLayer = polygon(
          AppComponent.geoJSONXYToLeafletXY(geoJson.coordinates),
        );
      } else {
        this.wkt = '';
      }
    } else {
      this.wkt = '';
    }
  }

  private static geoJSONXYToLeafletXY(
    coordinates: GeoJSONPosition[][],
  ): LatLngLiteral[][] {
    return coordinates.map(c1 =>
      c1.map<LatLngLiteral>(c2 => ({
        lat: c2[1],
        lng: c2[0],
      })),
    );
  }

  ngAfterViewInit() {
    if (this.copyWKTButton !== undefined && this.wktTextArea !== undefined) {
      this.clipboard = new ClipboardJS(this.copyWKTButton.nativeElement, {
        action: () => 'copy',
        target: () => this.wktTextArea?.nativeElement as HTMLTextAreaElement,
      });
    }
  }

  ngOnDestroy() {
    if (this.clipboard !== null) {
      this.clipboard.destroy();
    }

    if (this.map !== null) {
      this.map.off();
      this.map.remove();
    }

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onMapReady(map: Map) {
    this.map = map;

    this.tileLayer.addTo(this.map);

    this.map.pm.addControls({
      position: 'bottomleft',
      drawMarker: true,
      drawPolygon: true,
      drawRectangle: true,

      drawCircle: false,
      drawCircleMarker: false,
      drawPolyline: false,
      editMode: false,
      dragMode: false,
      cutPolygon: false,
      rotateMode: false,
      removalMode: false,
    });

    this.map.on('pm:create', e => {
      this.map?.pm.disableDraw();

      this.drawnLayer?.remove();
      this.drawnLayer = null;

      if (e.layer instanceof Marker || e.layer instanceof Polygon) {
        this.drawnLayer = e.layer;

        const geoJson = e.layer.toGeoJSON();
        const wkt = stringifyWKT(geoJson.geometry as GeoJSONGeometry);

        this.zone.run(() => {
          this.wkt = wkt;
        });
      }
    });

    this.map.on('move', e => {
      const map_ = e.target as Map;

      const center = map_.getCenter();
      const zoom = map_.getZoom();

      this.zone.run(() => {
        this.latitude = center.lat.toString(10);
        this.longitude = center.lng.toString(10);
        this.zoom = zoom.toString(10);
      });
    });

    if (this.drawnLayer !== null) {
      this.drawnLayer.addTo(this.map);

      let center: LatLng;
      if (this.drawnLayer instanceof Marker) {
        center = this.drawnLayer.getLatLng();
      } else if (this.drawnLayer instanceof Polygon) {
        center = this.drawnLayer.getCenter();
      } else {
        throw new Error('unknown center');
      }

      this.map.panTo(center, {
        animate: false,
      });
    }
  }

  parseInWKT() {
    const geoJson = parseWKT(this.wkt);

    if (geoJson !== null) {
      if (this.drawnLayer !== null) {
        this.drawnLayer.remove();
        this.drawnLayer = null;
      }

      if (geoJson.type === 'Point') {
        this.drawnLayer = marker(
          latLng([geoJson.coordinates[0], geoJson.coordinates[1]]),
        );

        if (this.map !== null) {
          this.drawnLayer.addTo(this.map);

          this.map.panTo(this.drawnLayer.getLatLng(), {
            animate: true,
          });
        }
      } else if (geoJson.type === 'Polygon') {
        this.drawnLayer = polygon(
          AppComponent.geoJSONXYToLeafletXY(geoJson.coordinates),
        );

        if (this.map !== null) {
          this.drawnLayer.addTo(this.map);

          this.map.panTo(this.drawnLayer.getCenter(), {
            animate: true,
          });
        }
      }
    }
  }

  resetTileUrlFormat() {
    this.tileLayer.setUrl(this.defaultTileUrlFormat, false);

    this.zone.run(() => {
      this.tileUrlFormat = this.defaultTileUrlFormat;
    });
  }

  parseInTileUrlFormat() {
    this.tileLayer.setUrl(this.tileUrlFormat, false);
  }

  panTo() {
    if (this.map !== null) {
      const lat = parseFloat(this.latitude);
      if (isNaN(lat)) {
        return;
      }

      const lng = parseFloat(this.longitude);
      if (isNaN(lng)) {
        return;
      }

      const zoom = parseInt(this.zoom, 10);
      if (isNaN(zoom)) {
        return;
      }

      this.map.setView(
        {
          lat,
          lng,
        },
        zoom,
        {
          animate: true,
        },
      );
    }
  }
}
