import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, LeafletModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
