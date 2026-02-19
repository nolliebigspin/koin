import { useMMKVString } from 'react-native-mmkv';
import { storage, StorageKeys } from '@/lib/storage';

export function useTravelCurrency() {
  const [travelCurrency, setTravelCurrency] = useMMKVString(
    StorageKeys.TRAVEL_CURRENCY,
    storage,
  );

  return { travelCurrency, setTravelCurrency };
}
