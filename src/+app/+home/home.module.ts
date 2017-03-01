import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { HttpModule, JsonpModule } from '@angular/http';
import { AgmCoreModule } from 'angular2-google-maps/core';

@NgModule({
  imports: [
    SharedModule,
    HomeRoutingModule,
    HttpModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAUwAHbIiy2wWRvKHjz2MAFuPP6C3tVPWw'
    })
  ],
  declarations: [
    HomeComponent
  ]
})
export class HomeModule { }
