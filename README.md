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

```typescript
<ngx-cz-id [formControl]="ctrl" [min]="18" [max]="25"></ngx-cz-id>
```

Automatically emits `invalidCzId` when length of string is valid but number is not valid id.

### Works with [formly](https://formly.dev)

If you want to add attributes directly to input element make custom Formly field and initialize it on `ngOnInit`

```typescript
ngOnInit() {
    this.attributes = {
      id: this.id,
      ...this.to.attributes,
    };
  }
```

and use it in the template

```HTML
<ngx-cz-id [formControl]="formControl"  [attributes]="attributes"></ngx-cz-id>
```

> ⚠ Caution
>
> Attributes are bound just once on ngOnIput hook. Changes are matter of future improvements.
