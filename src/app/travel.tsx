import { Settings } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { CurrencyPickerModal } from "@/src/components/CurrencyPickerModal";
import { NumericDisplay } from "@/src/components/NumericDisplay";
import { NumPad } from "@/src/components/NumPad";
import { SettingsModal } from "@/src/components/SettingsModal";
import { Box, Text } from "@/src/components/ui";
import { type Currency, getCurrency } from "@/src/constants/currencies";
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
  const { rates, isLoading, isStale, refetch, lastUpdated } = useRates(homeCurrency);

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

  const homeInfo = useMemo(() => getCurrency(homeCurrency ?? "USD"), [homeCurrency]);
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

  return (
    <Box flex={1} bg="background" style={{ paddingTop: rt.insets.top + theme.spacing.md }}>
      <Box direction="row" align="center" px="md">
        <Box flex={1} align="flex-end" />
        <Pressable
          style={styles.homeCurrencyButton}
          onPress={() => setActiveModal("home")}
          accessibilityLabel={`Home currency: ${homeCurrency}. Tap to change.`}
        >
          <Text variant="caption" color="textSecondary">
            {homeInfo?.flag} {homeCurrency}
          </Text>
          <Text variant="caption" color="textTertiary" style={{ fontSize: 11 }}>
            change
          </Text>
        </Pressable>

        <Box flex={1} align="flex-end">
          <Pressable
            style={styles.settingsButton}
            onPress={() => setActiveModal("settings")}
            accessibilityLabel="Settings"
            hitSlop={12}
          >
            <Settings color={theme.colors.text} pointerEvents="none" />
          </Pressable>
        </Box>
      </Box>

      <Pressable
        style={styles.travelCurrencyButton}
        onPress={() => setActiveModal("travel")}
        accessibilityLabel={`Travel currency: ${activeTravelCurrency}. Tap to change.`}
      >
        <Text style={{ fontSize: 44 }}>{travelInfo?.flag}</Text>
        <Text variant="codeLarge" mt="xs">
          {activeTravelCurrency}
        </Text>
        <Text variant="caption" color="textSecondary" mt="xs">
          {travelInfo?.country}
        </Text>
      </Pressable>

      <Box py="sm">
        <Text variant="codeMedium" align="center">
          {formatInputDisplay(input, decimal, thousands)} {activeTravelCurrency}
        </Text>
      </Box>

      <NumericDisplay
        amount={convertedAmount}
        homeCurrency={homeCurrency ?? "USD"}
        travelCurrency={activeTravelCurrency}
        rate={travelRate}
        isStale={isStale}
        lastUpdated={lastUpdated}
        decimalSep={decimal}
        thousandsSep={thousands}
      />

      <Pressable
        style={styles.refreshButton}
        onPress={() => {
          void refetch();
        }}
        accessibilityLabel="Refresh exchange rates"
      >
        <Text variant="caption" color="textTertiary">
          {isLoading ? "Updating..." : "↻ Refresh rates"}
        </Text>
      </Pressable>

      <Box
        pt="sm"
        style={{ marginTop: "auto", paddingBottom: rt.insets.bottom + theme.spacing.md }}
      >
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
  homeCurrencyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  travelCurrencyButton: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
  },
  refreshButton: {
    alignSelf: "center",
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
}));
