import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  forwardRef,
  Input,
  Renderer2,
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
  useExisting: forwardRef(() => IdInputDirective),
  multi: true,
};

const ID_VALUE_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => IdInputDirective),
  multi: true,
};

const nextYear = new Date().getFullYear() - 1999;

@Directive({
  selector: '[ngxCzId]',
  // tslint:disable-next-line: no-host-metadata-property
  host: {
    '(click)': 'onClick()',
    '(input)': 'onInput($event.target.value)',
    '[class.ngx-date-input]': 'true',
  },
  providers: [ID_VALUE_ACCESSOR, ID_VALUE_VALIDATOR],
})
export class IdInputDirective implements ControlValueAccessor {
  @Input() min: number | undefined;
  @Input() max: number | undefined;
  @Input() options: CzIdOptions;
  @Input() required: boolean;

  touchedFn: any = null;
  changeFn: any = null;
  disabled = false;
  emitted = null;

  prevValue = '';

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly renderer: Renderer2,
    private readonly el: ElementRef<HTMLInputElement>,
  ) {}

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

    if (this.options?.emitAll) {
      const allValue = string.replace('/', '');
      this.emitted = allValue;
      this.changeFn?.(allValue);
      this.prevValue = string;

      return;
    }

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
    this.renderer.setProperty(this.el.nativeElement, 'value', string);
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
      !(
        (m >= 1 && m <= 12) ||
        (m >= 21 && m <= 32) ||
        (m >= 51 && m <= 62) ||
        (m >= 71 && m <= 82)
      ) ||
      !(d >= 1 && d <= 31) ||
      !(n >= 0 && n <= 9999)
    ) {
      return false;
    }

    const dateYear = this.convertYear(y);
    const dateMonth = this.convertMonth(m);

    if (Number.isNaN(Date.parse(`${dateYear}-${dateMonth}-${padStart(day)}`))) {
      return false;
    }

    return y < 54 && y > nextYear ? true : this.checkSum(year, month, day, num);
  }

  checkSum(year: string, month: string, day: string, num: string): boolean {
    const mod = +`${year}${month}${day}${num.slice(0, 3)}` % 11;
    const lastNum = parseInt(num.slice(3), 10);

    return mod === 10 ? lastNum === 0 : lastNum === mod;
  }

  convertYear(y: number): string {
    return y > new Date().getFullYear() - 2000
      ? '19' + padStart(y)
      : '20' + padStart(y);
  }

  convertMonth(m: number): string {
    let month = m;
    switch (true) {
      case m >= 1 && m <= 12:
        month = m;
        break;
      case m >= 21 && m <= 32:
        month = m - 20;
        break;
      case m >= 51 && m <= 62:
        month = m - 50;
        break;
      case m >= 71 && m <= 82:
        month = m - 70;
    }
    return padStart(month);
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
    if (!value && !this.required) return null;

    const { year, month, day, num } = this.splitIdString(value);

    const isNotValid = !(
      (this.options?.emitAll || this.emitted) &&
      this.checkId(year, month, day, num)
    );
    const isNotMinValid = !(
      (this.options?.emitAll || this.emitted) &&
      this.minValidate(year, month, day)
    );
    const isNotMaxValid = !(
      (this.options?.emitAll || this.emitted) &&
      this.maxValidate(year, month, day)
    );

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
