import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IdInputComponent } from './components/input/input.component';

@NgModule({
  imports: [CommonModule],
  exports: [IdInputComponent],
  declarations: [IdInputComponent]
})
export class NgxCzIdModule {}
