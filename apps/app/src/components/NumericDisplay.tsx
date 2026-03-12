import { getCurrency } from "@koin/shared";
import { Pressable } from "react-native";
import { Box, Text } from "@/src/components/ui";

type NumericDisplayProps = {
  amount: number | null;
  homeCurrency: string;
  travelCurrency: string;
  rate: number | null;
  decimalSep?: "," | ".";
  thousandsSep?: "." | ",";
  onHomeCurrencyPress?: () => void;
};

function formatAmount(amount: number, decimalSep: string, thousandsSep: string): string {
  const [intPart, decPart] = amount.toFixed(2).split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
  return `${formatted}${decimalSep}${decPart}`;
}

export function NumericDisplay({
  amount,
  homeCurrency,
  travelCurrency,
  rate,
  decimalSep = ",",
  thousandsSep = ".",
  onHomeCurrencyPress,
}: NumericDisplayProps) {
  const homeInfo = getCurrency(homeCurrency);
  const displayAmount =
    amount !== null ? formatAmount(amount, decimalSep, thousandsSep) : `0${decimalSep}00`;

  return (
    <Box
      align="center"
      py="md"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${displayAmount} ${homeCurrency}`}
    >
      <Text
        variant="resultLarge"
        color="accent"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
      >
        {homeInfo?.symbol ?? ""}
        {displayAmount}
      </Text>

      <Pressable
        onPress={onHomeCurrencyPress}
        style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 }}
        accessibilityLabel={`Home currency: ${homeInfo?.name}, ${homeCurrency}. Tap to change.`}
        accessibilityRole="button"
      >
        <Text variant="body" color="textSecondary">
          {homeInfo?.flag} {homeInfo?.name} ({homeCurrency})
        </Text>
        <Text variant="caption" color="textTertiary" style={{ fontSize: 11 }}>
          change
        </Text>
      </Pressable>

      {rate !== null && (
        <Text variant="caption" color="textSecondary" mt="xs">
          1 {homeCurrency} = {rate.toFixed(4)} {travelCurrency}
        </Text>
      )}
    </Box>
  );
}
