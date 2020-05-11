import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
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

import { padStart } from '../../functions/format.functions';
import { CzIdOptions } from '../../interfaces/cz-id.interface';

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

const nextYear = new Date().getFullYear() - 1999;

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
  @Input() min: number | undefined;
  @Input() max: number | undefined;
  @Input() options: CzIdOptions;

  @Output() blurred = new EventEmitter();

  touchedFn: any = null;
  changeFn: any = null;
  disabled = false;
  emitted = null;

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

      if (this.emitted !== null) {
        this.emitted = null;
        this.changeFn?.(null);
      }

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

    if (string.length === (+year < 54 && +year > nextYear ? 10 : 11)) {
      if (this.emitted !== value) {
        this.emitted = value;
        const str = string.replace('/', '');

        this.changeFn?.(
          !this.options?.emitInvalid
            ? this.checkId(year, month, day, num)
              ? str
              : null
            : str,
        );
      }
    } else if (this.emitted) {
      this.emitted = null;
      this.changeFn?.(null);
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
      num: str?.slice(6, +year < 54 && +year > nextYear ? 9 : 10),
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

    const dateYear = this.convertYear(y);
    const dateMonth = this.convertMonth(m);

    if (Number.isNaN(Date.parse(`${dateYear}-${dateMonth}-${day}`))) {
      return false;
    }

    return y < 54 && y > nextYear ? true : !((y + m + d + n) % 11);
  }

  convertYear(y: number): string {
    return y > new Date().getFullYear() - 2000
      ? '19' + padStart(y, 2)
      : '20' + padStart(y, 2);
  }

  convertMonth(m: number): string {
    let month = `${m > 12 ? m - 50 : m}`;
    if (m < 10) {
      month = `0${m}`;
    }
    return month;
  }

  minValidate(year: string, month: string, day: string): boolean {
    if (!this.min) return true;

    return this.getAge(year, month, day) >= this.min;
  }

  maxValidate(year: string, month: string, day: string): boolean {
    if (!this.max) return true;

    return this.getAge(year, month, day) <= this.max;
  }

  getAge(year: string, month: string, day: string): number {
    const dateYear = this.convertYear(+year);
    const dateMonth = this.convertMonth(+month);

    const today = new Date();
    const date = new Date(`${dateYear}-${dateMonth}-${day}`);

    const age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();

    return m < 0 || (m === 0 && today.getDate() < date.getDate())
      ? age - 1
      : age;
  }

  validate({ value }: FormControl) {
    const { year, month, day, num } = this.splitIdString(value);
    const isNotValid = !(this.emitted && this.checkId(year, month, day, num));
    const isNotMinValid = !(this.emitted && this.minValidate(year, month, day));
    const isNotMaxValid = !(this.emitted && this.maxValidate(year, month, day));

    return {
      ...(isNotValid && {
        invalidCzId: true,
      }),
      ...(isNotMinValid && {
        invalidMinCzId: true,
      }),
      ...(isNotMaxValid && {
        invalidMaxCzId: true,
      }),
    };
  }
}
