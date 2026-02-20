import { router } from "expo-router";
import { useCallback } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { CurrencyPicker } from "@/src/components/CurrencyPicker";
import type { Currency } from "@/src/constants/currencies";
import { useHomeCurrency } from "@/src/hooks/useHomeCurrency";

export default function OnboardingScreen() {
  const { setHomeCurrency } = useHomeCurrency();

  const handleSelect = useCallback(
    (currency: Currency) => {
      setHomeCurrency(currency.code);
      router.replace("/travel");
    },
    [setHomeCurrency]
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.headline}>{"What's your\ncurrency?"}</Text>
        <Text style={styles.subtitle}>This is the currency you think in.</Text>
      </View>

      <CurrencyPicker visible={true} onSelect={handleSelect} onClose={() => {}} mode="inline" />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerSection: {
    paddingTop: theme.spacing.xxl + theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  headline: {
    color: theme.colors.text,
    ...theme.typography.heading,
    fontSize: 36,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    ...theme.typography.body,
    marginTop: theme.spacing.sm,
  },
}));
