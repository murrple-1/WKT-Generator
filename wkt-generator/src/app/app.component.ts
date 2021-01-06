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
  Draw,
  FeatureGroup,
  Control,
  DrawEvents,
  Polygon,
  LatLngLiteral,
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
  private editableLayer = new FeatureGroup();
  private polygon: Polygon | null;

  private clipboard: ClipboardJS | null = null;

  private unsubscribe$ = new Subject<void>();

  constructor(private zone: NgZone) {
    const geoJson = parseWKT(this.wkt);

    if (geoJson !== null && geoJson.type === 'Polygon') {
      this.polygon = new Polygon(
        AppComponent.geoJSONXYToLeafletXY(geoJson.coordinates),
      );
      this.polygon.addTo(this.editableLayer);
    } else {
      this.wkt = '';
      this.polygon = null;
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
    this.editableLayer.addTo(this.map);

    this.map.addControl(
      new Control.Draw({
        position: 'bottomleft',
        draw: {
          circlemarker: false,
          circle: false,
          marker: false,
          polyline: false,
        },
        edit: {
          featureGroup: this.editableLayer,
        },
      }),
    );

    this.map.on(Draw.Event.CREATED, e => {
      if (this.polygon !== null) {
        this.polygon.remove();
        this.polygon = null;
      }

      const e_ = e as DrawEvents.Created;
      const layer_ = e_.layer as Polygon;

      this.polygon = layer_;

      layer_.addTo(this.editableLayer);

      const geoJson = layer_.toGeoJSON();
      const wkt = stringifyWKT(geoJson.geometry as GeoJSONGeometry);

      this.zone.run(() => {
        this.wkt = wkt;
      });
    });

    this.map.on(Draw.Event.EDITED, e => {
      const e_ = e as DrawEvents.Edited;

      const layer_ = e_.layers.getLayers()[0] as Polygon;

      const geoJson = layer_.toGeoJSON();
      const wkt = stringifyWKT(geoJson.geometry as GeoJSONGeometry);

      this.zone.run(() => {
        this.wkt = wkt;
      });
    });

    this.map.on(Draw.Event.DELETED, e => {
      const e_ = e as DrawEvents.Deleted;

      if (e_.layers.getLayers().length > 0) {
        this.polygon = null;

        this.zone.run(() => {
          this.wkt = '';
        });
      }
    });

    this.map.on('move', e => {
      const map = e.target as Map;

      const center = map.getCenter();
      const zoom = map.getZoom();

      this.zone.run(() => {
        this.latitude = center.lat.toString(10);
        this.longitude = center.lng.toString(10);
        this.zoom = zoom.toString(10);
      });
    });

    if (this.polygon !== null) {
      this.map.panTo(this.polygon.getCenter(), {
        animate: false,
      });
    }
  }

  parseInWKT() {
    const geoJson = parseWKT(this.wkt);

    if (geoJson !== null && geoJson.type === 'Polygon') {
      if (this.polygon !== null) {
        this.polygon.remove();
        this.polygon = null;
      }

      this.polygon = new Polygon(
        AppComponent.geoJSONXYToLeafletXY(geoJson.coordinates),
      );
      this.polygon.addTo(this.editableLayer);

      if (this.map !== null) {
        this.map.panTo(this.polygon.getCenter(), {
          animate: true,
        });
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
      let lat: number;
      let lng: number;
      let zoom: number;

      lat = parseFloat(this.latitude);
      if (isNaN(lat)) {
        return;
      }

      lng = parseFloat(this.longitude);
      if (isNaN(lng)) {
        return;
      }

      zoom = parseInt(this.zoom);
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
