import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'travel-rate-storage',
});

export const StorageKeys = {
  HOME_CURRENCY: 'home-currency',
  TRAVEL_CURRENCY: 'travel-currency',
  CACHED_RATES: 'cached-rates',
  DECIMAL_SEPARATOR: 'decimal-separator',
} as const;
