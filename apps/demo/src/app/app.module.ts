import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FormlyModule } from '@ngx-formly/core';
import { NgxCzIdDirective } from '@stumpam/ngx-cz-id';

import { AppComponent } from './app.component';
import { FormlyComponent } from './formly/formly.component';

@NgModule({
  declarations: [AppComponent, FormlyComponent],
  imports: [
    BrowserModule,
    NgxCzIdDirective,
    ReactiveFormsModule,
    FormlyModule.forRoot({
      types: [{ name: 'cz-id', component: FormlyComponent }],
      validationMessages: [
        { name: 'required', message: 'Required' },
        { name: 'invalidCzId', message: 'invalidCzId' },
        { name: 'invalidMinCzId', message: 'invalidMinCzId' },
      ],
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
