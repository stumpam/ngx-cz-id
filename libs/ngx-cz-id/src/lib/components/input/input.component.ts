import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

const ID_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => IdInputComponent),
  multi: true,
};

const ID_VALUE_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => IdInputComponent),
  multi: true,
};

@Component({
  selector: 'ngx-cz-id',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  // tslint:disable-next-line: no-host-metadata-property
  host: {
    '(click)': 'onClick()',
    '(input)': 'onInput($event.target.value)',
    '[class.ngx-date-input]': 'true',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ID_VALUE_ACCESSOR, ID_VALUE_VALIDATOR],
})
export class IdInputComponent implements OnInit, ControlValueAccessor {
  @ViewChild('field', { static: true }) field: ElementRef<HTMLInputElement>;
  @Input() attributes = {};

  touchedFn: any = null;
  changeFn: any = null;
  disabled = false;
  emitted = false;

  prevValue = '';

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    Object.entries(this.attributes).forEach(([attr, value]) => {
      this.renderer.setAttribute(
        this.field.nativeElement,
        attr,
        value.toString(),
      );
    });
  }

  writeValue(val: string | null): void {
    this.onInput(val);
  }

  registerOnChange(fn: any): void {
    this.changeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.touchedFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cd.markForCheck();
  }

  onClick() {
    this.touchedFn?.();
  }

  onInput(value: string) {
    const id = value?.match(/\d+/g);

    if (!id) {
      this.updateView('');
      this.emitted = false;

      return;
    }

    const arr = id.join('');

    const { year, month, day, num } = this.splitIdString(arr);

    const string = year + month + day + (day.length === 2 ? '/' : '') + num;

    this.updateView(
      year +
        month +
        day +
        ((day.length === 2 && this.prevValue.length <= value.length) ||
        (this.prevValue.length > value.length && value.length > 6)
          ? '/'
          : '') +
        num,
    );

    if (string.length === (+year < 54 ? 10 : 11)) {
      if (this.prevValue !== string) {
        this.emitted = true;
        this.changeFn(string.replace('/', ''));
      }
    } else if (this.emitted === true) {
      this.emitted = false;
      this.changeFn(null);
    }
    this.prevValue = string;
  }

  updateView(string: string) {
    this.renderer.setProperty(this.field.nativeElement, 'value', string);
  }

  splitIdString(str: string) {
    const year = str?.slice(0, 2);
    return {
      year,
      month: str?.slice(2, 4),
      day: str?.slice(4, 6),
      num: str?.slice(6, +year < 54 ? 9 : 10),
    };
  }

  checkId(year: string, month: string, day: string, num: string): boolean {
    const y = +year;
    const m = +month;
    const d = +day;
    const n = +num;

    if (
      !(y >= 0 && y <= 99) ||
      !((m >= 1 && m <= 12) || (m >= 51 && m <= 62)) ||
      !(d >= 1 && d <= 31) ||
      !(n >= 0 && n <= 9999)
    ) {
      return false;
    }

    const dateYear = y > new Date().getFullYear() - 2000 ? '19' + y : '20' + y;
    const dateMonth = m > 12 ? m - 50 : m;

    if (Number.isNaN(Date.parse(`${dateYear}-${dateMonth}-${day}`))) {
      return false;
    }

    return y < 54 ? true : !((y + m + d + n) % 11);
  }

  validate({ value }: FormControl) {
    const { year, month, day, num } = this.splitIdString(value);
    const isNotValid = !(this.emitted && this.checkId(year, month, day, num));

    return (
      isNotValid && {
        invalidCzId: true,
      }
    );
  }
}
