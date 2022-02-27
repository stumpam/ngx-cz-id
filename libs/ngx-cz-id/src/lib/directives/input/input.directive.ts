import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  forwardRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { fromEvent, Subscription } from 'rxjs';

import {
  checkId,
  convertMonth,
  convertYear,
  splitIdString,
} from '../../functions/check.functions';
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
  host: {
    '(blur)': 'onBlur()',
    '(input)': 'onInput($event.target.value)',
  },
  providers: [ID_VALUE_ACCESSOR, ID_VALUE_VALIDATOR],
})
export class IdInputDirective
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Input() min: number | undefined;
  @Input() max: number | undefined;
  @Input() options: CzIdOptions;
  /**
   * Validation uses your RegExp and min/max validation for age.
   * Validation for correctness of ID (Rodné číslo) is turned off,
   * when exceptions are set.
   */
  @Input() exception?: RegExp;

  @Input()
  get required(): boolean {
    return this.#required;
  }
  set required(search: BooleanInput) {
    this.#required = coerceBooleanProperty(search);
  }
  #required = false;

  touchedFn: any = null;
  changeFn: any = null;
  disabled = false;
  emitted = null;

  prevValue = '';

  subscriptions = new Subscription();

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly renderer: Renderer2,
    private readonly el: ElementRef<HTMLInputElement>,
    private readonly zone: NgZone,
  ) {}

  ngOnInit(): void {
    if (this.options?.replaceSlashOnCopy !== false) {
      this.zone.runOutsideAngular(() => {
        const sub = fromEvent(this.el.nativeElement, 'copy').subscribe(
          (event: ClipboardEvent) => {
            const text = window.getSelection().toString().replace(/\//g, '');
            event.clipboardData.setData('text/plain', text);
            event.preventDefault();
          },
        );

        this.subscriptions.add(sub);
      });
    }
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

  onBlur() {
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

    const { year, month, day, num } = splitIdString(arr);

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
            ? checkId(year, month, day, num)
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

  minValidate(year: string, month: string, day: string): boolean {
    if (!this.min) return true;

    return this.getAge(year, month, day) >= this.min;
  }

  maxValidate(year: string, month: string, day: string): boolean {
    if (!this.max) return true;

    return this.getAge(year, month, day) <= this.max;
  }

  getAge(year: string, month: string, day: string): number {
    const dateYear = convertYear(+year);
    const dateMonth = convertMonth(+month);

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

    const { year, month, day, num } = splitIdString(value);

    const isNotValid = !(
      (this.options?.emitAll || this.emitted) &&
      checkId(year, month, day, num)
    );
    const isNotMinValid = !(
      (this.options?.emitAll || this.emitted) &&
      this.minValidate(year, month, day)
    );
    const isNotMaxValid = !(
      (this.options?.emitAll || this.emitted) &&
      this.maxValidate(year, month, day)
    );

    const exceptionValidation = this.exception
      ? this.exception.test(value)
      : null;

    return {
      ...(isNotValid &&
        !exceptionValidation && {
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
