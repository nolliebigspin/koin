import type { Currency } from "@koin/shared";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { useUnistyles } from "react-native-unistyles";
import { CurrencyPickerModal } from "@/src/components/CurrencyPickerModal";
import { Box, Text } from "@/src/components/ui";
import { useHomeCurrency } from "@/src/hooks/useHomeCurrency";
import { useTravelCurrency } from "@/src/hooks/useTravelCurrency";

export default function OnboardingScreen() {
  const { theme } = useUnistyles();
  const { setHomeCurrency } = useHomeCurrency();
  const { setTravelCurrency } = useTravelCurrency();
  const [step, setStep] = useState<"home" | "travel">("home");

  const handleSelectHome = useCallback(
    (currency: Currency) => {
      setHomeCurrency(currency.code);
      setStep("travel");
    },
    [setHomeCurrency]
  );

  const handleSelectTravel = useCallback(
    (currency: Currency) => {
      setTravelCurrency(currency.code);
      router.replace("/travel");
    },
    [setTravelCurrency]
  );

  return (
    <Box flex={1} bg="background">
      <Box px="md" pb="lg" style={{ paddingTop: theme.spacing.xxl + theme.spacing.xl }}>
        {step === "home" ? (
          <>
            <Text variant="heading" style={{ fontSize: 36 }}>
              {"What's your\ncurrency?"}
            </Text>
            <Text variant="body" color="textSecondary" mt="sm">
              This is the currency you think in.
            </Text>
          </>
        ) : (
          <>
            <Text variant="heading" style={{ fontSize: 36 }}>
              {"Where are you\ntraveling?"}
            </Text>
            <Text variant="body" color="textSecondary" mt="sm">
              Pick the currency of your destination.
            </Text>
          </>
        )}
      </Box>

      <CurrencyPickerModal
        visible={true}
        onSelect={step === "home" ? handleSelectHome : handleSelectTravel}
        onClose={() => {}}
        mode="inline"
      />
    </Box>
  );
}
