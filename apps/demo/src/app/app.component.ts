import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { CzIdOptions } from '@stumpam/ngx-cz-id';

@Component({
  selector: 'ngx-cz-id-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'Ngx-CZ-id';

  ctrl = new UntypedFormControl('');
  ctrl2 = new UntypedFormControl('');
  ctrl3 = new UntypedFormControl('');
  ctrl4 = new UntypedFormControl('');

  options: CzIdOptions = { emitAll: true, replaceSlashOnCopy: false };

  exception = /^\d{6}9{4}$/;

  form = new UntypedFormGroup({});
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
          emitInvalid: false,
        },
      },
    },
  ];

  ngOnInit() {
    this.ctrl.valueChanges.subscribe(val =>
      console.log('appCmp:', val, this.ctrl.errors),
    );
    this.ctrl2.valueChanges.subscribe(val =>
      console.log('appCmp2:', val, this.ctrl2.errors),
    );
    this.ctrl3.valueChanges.subscribe(val =>
      console.log('appCmp3:', val, this.ctrl3.errors),
    );
    this.ctrl4.valueChanges.subscribe(val =>
      console.log('appCmp4:', val, this.ctrl4.errors),
    );
    this.form.valueChanges.subscribe(val =>
      console.log('formly:', val, this.form.errors),
    );
  }
}
