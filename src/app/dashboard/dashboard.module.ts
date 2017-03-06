import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DashboardComponent } from './dashboard.component';
import { routing } from './dashboard.router';
import { SharedModule } from '../shared/shared.module';
import { AgmCoreModule } from 'angular2-google-maps/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    routing,
    AgmCoreModule
  ],
  declarations: [
    DashboardComponent
  ],
  bootstrap: [
    DashboardComponent
  ]
})
export class DashboardModule {}
