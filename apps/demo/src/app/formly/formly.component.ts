import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'ngx-cz-id-formly',
  templateUrl: './formly.component.html',
  styleUrls: ['./formly.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormlyComponent extends FieldType implements OnInit {
  attributes = {};
  blur = false;

  constructor(private readonly cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.attributes = {
      id: this.id,
      ...this.to.attributes,
    };
    
    this.formControl.valueChanges.subscribe(() => {
    });
  }
}
