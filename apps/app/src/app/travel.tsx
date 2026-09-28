import { type Currency, getCurrency, getCurrencyDecimals } from "@koin/shared";
import { ChevronDown, RotateCcw, Settings } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Path, Svg } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { CurrencyPickerModal } from "@/src/components/CurrencyPickerModal";
import { NumPad } from "@/src/components/NumPad";
import { SettingsModal } from "@/src/components/SettingsModal";
import { Box, Text } from "@/src/components/ui";
import { useDecimalSeparator } from "@/src/hooks/useDecimalSeparator";
import { useHomeCurrency } from "@/src/hooks/useHomeCurrency";
import { useKeepValueOnSwap } from "@/src/hooks/useKeepValueOnSwap";
import { useRates } from "@/src/hooks/useRates";
import { useTravelCurrency } from "@/src/hooks/useTravelCurrency";
import * as haptics from "@/src/lib/haptics";

function formatInputDisplay(raw: string, decimalSep: string, thousandsSep: string): string {
  if (!raw) return "0";
  const [intPart, decPart] = raw.split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
  return decPart !== undefined ? `${formatted}${decimalSep}${decPart}` : formatted;
}

function formatAmount(
  amount: number,
  decimals: number,
  decimalSep: string,
  thousandsSep: string
): string {
  const [intPart, decPart] = amount.toFixed(decimals).split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
  return decPart !== undefined ? `${formatted}${decimalSep}${decPart}` : formatted;
}

/** Applies a numpad key to the raw input, e.g. ("12", "3") → "123". */
function applyKey(prev: string, key: string, maxDecimals: number): string {
  if (key === "⌫") {
    return prev.slice(0, -1);
  }
  if (key === ".") {
    if (maxDecimals === 0 || prev.includes(".")) return prev;
    if (prev === "") return "0.";
  }
  if (prev.length >= 12) return prev;
  const decimalIndex = prev.indexOf(".");
  if (decimalIndex !== -1 && prev.length - decimalIndex > maxDecimals) return prev;
  if (prev === "0" && key !== ".") return key;
  return prev + key;
}

/** Converts an amount into raw input form, e.g. 108.2 → "108.2" (no trailing zeros). */
function toInputValue(amount: number, decimals: number): string {
  const value = String(Number(amount.toFixed(decimals)));
  return value === "0" ? "" : value;
}

const STROKE_PROPS = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

function ArrowUpHalf({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" color={color}>
      <Path d="m3 8 4-4 4 4" {...STROKE_PROPS} />
      <Path d="M7 4v16" {...STROKE_PROPS} />
    </Svg>
  );
}

function ArrowDownHalf({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" color={color}>
      <Path d="m21 16-4 4-4-4" {...STROKE_PROPS} />
      <Path d="M17 20V4" {...STROKE_PROPS} />
    </Svg>
  );
}

export default function TravelScreen() {
  const { theme, rt } = useUnistyles();
  const { homeCurrency, setHomeCurrency } = useHomeCurrency();
  const { travelCurrency, setTravelCurrency } = useTravelCurrency();
  const { decimal, thousands } = useDecimalSeparator();
  const { keepValue } = useKeepValueOnSwap();
  const { rates } = useRates(homeCurrency);

  const activeTravelCurrency = travelCurrency ?? "EUR";
  const activeHomeCurrency = homeCurrency ?? "USD";
  const travelDecimals = getCurrencyDecimals(activeTravelCurrency);
  const homeDecimals = getCurrencyDecimals(activeHomeCurrency);

  const [input, setInput] = useState("");
  // Exact amount carried over by a swap. Kept unrounded so swapping back and forth never drifts;
  // the next key replaces it (backspace edits its rounded form).
  const [carried, setCarried] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<"home" | "travel" | "settings" | null>(null);

  const ICON_SIZE = 18;
  const TRAVEL = ICON_SIZE * 1.5;

  const swapOffset = useSharedValue(0);
  const arrowUpStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -swapOffset.value }],
  }));
  const arrowDownStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: swapOffset.value }],
  }));

  const resetRotation = useSharedValue(0);
  const resetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${resetRotation.value}deg` }],
  }));

  const handleNumPadPress = useCallback(
    (key: string) => {
      if (key === "." && travelDecimals === 0) return;
      if (carried !== null) {
        const prev = key === "⌫" ? toInputValue(carried, travelDecimals) : "";
        setCarried(null);
        setInput(applyKey(prev, key, travelDecimals));
        return;
      }
      setInput((prev) => applyKey(prev, key, travelDecimals));
    },
    [carried, travelDecimals]
  );

  const travelRate = useMemo(() => {
    if (!rates) return null;
    return rates[activeTravelCurrency] ?? null;
  }, [rates, activeTravelCurrency]);

  const convertedAmount = useMemo(() => {
    if (!travelRate) return null;
    const foreignAmount = carried ?? parseFloat(input);
    if (Number.isNaN(foreignAmount) || foreignAmount === 0) return null;
    return foreignAmount / travelRate;
  }, [travelRate, input, carried]);

  const travelInfo = useMemo(() => getCurrency(activeTravelCurrency), [activeTravelCurrency]);
  const homeInfo = useMemo(() => getCurrency(activeHomeCurrency), [activeHomeCurrency]);

  const handleSwap = useCallback(() => {
    setHomeCurrency(activeTravelCurrency);
    setTravelCurrency(activeHomeCurrency);
    // Carry the converted value over so the direction flips without losing the amount.
    setInput("");
    setCarried(keepValue ? convertedAmount : null);
    swapOffset.value = withSequence(
      withTiming(TRAVEL, { duration: 150 }),
      withTiming(-TRAVEL, { duration: 0 }),
      withTiming(0, { duration: 150 })
    );
    haptics.medium();
  }, [
    activeHomeCurrency,
    activeTravelCurrency,
    convertedAmount,
    keepValue,
    setHomeCurrency,
    setTravelCurrency,
    swapOffset,
    TRAVEL,
  ]);

  const handleSelectHome = useCallback(
    (currency: Currency) => {
      setActiveModal(null);
      if (currency.code === activeTravelCurrency) {
        handleSwap();
        return;
      }
      setHomeCurrency(currency.code);
    },
    [activeTravelCurrency, handleSwap, setHomeCurrency]
  );

  const handleSelectTravel = useCallback(
    (currency: Currency) => {
      setActiveModal(null);
      if (currency.code === activeHomeCurrency) {
        handleSwap();
        return;
      }
      setTravelCurrency(currency.code);
      // Keep the typed amount, but drop decimals the new currency doesn't use.
      if (getCurrencyDecimals(currency.code) === 0) {
        setInput((prev) => prev.split(".")[0]);
      }
    },
    [activeHomeCurrency, handleSwap, setTravelCurrency]
  );

  const handleReset = useCallback(() => {
    setInput("");
    setCarried(null);
    resetRotation.value = withTiming(resetRotation.value - 360, { duration: 400 });
    haptics.warning();
  }, [resetRotation]);

  const displayResult = formatAmount(convertedAmount ?? 0, homeDecimals, decimal, thousands);

  // Scale weak currencies so the rate stays readable, e.g. "1.000 JPY = 6,70 USD".
  const rateLine = useMemo(() => {
    if (!travelRate) return null;
    const rate = 1 / travelRate;
    let scale = 1;
    while (rate * scale < 1 && scale < 1_000_000) scale *= 10;
    const travelAmount = formatAmount(scale, 0, decimal, thousands);
    const homeAmount = formatAmount(rate * scale, homeDecimals, decimal, thousands);
    return `${travelAmount} ${activeTravelCurrency} = ${homeAmount} ${activeHomeCurrency}`;
  }, [travelRate, homeDecimals, decimal, thousands, activeTravelCurrency, activeHomeCurrency]);

  return (
    <Box
      flex={1}
      bg="background"
      style={[styles.screen, { paddingTop: rt.insets.top + theme.spacing.md }]}
    >
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

      {/* Currency cards */}
      <Box px="md" pt="lg">
        {/* Input card (travel currency) */}
        <Pressable style={styles.card} onPress={() => setActiveModal("travel")}>
          <Box flex={1} justify="center">
            <Text
              variant="codeLarge"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
              maxFontSizeMultiplier={1.2}
            >
              {travelInfo?.symbol}{" "}
              {carried !== null
                ? formatAmount(carried, travelDecimals, decimal, thousands)
                : formatInputDisplay(input, decimal, thousands)}
            </Text>
          </Box>
          <Text style={styles.flag}>{travelInfo?.flag}</Text>
          <Box direction="row" align="center" gap="xxs">
            <Text variant="body" color="textSecondary">
              {activeTravelCurrency}
            </Text>
            <ChevronDown size={16} color={theme.colors.textSecondary} pointerEvents="none" />
          </Box>
        </Pressable>

        {/* Swap + Reset buttons */}
        <Box direction="row" align="center" justify="center" gap="md" style={styles.swapContainer}>
          <Pressable
            style={[styles.swapButton, styles.swapButtonClip]}
            onPress={handleSwap}
            accessibilityLabel="Swap currencies"
            accessibilityRole="button"
            hitSlop={8}
          >
            <Animated.View style={[styles.swapHalf, arrowUpStyle]}>
              <ArrowUpHalf size={ICON_SIZE} color={theme.colors.text} />
            </Animated.View>
            <Animated.View style={[styles.swapHalf, styles.swapHalfOverlay, arrowDownStyle]}>
              <ArrowDownHalf size={ICON_SIZE} color={theme.colors.text} />
            </Animated.View>
          </Pressable>
          <Pressable
            style={styles.swapButton}
            onPress={handleReset}
            accessibilityLabel="Reset input"
            accessibilityRole="button"
            hitSlop={8}
          >
            <Animated.View style={resetAnimatedStyle}>
              <RotateCcw size={ICON_SIZE} color={theme.colors.text} pointerEvents="none" />
            </Animated.View>
          </Pressable>
        </Box>

        {/* Result card (home currency) */}
        <Pressable style={styles.card} onPress={() => setActiveModal("home")}>
          <Box flex={1} justify="center">
            <Text
              variant="codeLarge"
              color="accent"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
              maxFontSizeMultiplier={1.2}
            >
              {homeInfo?.symbol} {displayResult}
            </Text>
          </Box>
          <Text style={styles.flag}>{homeInfo?.flag}</Text>
          <Box direction="row" align="center" gap="xxs">
            <Text variant="body" color="textSecondary">
              {activeHomeCurrency}
            </Text>
            <ChevronDown size={16} color={theme.colors.textSecondary} pointerEvents="none" />
          </Box>
        </Pressable>

        {/* Rate info */}
        {rateLine !== null && (
          <Text variant="caption" color="textTertiary" align="center" mt="sm">
            {rateLine}
          </Text>
        )}
      </Box>

      {/* Spacer */}
      <Box flex={1} />

      {/* NumPad */}
      <Box style={{ paddingBottom: rt.insets.bottom + theme.spacing.md }}>
        <NumPad onPress={handleNumPadPress} decimalKey={decimal} onClear={handleReset} />
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
  // Keeps the layout phone-sized and centered on tablets.
  screen: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  flag: {
    fontSize: 32,
  },
  swapContainer: {
    marginVertical: theme.spacing.md,
    zIndex: 1,
  },
  swapButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  swapButtonClip: {
    overflow: "hidden",
  },
  swapHalf: {
    alignItems: "center",
    justifyContent: "center",
  },
  swapHalfOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
}));
