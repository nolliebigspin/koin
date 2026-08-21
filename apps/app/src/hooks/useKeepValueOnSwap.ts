import { useMMKVString } from "react-native-mmkv";
import { StorageKeys, storage } from "@/src/lib/storage";

export type SwapBehavior = "keep" | "reset";

export function useKeepValueOnSwap() {
  const [value, setValue] = useMMKVString(StorageKeys.SWAP_BEHAVIOR, storage);

  const behavior = (value === "reset" ? "reset" : "keep") as SwapBehavior;

  return {
    behavior,
    keepValue: behavior === "keep",
    setBehavior: (next: SwapBehavior) => setValue(next),
  };
}
