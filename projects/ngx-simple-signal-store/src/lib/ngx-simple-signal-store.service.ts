import { Signal, computed, signal } from '@angular/core';
import { ReadonlyState, State, StateCallback, StateData, StoreOptions } from './ngx-simple-signal-store.interface';
import { dequal } from 'dequal';

export class NgxSimpleSignalStoreService<T> {
  readonly #initialState: T;
  readonly #state: State<T>;
  readonly state: ReadonlyState<T>;
  readonly #options: StoreOptions<T>;

  constructor(initialState: T, options?: StoreOptions<T>) {
    this.#initialState = initialState;
    this.#options = options ?? {};
    this.#state = this.#createState();
    this.state = this.#createReadonlyState();
  }

  public patchState<K extends keyof T>(key: K, callback: StateCallback<T, K>): void;
  public patchState<K extends keyof T>(key: K, data: StateData<T, K>): void;
  public patchState<K extends keyof T>(key: K, arg: StateCallback<T, K> | StateData<T, K>): void {
    const selectedState = this.#selectState(key);
    if (typeof arg === 'function') {
      selectedState.update((state) => (arg as StateCallback<T, K>)(this.#cloneValue(state)));
      return;
    }

    selectedState.update((state) => {
      if (Array.isArray(state)) return [...state, ...(arg as typeof state)] as T[K];
      if (state !== null && typeof state === 'object') return { ...state, ...(arg as object) } as T[K];
      return arg as T[K];
    });
  }

  public setState<K extends keyof T>(key: K, data: T[K]): void {
    const selectedState = this.#selectState(key);
    selectedState.set(data);
  }

  public getValue<K extends keyof T>(key: K): T[K] {
    const selectedState = this.#selectState(key);
    return selectedState();
  }

  public select<U>(project: (state: ReadonlyState<T>) => U, equal: (a: U, b: U) => boolean = dequal): Signal<U> {
    return computed(() => project(this.state), { equal });
  }

  public resetStore(): void {
    for (const key in this.#initialState) this.#state[key].set(this.#initialState[key]);
  }

  #createState(): State<T> {
    const state: Partial<State<T>> = {};
    const equal = this.#options.equal ?? dequal;
    for (const key in this.#initialState) state[key] = signal(this.#initialState[key], { equal });

    return state as State<T>;
  }

  #createReadonlyState(): ReadonlyState<T> {
    const readonlyState: Partial<ReadonlyState<T>> = {};
    for (const key in this.#state) readonlyState[key] = this.#state[key].asReadonly();

    return readonlyState as ReadonlyState<T>;
  }

  #selectState<K extends keyof T>(key: K): State<T>[K] {
    if (!(key in this.#state)) throw new Error(`State key "${String(key)}" is not defined in the store.`);
    return this.#state[key];
  }

  #cloneValue<V>(value: V): V {
    if (Array.isArray(value)) return [...value] as V;
    if (value !== null && typeof value === 'object') return { ...(value as object) } as V;
    return value;
  }
}
