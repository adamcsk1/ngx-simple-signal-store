import { TestBed } from '@angular/core/testing';

import { Injector, Signal, effect, runInInjectionContext } from '@angular/core';
import { createInjectionToken, NgxSimpleSignalStoreService, provideStore } from '../../src/public-api';
import { MockState } from './interfaces/mock-state.interface';
import { MockStateOther } from './interfaces/mock-state-other.interface';
import { initialOtherData } from './constants/mock-state-other.constant';
import { initialData } from './constants/mock-state.constant';

describe('NgxSimpleSignalStoreService', () => {
  let store: NgxSimpleSignalStoreService<MockState>;
  let otherStore: NgxSimpleSignalStoreService<MockStateOther>;
  let injector: Injector;
  const stateToken = createInjectionToken<MockState>('MockState');
  const otherStateToken = createInjectionToken<MockStateOther>('MockStateOther');
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
      providers: [provideStore(initialData, stateToken), provideStore(initialOtherData, otherStateToken)],
    });
    store = TestBed.inject(stateToken);
    otherStore = TestBed.inject(otherStateToken);
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
    }).toEqual(initialData));

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
      const newValue = structuredClone(initialData.objectValue);
      newValue.test = 'zero';
      newValue.arrayChild[0].test = 'zero-2';
      newValue.objectChild.test = 'zero-3';
      store.setState('objectValue', newValue);
      expect(store.state.objectValue()).toEqual(newValue);
    });

    it('should effect works', (done) => {
      createTestEffect(
        skipOne(store.state.numberValue, (value: number) => {
          expect(value).toEqual(-11);
          done();
        }),
      );
      TestBed.flushEffects();
      store.setState('numberValue', -11);
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
      expect(store.state.arrayValue()).toEqual(jasmine.arrayContaining(newValue));
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
      expect(store.state.objectValue()).toEqual(jasmine.objectContaining(newValue));
    });

    it('should effect works', (done) => {
      const newValue = { test: 'double zero' };
      createTestEffect(
        skipOne(store.state.objectValue, (value: typeof newValue) => {
          expect(value).toEqual(jasmine.objectContaining(newValue));
          done();
        }),
      );
      TestBed.flushEffects();
      store.patchState('objectValue', (state) => ({ ...state, ...newValue }));
    });
  });

  describe('with more store', () => {
    it('should be created', () => expect(otherStore).toBeTruthy());

    it('should other instance work too', () => {
      store.setState('stingValue', '0');
      expect(store.state.stingValue()).toEqual('0');
      expect(otherStore.state.stingValue()).toEqual('sad-panda');
      otherStore.setState('stingValue', 'happy-panda');
      expect(store.state.stingValue()).toEqual('0');
      expect(otherStore.state.stingValue()).toEqual('happy-panda');
    });
  });
});
