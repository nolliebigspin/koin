import { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useHomeCurrency } from '@/hooks/useHomeCurrency';
import { useTravelCurrency } from '@/hooks/useTravelCurrency';
import { useDecimalSeparator } from '@/hooks/useDecimalSeparator';
import { useRates } from '@/hooks/useRates';
import { getCurrency } from '@/constants/currencies';
import { CurrencyPicker } from '@/components/CurrencyPicker';
import { NumericDisplay } from '@/components/NumericDisplay';
import { NumPad } from '@/components/NumPad';
import { SettingsModal } from '@/components/SettingsModal';
import type { Currency } from '@/constants/currencies';

function formatInputDisplay(raw: string, decimalSep: string, thousandsSep: string): string {
  if (!raw) return '0';
  const [intPart, decPart] = raw.split('.');
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
  return decPart !== undefined ? `${formatted}${decimalSep}${decPart}` : formatted;
}

export default function TravelScreen() {
  const { homeCurrency, setHomeCurrency } = useHomeCurrency();
  const { travelCurrency, setTravelCurrency } = useTravelCurrency();
  const { decimal, thousands } = useDecimalSeparator();
  const { rates, isLoading, isStale, refetch, lastUpdated } = useRates(homeCurrency);

  const activeTravelCurrency = travelCurrency ?? 'EUR';

  const [input, setInput] = useState('');
  const [showHomePicker, setShowHomePicker] = useState(false);
  const [showTravelPicker, setShowTravelPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleNumPadPress = useCallback((key: string) => {
    setInput((prev) => {
      if (key === '⌫') {
        return prev.slice(0, -1);
      }
      if (key === '.') {
        if (prev.includes('.')) return prev;
        if (prev === '') return '0.';
      }
      if (prev.length >= 12) return prev;
      const decimalIndex = prev.indexOf('.');
      if (decimalIndex !== -1 && prev.length - decimalIndex > 2) return prev;
      return prev + key;
    });
  }, []);

  const { convertedAmount, travelRate } = useMemo(() => {
    if (!rates || !input) {
      return { convertedAmount: null, travelRate: null };
    }

    const foreignAmount = parseFloat(input);
    if (isNaN(foreignAmount) || foreignAmount === 0) {
      return { convertedAmount: null, travelRate: null };
    }

    const rate = rates[activeTravelCurrency];
    if (!rate) {
      return { convertedAmount: null, travelRate: null };
    }

    const homeAmount = foreignAmount / rate;
    return { convertedAmount: homeAmount, travelRate: rate };
  }, [rates, input, activeTravelCurrency]);

  const homeInfo = getCurrency(homeCurrency ?? 'USD');
  const travelInfo = getCurrency(activeTravelCurrency);

  const handleSelectHome = useCallback((currency: Currency) => {
    setHomeCurrency(currency.code);
    setShowHomePicker(false);
    setInput('');
  }, [setHomeCurrency]);

  const handleSelectTravel = useCallback((currency: Currency) => {
    setTravelCurrency(currency.code);
    setShowTravelPicker(false);
    setInput('');
  }, [setTravelCurrency]);

  return (
    <View style={styles.container}>
      {/* Top bar: home currency + settings */}
      <View style={styles.topBar}>
        <Pressable
          style={styles.homeCurrencyButton}
          onPress={() => setShowHomePicker(true)}
          accessibilityLabel={`Home currency: ${homeCurrency}. Tap to change.`}
        >
          <Text style={styles.homeCurrencyLabel}>
            {homeInfo?.flag} {homeCurrency}
          </Text>
          <Text style={styles.changeHint}>change</Text>
        </Pressable>

        <Pressable
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
          accessibilityLabel="Settings"
          hitSlop={12}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>
      </View>

      {/* Travel currency selector */}
      <Pressable
        style={styles.travelCurrencyButton}
        onPress={() => setShowTravelPicker(true)}
        accessibilityLabel={`Travel currency: ${activeTravelCurrency}. Tap to change.`}
      >
        <Text style={styles.travelFlag}>{travelInfo?.flag}</Text>
        <Text style={styles.travelCode}>{activeTravelCurrency}</Text>
        <Text style={styles.travelCountry}>{travelInfo?.country}</Text>
      </Pressable>

      {/* Input display */}
      <Text style={styles.inputDisplay}>
        {formatInputDisplay(input, decimal, thousands)} {activeTravelCurrency}
      </Text>

      {/* Converted result */}
      <NumericDisplay
        amount={convertedAmount}
        homeCurrency={homeCurrency ?? 'USD'}
        travelCurrency={activeTravelCurrency}
        rate={travelRate}
        isStale={isStale}
        lastUpdated={lastUpdated}
        decimalSep={decimal}
        thousandsSep={thousands}
      />

      {/* Refresh button */}
      <Pressable
        style={styles.refreshButton}
        onPress={() => refetch()}
        accessibilityLabel="Refresh exchange rates"
      >
        <Text style={styles.refreshText}>
          {isLoading ? 'Updating...' : '↻ Refresh rates'}
        </Text>
      </Pressable>

      {/* NumPad pinned to bottom */}
      <View style={styles.numpadContainer}>
        <NumPad onPress={handleNumPadPress} decimalKey={decimal} />
      </View>

      {/* Modals */}
      <CurrencyPicker
        visible={showHomePicker}
        onSelect={handleSelectHome}
        onClose={() => setShowHomePicker(false)}
        selected={homeCurrency}
      />
      <CurrencyPicker
        visible={showTravelPicker}
        onSelect={handleSelectTravel}
        onClose={() => setShowTravelPicker(false)}
        selected={activeTravelCurrency}
      />
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: rt.insets.top + theme.spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  homeCurrencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  homeCurrencyLabel: {
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
  },
  changeHint: {
    color: theme.colors.textTertiary,
    ...theme.typography.caption,
    fontSize: 11,
  },
  settingsButton: {
    position: 'absolute',
    right: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  settingsIcon: {
    fontSize: 20,
    color: theme.colors.textTertiary,
  },
  travelCurrencyButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  travelFlag: {
    fontSize: 44,
  },
  travelCode: {
    color: theme.colors.text,
    ...theme.typography.codeLarge,
    marginTop: theme.spacing.xs,
  },
  travelCountry: {
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
  inputDisplay: {
    color: theme.colors.text,
    ...theme.typography.codeMedium,
    textAlign: 'center',
    paddingVertical: theme.spacing.sm,
  },
  refreshButton: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  refreshText: {
    color: theme.colors.textTertiary,
    ...theme.typography.caption,
  },
  numpadContainer: {
    marginTop: 'auto',
    paddingTop: theme.spacing.sm,
    paddingBottom: rt.insets.bottom + theme.spacing.md,
  },
}));
