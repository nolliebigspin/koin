import { type Currency, getCurrency } from "@koin/shared";
import * as Haptics from "expo-haptics";
import { ArrowUpDown, Settings } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Platform, Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { CurrencyPickerModal } from "@/src/components/CurrencyPickerModal";
import { NumericDisplay } from "@/src/components/NumericDisplay";
import { NumPad } from "@/src/components/NumPad";
import { SettingsModal } from "@/src/components/SettingsModal";
import { Box, Text } from "@/src/components/ui";
import { useDecimalSeparator } from "@/src/hooks/useDecimalSeparator";
import { useHomeCurrency } from "@/src/hooks/useHomeCurrency";
import { useRates } from "@/src/hooks/useRates";
import { useTravelCurrency } from "@/src/hooks/useTravelCurrency";

function formatInputDisplay(raw: string, decimalSep: string, thousandsSep: string): string {
  if (!raw) return "0";
  const [intPart, decPart] = raw.split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
  return decPart !== undefined ? `${formatted}${decimalSep}${decPart}` : formatted;
}

export default function TravelScreen() {
  const { theme, rt } = useUnistyles();
  const { homeCurrency, setHomeCurrency } = useHomeCurrency();
  const { travelCurrency, setTravelCurrency } = useTravelCurrency();
  const { decimal, thousands } = useDecimalSeparator();
  const { rates } = useRates(homeCurrency);

  const activeTravelCurrency = travelCurrency ?? "EUR";

  const [input, setInput] = useState("");
  const [activeModal, setActiveModal] = useState<"home" | "travel" | "settings" | null>(null);

  const handleNumPadPress = useCallback((key: string) => {
    setInput((prev) => {
      if (key === "⌫") {
        return prev.slice(0, -1);
      }
      if (key === ".") {
        if (prev.includes(".")) return prev;
        if (prev === "") return "0.";
      }
      if (prev.length >= 12) return prev;
      const decimalIndex = prev.indexOf(".");
      if (decimalIndex !== -1 && prev.length - decimalIndex > 2) return prev;
      return prev + key;
    });
  }, []);

  const { convertedAmount, travelRate } = useMemo(() => {
    if (!rates || !input) {
      return { convertedAmount: null, travelRate: null };
    }

    const foreignAmount = parseFloat(input);
    if (Number.isNaN(foreignAmount) || foreignAmount === 0) {
      return { convertedAmount: null, travelRate: null };
    }

    const rate = rates[activeTravelCurrency];
    if (!rate) {
      return { convertedAmount: null, travelRate: null };
    }

    const homeAmount = foreignAmount / rate;
    return { convertedAmount: homeAmount, travelRate: rate };
  }, [rates, input, activeTravelCurrency]);

  const travelInfo = useMemo(() => getCurrency(activeTravelCurrency), [activeTravelCurrency]);

  const handleSelectHome = useCallback(
    (currency: Currency) => {
      setHomeCurrency(currency.code);
      setActiveModal(null);
      setInput("");
    },
    [setHomeCurrency]
  );

  const handleSelectTravel = useCallback(
    (currency: Currency) => {
      setTravelCurrency(currency.code);
      setActiveModal(null);
      setInput("");
    },
    [setTravelCurrency]
  );

  const handleSwap = useCallback(() => {
    const oldHome = homeCurrency;
    const oldTravel = activeTravelCurrency;
    setHomeCurrency(oldTravel);
    setTravelCurrency(oldHome ?? "USD");
    setInput("");
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [homeCurrency, activeTravelCurrency, setHomeCurrency, setTravelCurrency]);

  return (
    <Box flex={1} bg="background" style={{ paddingTop: rt.insets.top + theme.spacing.md }}>
      {/* Top bar: settings gear only */}
      <Box direction="row" justify="flex-end" px="md">
        <Pressable
          style={styles.settingsButton}
          onPress={() => setActiveModal("settings")}
          accessibilityLabel="Settings"
          hitSlop={12}
        >
          <Settings color={theme.colors.text} pointerEvents="none" />
        </Pressable>
      </Box>

      {/* Result zone: converted amount + home currency info */}
      <Box align="center" px="md" pt="xl">
        <NumericDisplay
          amount={convertedAmount}
          homeCurrency={homeCurrency ?? "USD"}
          travelCurrency={activeTravelCurrency}
          rate={travelRate}
          decimalSep={decimal}
          thousandsSep={thousands}
          onHomeCurrencyPress={() => setActiveModal("home")}
        />
      </Box>

      {/* Swap button — centered in remaining space */}
      <Box flex={1} align="center" justify="center">
        <Pressable
          style={styles.swapButton}
          onPress={handleSwap}
          accessibilityLabel="Swap currencies"
          accessibilityRole="button"
          hitSlop={8}
        >
          <ArrowUpDown size={20} color={theme.colors.text} />
        </Pressable>
      </Box>

      {/* Input zone: travel currency input + selector */}
      <Box align="center" px="md" pb="sm">
        <Text
          variant="codeLarge"
          align="center"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {formatInputDisplay(input, decimal, thousands)}
        </Text>

        <Pressable
          style={styles.travelInfoRow}
          onPress={() => setActiveModal("travel")}
          accessibilityLabel={`Travel currency: ${travelInfo?.name}, ${activeTravelCurrency}. Tap to change.`}
          accessibilityRole="button"
        >
          <Text variant="caption" color="textSecondary">
            {travelInfo?.flag} {travelInfo?.name} ({activeTravelCurrency}) · {travelInfo?.symbol}
          </Text>
          <Text variant="caption" color="textTertiary" style={{ fontSize: 11 }}>
            change
          </Text>
        </Pressable>
      </Box>

      {/* NumPad */}
      <Box style={{ paddingBottom: rt.insets.bottom + theme.spacing.md }}>
        <NumPad onPress={handleNumPadPress} decimalKey={decimal} />
      </Box>

      <CurrencyPickerModal
        visible={activeModal === "home"}
        onSelect={handleSelectHome}
        onClose={() => setActiveModal(null)}
        selected={homeCurrency}
      />
      <CurrencyPickerModal
        visible={activeModal === "travel"}
        onSelect={handleSelectTravel}
        onClose={() => setActiveModal(null)}
        selected={activeTravelCurrency}
      />
      <SettingsModal visible={activeModal === "settings"} onClose={() => setActiveModal(null)} />
    </Box>
  );
}

const styles = StyleSheet.create((theme) => ({
  settingsButton: {
    padding: theme.spacing.sm,
  },
  swapButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  travelInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
}));
