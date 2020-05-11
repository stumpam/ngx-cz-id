# NgxCzId

Angular input for czech id (Rodné číslo) with validation.

## Quick Start

1. Import `NgxCzIdModule` to your project.

```typescript
import { NgxCzIdModule } from '@stumpam/ngx-cz-id';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxCzIdModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

2. Use in HTML template

- add attributes min or max to validate even age of person with current id

```HTML
<input ngxCzId [formControl]="ctrl" [min]="18" [max]="25" [options]="options">
```

3. Optional options to emit only valid cz id value

```typescript
options: {
  emitInvalid: false;
}
```

Automatically emits `invalidCzId` when length of string is valid but number is not valid id.

### Works with [formly](https://formly.dev)

and use it in the template

```HTML
<input ngxCzId [formControl]="formControl" [options]="to.czIdOptions>
```
