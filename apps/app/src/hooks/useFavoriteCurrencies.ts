import { useMMKVObject } from "react-native-mmkv";
import { StorageKeys, storage } from "@/src/lib/storage";

export function useFavoriteCurrencies() {
  const [favorites, setFavorites] = useMMKVObject<string[]>(
    StorageKeys.FAVORITE_CURRENCIES,
    storage
  );

  return { favorites: favorites ?? [], setFavorites };
}
