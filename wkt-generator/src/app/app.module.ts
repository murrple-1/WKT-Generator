import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { AppComponent } from '@app/app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule, LeafletModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
