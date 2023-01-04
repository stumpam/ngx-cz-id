import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
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
  useExisting: forwardRef(() => NgxCzIdDirective),
  multi: true,
};

const ID_VALUE_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => NgxCzIdDirective),
  multi: true,
};

const nextYear = new Date().getFullYear() - 1999;

@Directive({
  selector: '[ngxCzId]',
  standalone: true,
  providers: [ID_VALUE_ACCESSOR, ID_VALUE_VALIDATOR],
})
export class NgxCzIdDirective
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Input() min: number | undefined;
  @Input() max: number | undefined;
  @Input() options?: CzIdOptions;
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
  emitted: string | null = null;

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
          (event: Event) => {
            const text = window.getSelection()?.toString().replaceAll('/', '');
            (event as ClipboardEvent).clipboardData?.setData(
              'text/plain',
              text || '',
            );
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

  @HostListener('blur')
  onBlur() {
    this.touchedFn?.();

    if (!this.emitted) {
      this.changeFn?.(null);
    }
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string | null) {
    const id = value?.match(/\d+/g);

    // `!value` check is necessary just for typescript
    if (!id || !value) {
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
          this.options?.emitInvalid
            ? str
            : checkId(year, month, day, num)
            ? str
            : null,
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

  validate({ value }: FormControl<string>) {
    if (!value) {
      if (this.options?.nonEmptyError && this.el.nativeElement.value !== '') {
        return { invalidCzId: true };
      }

      if (!this.required) {
        return null;
      }
    }

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
