import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { AboutComponent } from './about.component';
import { routing } from './about.router';

@NgModule({
  imports: [
    SharedModule,
    routing
  ],
  declarations: [
    AboutComponent
  ]
})
export class AboutModule { }
