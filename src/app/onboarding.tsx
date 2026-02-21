import { router } from "expo-router";
import { useCallback } from "react";
import { useUnistyles } from "react-native-unistyles";
import { CurrencyPickerModal } from "@/src/components/CurrencyPickerModal";
import { Box, Text } from "@/src/components/ui";
import type { Currency } from "@/src/constants/currencies";
import { useHomeCurrency } from "@/src/hooks/useHomeCurrency";

export default function OnboardingScreen() {
  const { theme } = useUnistyles();
  const { setHomeCurrency } = useHomeCurrency();

  const handleSelect = useCallback(
    (currency: Currency) => {
      setHomeCurrency(currency.code);
      router.replace("/travel");
    },
    [setHomeCurrency]
  );

  return (
    <Box flex={1} bg="background">
      <Box px="md" pb="lg" style={{ paddingTop: theme.spacing.xxl + theme.spacing.xl }}>
        <Text variant="heading" style={{ fontSize: 36 }}>
          {"What's your\ncurrency?"}
        </Text>
        <Text variant="body" color="textSecondary" mt="sm">
          This is the currency you think in.
        </Text>
      </Box>

      <CurrencyPickerModal
        visible={true}
        onSelect={handleSelect}
        onClose={() => {}}
        mode="inline"
      />
    </Box>
  );
}
