# Ngx Simple Signal Store

Tiny helper for wiring Angular Signal-based stores with a read-only interface and a minimal API.

## Highlights
- Read-only Signal access for every state slice; mutations stay inside the store.
- Type-safe tokens and providers for both app-wide and component-scoped stores.
- `setState`, `patchState`, and `resetStore` with merge semantics for primitives, objects, and arrays.
- Structural equality via configurable comparer (defaults to `dequal`) to avoid unnecessary Signal emissions.
- Zero extra dependencies beyond Angular; ships as a small utility.

## Installation

```bash
npm install ngx-simple-signal-store
```

## Quick start (global store)

Create (or let default) a token, provide the store, then inject and use it:

```ts
// app.config.ts
import { ApplicationConfig, inject } from '@angular/core';
import { createInjectionToken, provideStore } from 'ngx-simple-signal-store';

export interface DemoState {
  theAnswerToLife: number;
}

const initialDemoState: DemoState = {
  theAnswerToLife: 42,
};

// Pass a name (useful in dev tools) or omit to use the default label
export const demoStateToken = createInjectionToken<DemoState>('demoState');

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(initialDemoState, demoStateToken, {
      // Optional: override equality comparer for all signals in this store
      equal: (a, b) => a === b,
    }),
  ],
};
```

```ts
// demo.component.ts
import { Component, inject } from '@angular/core';
import { demoStateToken } from './app.config';

@Component({
  selector: 'app-demo',
  template: `The answer is {{ demoState.state.theAnswerToLife() }}`,
})
export class DemoComponent {
  readonly demoState = inject(demoStateToken);

  bump(): void {
    this.demoState.patchState('theAnswerToLife', (value) => value + 1);
  }

  // Derived read-only signal
  readonly doubled = this.demoState.select((s) => s.theAnswerToLife() * 2);

  // Synchronous read (non-reactive)
  logNow(): void {
    console.log(this.demoState.getValue('theAnswerToLife'));
  }
}
```

## Component-scoped store

Provide a store only for a component subtree:

```ts
import { Component, inject } from '@angular/core';
import { createInjectionToken, provideStore } from 'ngx-simple-signal-store';

interface CounterState {
  count: number;
}

const initialCounterState: CounterState = { count: 0 };
const counterStateToken = createInjectionToken<CounterState>('counterState');

@Component({
  selector: 'app-counter',
  template: `Count: {{ counterStore.state.count() }}`,
  providers: [provideStore(initialCounterState, counterStateToken)],
})
export class CounterComponent {
  readonly counterStore = inject(counterStateToken);

  increment(): void {
    this.counterStore.patchState('count', (current) => current + 1);
  }
}
```

## API

**Store shape**
- `state: { [K in keyof T]: Signal<T[K]> }` — read-only Signals for each state key; read with `store.state.key()`.

**getValue<K extends keyof T>(key): T[K]**
- Synchronously read the current value of one state key.

**setState<K extends keyof T>(key, value): void**
- Replace a single state key with an exact value.
- Example: `store.setState('count', 10);`

**patchState<K extends keyof T>(key, value | partial | callback): void**
- Primitives: overwrite (`store.patchState('flag', true);`).
- Arrays: append (`store.patchState('items', ['new']);`).
- Objects: shallow merge (`store.patchState('user', { name: 'Neo' });`).
- Callback: receives a cloned snapshot and returns the next value (`store.patchState('count', (c) => c + 1);`).

**resetStore(): void**
- Restore the initial state for every key.

**select(project, equal?): Signal<U>**
- Create a derived Signal from the read-only state; optionally pass a comparer (defaults to `dequal`).

**Utilities**
- `createInjectionToken<T>(name?: string)` — creates a typed token; name defaults to `NgxSimpleSignalStore`.
- `provideStore<T>(initialState: T, token: InjectionToken<NgxSimpleSignalStoreService<T>>, options?: { equal?: (a, b) => boolean })` — provider factory with optional equality comparer for Signal emissions.

**Notes on equality**
- The default comparer is `dequal`. Override per store via `options.equal` or per derived signal via the `select` second argument.

## Compatibility with Angular Versions

<table>
  <thead>
    <tr>
      <th>ngx-simple-signal-store</th>
      <th>Angular</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        -
      </td>
      <td>
        Newer versions follow Angular’s versioning format.
      </td>
    </tr>
    <tr>
      <td>
        3.x
      </td>
      <td>
        >= 20
      </td>
    </tr>
    <tr>
      <td>
        2.x
      </td>
      <td>
        19.x.x
      </td>
    </tr>
    <tr>
      <td>
        1.x
      </td>
      <td>
        18.x.x
      </td>
    </tr>
  </tbody>
</table>
