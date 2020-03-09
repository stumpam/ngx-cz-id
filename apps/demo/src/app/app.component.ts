import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'ngx-cz-id-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'Ngx-CZ-id';

  ctrl = new FormControl('');
  ctrl2 = new FormControl('');

  form = new FormGroup({});
  model = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'id',
      type: 'cz-id',
      templateOptions: {
        label: 'Id',
        required: true,
        attributes: {
          inputmode: 'double',
          autocomplete: 'off',
        },
        czIdOptions: {
          emitInvalid: false
        }
      },
    },
  ];

  ngOnInit() {
    this.ctrl.valueChanges.subscribe(val =>
      console.log('appCmp: ', val, this.ctrl.errors),
    );
    this.ctrl2.valueChanges.subscribe(val =>
      console.log('appCmp2: ', val, this.ctrl2.errors),
    );
    this.form.valueChanges.subscribe(val =>
      console.log('formly: ', val, this.form.errors),
    );
  }
}
