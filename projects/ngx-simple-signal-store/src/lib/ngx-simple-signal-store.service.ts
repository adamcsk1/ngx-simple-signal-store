import { signal } from '@angular/core';
import { ReadonlyState, State, StateCallback, StateData } from './ngx-simple-signal-store.interface';

export class NgxSimpleSignalStoreService<T> {
  readonly #initialState: T;
  readonly #state: State<T>;
  readonly state: ReadonlyState<T>;

  constructor(initialState: T) {
    this.#initialState = initialState;
    this.#state = this.#createState();
    this.state = this.#createReadonlyState();
  }

  public patchState<K extends keyof T>(key: K, callback: StateCallback<T, K>): void;
  public patchState<K extends keyof T>(key: K, data: StateData<T, K>): void;
  public patchState<K extends keyof T>(key: K, arg: StateCallback<T, K> | StateData<T, K>): void {
    const selectedState = this.#state[key];
    if (arg instanceof Function) selectedState.update((state) => arg(structuredClone(state)));
    else
      selectedState.update((state) => {
        if (state instanceof Array) return [...state, ...(arg as typeof state)] as T[K];
        else if (state !== null && typeof state === 'object') return { ...state, ...arg };
        else return arg as T[K];
      });
  }

  public setState<K extends keyof T>(key: K, data: T[K]): void {
    const selectedState = this.#state[key];
    selectedState.set(data);
  }

  public resetStore(): void {
    for (const key in this.#initialState) this.#state[key].set(this.#initialState[key]);
  }

  #createState(): State<T> {
    const state: Partial<State<T>> = {};
    for (const key in this.#initialState) state[key] = signal(this.#initialState[key]);

    return state as State<T>;
  }

  #createReadonlyState(): ReadonlyState<T> {
    const readonlyState: Partial<ReadonlyState<T>> = {};
    for (const key in this.#state) readonlyState[key] = this.#state[key].asReadonly();

    return readonlyState as ReadonlyState<T>;
  }
}
