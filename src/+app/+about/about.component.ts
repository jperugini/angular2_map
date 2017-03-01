import { Component, Inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated,
  selector: 'about',
  templateUrl: './about.component.html'
})
export class AboutComponent {
  constructor(@Inject('req') req: any) {
    // console.log('req',  req)

  }
}
