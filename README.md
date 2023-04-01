# Angular Template Expressions Extractor

This module can be used to parse Angular templates and extract Javascript-compatible expressions from them,
which can then be used for static analysis like [extracting intl messages in formatjs](https://formatjs.io/docs/getting-started/message-extraction/).

See [test/expressions.test.ts](test/expressions.test.ts) for examples.

| Input      | Output       |
|------------|--------------|
| `{{ a + b }}`  | `a + b`  |
| `<div [thing]="a + b" />`  | `a + b`  |
| `<div *thing="1 \| async" />`  | `async(1)` |
| `<div *thing="a; else b" />`  | `a,"else",b` |
| `<div [thing]="a?.b?.c" />`  | `a?.b?.c` |
| `<div (thing)="action(1, 2)" />`  | `action(1, 2)` |
| `<option *ngFor="let country of countries \| keyvalue">` | `"let","of",keyvalue(countries)` |
