import { Signal, WritableSignal } from '@angular/core';

export type State<T> = {
  [K in keyof T]: WritableSignal<T[K]>;
};

export type ReadonlyState<T> = {
  [K in keyof T]: Signal<T[K]>;
};

export type StateData<T, K extends keyof T> = Partial<T[K]> | T[K];

export type StateCallback<T, K extends keyof T> = (state: T[K]) => T[K];
