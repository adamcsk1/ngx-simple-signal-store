import { InjectionToken } from '@angular/core';
import { NgxSimpleSignalStoreService } from './ngx-simple-signal-store.service';

export const createInjectionToken = <T>(storeName: string) => new InjectionToken<NgxSimpleSignalStoreService<T>>(storeName);

export const provideStore = <T>(initialState: T, token: InjectionToken<NgxSimpleSignalStoreService<T>>) => ({
  provide: token,
  useFactory: (): NgxSimpleSignalStoreService<T> => new NgxSimpleSignalStoreService<T>(initialState),
});
