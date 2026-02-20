import { useMMKVString } from "react-native-mmkv";
import { StorageKeys, storage } from "@/lib/storage";

export type DecimalSeparator = "," | ".";

export function useDecimalSeparator() {
  const [value, setValue] = useMMKVString(StorageKeys.DECIMAL_SEPARATOR, storage);

  const decimal = (value === "." ? "." : ",") as DecimalSeparator;
  const thousands: DecimalSeparator = decimal === "," ? "." : ",";

  return {
    decimal,
    thousands,
    setDecimal: (sep: DecimalSeparator) => setValue(sep),
  };
}
