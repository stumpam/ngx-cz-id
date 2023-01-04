# NgxCzId

Angular input for czech id (Rodné číslo) with validation.

From version 4 library uses Angular's standalone directives (Angular v15), so for backwards compatibility use version 3.

## Quick Start

1. Import `NgxCzIdDirective` to your project (module) or component.

```typescript
import { NgxCzIdDirective } from '@stumpam/ngx-cz-id';

@Component({
  selector: 'ngx-cz-id-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxCzIdDirective],
})
export class AppComponent {}
```

2. Use in HTML template

- add attributes min or max to validate even age of person with current id

```HTML
<input ngxCzId [formControl]="ctrl" [min]="18" [max]="25" [options]="options" [exception]="exception">
```

Exception accepts regexp which can bypass validation of ID (rodné číslo) in cases where is needed invalid ID (010101/9999). It still validates min/max ages.

3. Optional options to emit only valid cz id value

```typescript
options: {
  emitInvalid?: boolean;
  // emits all typed characters not just valid / invalid complete id
  emitAll?: boolean;
  replaceSlashOnCopy?: boolean;
  // If input is not empty, but value is not correct, on blur event it will fire validation
  nonEmptyError?: boolean;
}
```

Automatically emits `invalidCzId` when length of string is valid but number is not valid id.

### Works with [formly](https://formly.dev)

and use it in the template

```HTML
<input ngxCzId [formControl]="formControl" [options]="to.czIdOptions>
```
