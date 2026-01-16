import { InjectionToken } from '@angular/core';
import { NgxSimpleSignalStoreService } from './ngx-simple-signal-store.service';
import { StoreOptions } from './ngx-simple-signal-store.interface';

export const createInjectionToken = <T>(storeName = 'NgxSimpleSignalStore') => new InjectionToken<NgxSimpleSignalStoreService<T>>(storeName);

export const provideStore = <T>(initialState: T, token: InjectionToken<NgxSimpleSignalStoreService<T>>, options?: StoreOptions<T>) => ({
  provide: token,
  useFactory: (): NgxSimpleSignalStoreService<T> => new NgxSimpleSignalStoreService<T>(initialState, options),
});
