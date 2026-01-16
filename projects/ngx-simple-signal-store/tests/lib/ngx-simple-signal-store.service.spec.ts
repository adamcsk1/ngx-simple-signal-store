import { TestBed } from '@angular/core/testing';

import { Injector, Signal, effect, runInInjectionContext } from '@angular/core';
import { createInjectionToken, NgxSimpleSignalStoreService, provideStore } from '../../src/public-api';
import { MockState } from './mocks/mock-state.interface';
import { MockStateOther } from './mocks/mock-state-other.interface';
import { mockInitialData } from './mocks/mock-state.mock';
import { mockInitialOtherData } from './mocks/mock-state-other.mock';
import { describe, beforeEach, it, expect, vi } from 'vitest';

describe('NgxSimpleSignalStoreService', () => {
  let store: NgxSimpleSignalStoreService<MockState>;
  let otherStore: NgxSimpleSignalStoreService<MockStateOther>;
  let injector: Injector;
  let equalSpy: ReturnType<typeof vi.fn>;
  const stateToken = createInjectionToken<MockState>('MockState');
  const otherStateToken = createInjectionToken<MockStateOther>('MockStateOther');
  const customToken = createInjectionToken<MockState>('CustomEqualState');
  const createTestEffect = (callback: () => void) => runInInjectionContext(injector, () => effect(callback));
  const skipOne = <T>(signal: Signal<T>, callback: (value: T) => void) => {
    let first = true;
    return () => {
      const value = signal();
      if (!first) return callback(value);
      else first = false;
    };
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(mockInitialData, stateToken),
        provideStore(mockInitialOtherData, otherStateToken),
        provideStore(mockInitialData, customToken, {
          equal: (...args) => equalSpy(...args),
        }),
      ],
    });
    store = TestBed.inject(stateToken);
    otherStore = TestBed.inject(otherStateToken);
    equalSpy = vi.fn(() => true);
    injector = TestBed.inject(Injector);
  });

  it('should be created', () => expect(store).toBeTruthy());

  it('should initial data available from the state', () =>
    expect({
      numberValue: store.state.numberValue(),
      stingValue: store.state.stingValue(),
      booleanValue: store.state.booleanValue(),
      arrayValue: store.state.arrayValue(),
      objectValue: store.state.objectValue(),
    }).toEqual(mockInitialData));

  describe('setState', () => {
    it('should set number value', () => {
      store.setState('numberValue', 0);
      expect(store.state.numberValue()).toEqual(0);
    });

    it('should set string value', () => {
      store.setState('stingValue', '0');
      expect(store.state.stingValue()).toEqual('0');
    });

    it('should set array value', () => {
      const newValue = [{ test: 'zero' }];
      store.setState('arrayValue', newValue);
      expect(store.state.arrayValue()).toEqual(newValue);
    });

    it('should set object value', () => {
      const newValue = structuredClone(mockInitialData.objectValue);
      newValue.test = 'zero';
      newValue.arrayChild[0].test = 'zero-2';
      newValue.objectChild.test = 'zero-3';
      store.setState('objectValue', newValue);
      expect(store.state.objectValue()).toEqual(newValue);
    });

    it('should effect works', () => {
      return new Promise<void>((resolve) => {
        createTestEffect(
          skipOne(store.state.numberValue, (value: number) => {
            expect(value).toEqual(-11);
            resolve();
          }),
        );
        TestBed.tick();
        store.setState('numberValue', -11);
      });
    });
  });

  describe('patchState', () => {
    it('should patch number value', () => {
      store.patchState('numberValue', 0);
      expect(store.state.numberValue()).toEqual(0);
    });

    it('should patch string value', () => {
      store.patchState('stingValue', '0');
      expect(store.state.stingValue()).toEqual('0');
    });

    it('should patch array value', () => {
      const newValue = [{ test: 'zero2' }];
      store.patchState('arrayValue', newValue);
      expect(store.state.arrayValue()).toEqual(expect.arrayContaining(newValue));
    });

    it('should patch object test value', () => {
      const newValue = { test: 'zero' };
      store.patchState('objectValue', newValue);
      expect(store.state.objectValue().test).toEqual(newValue.test);
    });

    it('should patch object objectChild value', () => {
      const newValue = {
        objectChild: {
          test: 'zero',
        },
      };
      store.patchState('objectValue', newValue);
      expect(store.state.objectValue().objectChild).toEqual(newValue.objectChild);
    });

    it('should patch object arrayChild value', () => {
      const newValue = {
        arrayChild: [
          {
            test: 'zero',
          },
        ],
      };
      store.patchState('objectValue', newValue);
      expect(store.state.objectValue().arrayChild).toEqual(newValue.arrayChild);
    });

    it('should patch state by the callback function', () => {
      const newValue = { test: 'double zero' };
      store.patchState('objectValue', (state) => ({ ...state, ...newValue }));
      expect(store.state.objectValue()).toEqual(expect.objectContaining(newValue));
    });

    it('should patch state ignore known the objects when the patch comes from a callback function', () => {
      const callbackSpy = vi.fn();
      createTestEffect(() => {
        store.state.objectValue();
        callbackSpy();
      });

      const newValue = { test: 'triple zero' };
      store.patchState('objectValue', (state) => ({ ...state, ...newValue }));
      TestBed.tick();
      store.patchState('objectValue', (state) => ({ ...state, ...newValue }));
      TestBed.tick();
      expect(callbackSpy).toHaveBeenCalledTimes(1);
    });

    it('should effect works', () => {
      const newValue = { test: 'double zero' };
      return new Promise<void>((resolve) => {
        createTestEffect(
          skipOne(store.state.objectValue, (value: typeof newValue) => {
            expect(value).toEqual(expect.objectContaining(newValue));
            resolve();
          }),
        );
        TestBed.tick();
        store.patchState('objectValue', (state) => ({ ...state, ...newValue }));
      });
    });

    it('should state change does not trigger other signal effects', () => {
      const newValue = { test: 'double zero' };
      const objectSpy = vi.fn();
      const arraySpy = vi.fn();
      createTestEffect(skipOne(store.state.objectValue, objectSpy));
      createTestEffect(skipOne(store.state.arrayValue, arraySpy));
      TestBed.tick();
      store.patchState('objectValue', (state) => ({ ...state, ...newValue }));
      TestBed.tick();
      expect(objectSpy).toHaveBeenCalledTimes(1);
      expect(arraySpy).not.toHaveBeenCalled();
    });

    it('should throw when key is invalid', () => {
      expect(() => store.setState('missing' as keyof MockState, 1 as never)).toThrowError();
      expect(() => store.patchState('missing' as keyof MockState, 1 as never)).toThrowError();
    });
  });

  describe('with more store', () => {
    it('should be created', () => expect(otherStore).toBeTruthy());

    it('should other instance works too', () => {
      store.setState('stingValue', '0');
      expect(store.state.stingValue()).toEqual('0');
      expect(otherStore.state.stingValue()).toEqual('sad-panda');
      otherStore.setState('stingValue', 'happy-panda');
      expect(store.state.stingValue()).toEqual('0');
      expect(otherStore.state.stingValue()).toEqual('happy-panda');
    });
  });

  describe('resetStore', () => {
    it('should reset store to the initial state', () => {
      store.setState('numberValue', 0);
      store.setState('stingValue', '0');
      store.patchState('arrayValue', [{ test: 'zero2' }]);
      store.patchState('objectValue', { test: 'zero' });
      store.resetStore();
      expect({
        numberValue: store.state.numberValue(),
        stingValue: store.state.stingValue(),
        booleanValue: store.state.booleanValue(),
        arrayValue: store.state.arrayValue(),
        objectValue: store.state.objectValue(),
      }).toEqual(mockInitialData);
    });
  });

  describe('getValue and select', () => {
    it('should getValue return latest value synchronously', () => {
      store.setState('numberValue', 99);
      expect(store.getValue('numberValue')).toBe(99);
    });

    it('select should emit derived signal and respect custom comparer', () => {
      const derivedEqual = vi.fn(() => true);
      const doubled = store.select((s) => s.numberValue() * 2, derivedEqual);
      const derivedSpy = vi.fn();
      createTestEffect(skipOne(doubled, derivedSpy));
      TestBed.tick();
      store.setState('numberValue', 100);
      TestBed.tick();
      expect(derivedEqual).toHaveBeenCalled();
      expect(derivedSpy).not.toHaveBeenCalled();
    });
  });

  describe('store options equality', () => {
    it('should use custom equality comparer to suppress emissions', () => {
      const customStore = TestBed.inject(customToken);
      const spy = vi.fn();
      createTestEffect(skipOne(customStore.state.numberValue, spy));
      TestBed.tick();
      customStore.setState('numberValue', 123);
      TestBed.tick();
      expect(equalSpy).toHaveBeenCalled();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
