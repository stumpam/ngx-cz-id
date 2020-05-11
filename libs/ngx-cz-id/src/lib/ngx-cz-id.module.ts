import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IdInputDirective } from './directives/input/input.directive';

@NgModule({
  imports: [CommonModule],
  exports: [IdInputDirective],
  declarations: [IdInputDirective],
})
export class NgxCzIdModule {}
