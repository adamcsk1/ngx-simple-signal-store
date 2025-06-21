# NgxSimpleSignalStore

A simple way to create signal stores with a read-only interface.

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

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [Create global store](#create-global-store)
  - [Create component store](#create-component-store)
- [API](#api)

## Installation

```bash
npm install ngx-simple-signal-store
# Or if you use yarn
yarn add ngx-simple-signal-store
```
## Usage

### Create global store

Add the store provider with an initial state and a unique token to your app.config.ts as a provider:
```ts
import { createInjectionToken, provideStore } from 'ngx-simple-signal-store';

export interface DemoState {
  theAnswerToLife: number;
}

export const initialDemoState: DemoState = {
  theAnswerToLife: 42
};

export const demoStateToken = createInjectionToken<DemoState>();

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(initialDemoState, demoStateToken),
  ],
};
```

Then, import and inject it into your components:
```ts
import { demoStateToken } from './app.config.ts';

@Component({})
export class DemoComponent {
  readonly #demoStore = inject(demoStateToken);
}
```

### Create component store

Add the store provider with an initial state and a unique token to your component as a provider:
```ts
import { createInjectionToken, provideStore } from 'ngx-simple-signal-store';

export interface DemoComponentState {
  theAnswerToEverything: number;
}

export const initialDemoComponentState: DemoComponentState = {
  theAnswerToEverything: 42
};

export const demoComponentStateToken = createInjectionToken<DemoComponentState>();

@Component({
  providers: [provideStore(initialDemoComponentState, demoComponentStateToken)]
})
export class DemoComponent {
  readonly #demoComponentStore = inject(demoComponentStateToken);
}
```

### API

**T** is the type of the state.

## state: `{ [K in keyof T]: Signal<T[K]> }`;

```typescript
const cookieExists: boolean = demoStore.state;
```

Return with the readonly state. The returned object keys are the referenced state keys, and the values are  the read-only signals.

## setState<K extends keyof T>(key: K, data: T[K]): `void`;

```typescript
demoStore.setState('key', 0);
```

Sets the state with a specified key and value.

## patchState<K extends keyof T>(key: K, data: T[K] | Partial<T[K]>): `void`;

```typescript
// primitive:
demoStore.patchState('key', 0);
// The value before patch: 1
// The value after patch:  0

// array:
demoStore.patchState('key', [3]);
// The value before patch: [1, 2]
// The value after patch:  [1, 2, 3]

// object:
demoStore.patchState('key', {value: 0});
// The value before patch: {value: 1}
// The value after patch:  {value: 0}
```

Patch the state with a specified key and value.

A callback function can be used for the complex operations:

```typescript
demoStore.patchState('key', state => ({value: state.value + 1}));
```
## resetStore(): `void`;

```typescript
demoStore.resetStore();
```

Reset the store to the initial state.
