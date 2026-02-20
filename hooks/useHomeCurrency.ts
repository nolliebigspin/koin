import { useMMKVString } from "react-native-mmkv";
import { StorageKeys, storage } from "@/lib/storage";

export function useHomeCurrency() {
  const [homeCurrency, setHomeCurrency] = useMMKVString(StorageKeys.HOME_CURRENCY, storage);

  return { homeCurrency, setHomeCurrency };
}
