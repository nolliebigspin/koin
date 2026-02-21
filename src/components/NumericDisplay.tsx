import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { getCurrency } from "@/src/constants/currencies";

type NumericDisplayProps = {
  amount: number | null;
  homeCurrency: string;
  travelCurrency: string;
  rate: number | null;
  isStale: boolean;
  lastUpdated: number | null;
  decimalSep?: "," | ".";
  thousandsSep?: "." | ",";
};

function formatAmount(amount: number, decimalSep: string, thousandsSep: string): string {
  const [intPart, decPart] = amount.toFixed(2).split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
  return `${formatted}${decimalSep}${decPart}`;
}

function formatLastUpdated(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function NumericDisplay({
  amount,
  homeCurrency,
  travelCurrency,
  rate,
  isStale,
  lastUpdated,
  decimalSep = ",",
  thousandsSep = ".",
}: NumericDisplayProps) {
  const homeInfo = getCurrency(homeCurrency);
  const displayAmount =
    amount !== null ? formatAmount(amount, decimalSep, thousandsSep) : `0${decimalSep}00`;

  return (
    <View
      style={styles.container}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${displayAmount} ${homeCurrency}`}
    >
      <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
        {homeInfo?.symbol ?? ""}
        {displayAmount}
      </Text>

      {rate !== null && (
        <Text style={styles.rateInfo}>
          1 {homeCurrency} = {rate.toFixed(4)} {travelCurrency}
          {lastUpdated ? ` · ${formatLastUpdated(lastUpdated)}` : ""}
        </Text>
      )}

      {isStale && <Text style={styles.staleWarning}>rates may be outdated</Text>}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  amount: {
    color: theme.colors.accent,
    ...theme.typography.resultLarge,
  },
  rateInfo: {
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
  staleWarning: {
    color: theme.colors.error,
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
}));
