import { useMMKVString } from "react-native-mmkv";
import { StorageKeys, storage } from "@/lib/storage";

export function useTravelCurrency() {
  const [travelCurrency, setTravelCurrency] = useMMKVString(StorageKeys.TRAVEL_CURRENCY, storage);

  return { travelCurrency, setTravelCurrency };
}
