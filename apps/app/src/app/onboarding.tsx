import type { Currency } from "@koin/shared";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import Animated, { SlideInRight, SlideOutLeft } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";
import { CurrencyPickerModal } from "@/src/components/CurrencyPickerModal";
import { Box, Text } from "@/src/components/ui";
import { useHomeCurrency } from "@/src/hooks/useHomeCurrency";
import { useTravelCurrency } from "@/src/hooks/useTravelCurrency";
import * as haptics from "@/src/lib/haptics";

const STEP = {
  home: { title: "What's your\ncurrency?", subtitle: "This is the currency you think in." },
  travel: {
    title: "Where are you\ntraveling?",
    subtitle: "Pick the currency of your destination.",
  },
} as const;

export default function OnboardingScreen() {
  const { theme } = useUnistyles();
  const { setHomeCurrency } = useHomeCurrency();
  const { setTravelCurrency } = useTravelCurrency();
  const [step, setStep] = useState<"home" | "travel">("home");

  const handleSelectHome = useCallback(
    (currency: Currency) => {
      setHomeCurrency(currency.code);
      haptics.success();
      setStep("travel");
    },
    [setHomeCurrency]
  );

  const handleSelectTravel = useCallback(
    (currency: Currency) => {
      setTravelCurrency(currency.code);
      haptics.success();
      router.replace("/travel");
    },
    [setTravelCurrency]
  );

  return (
    <Box flex={1} bg="background">
      <Animated.View
        key={step}
        entering={SlideInRight.duration(250)}
        exiting={SlideOutLeft.duration(250)}
        style={{ flex: 1 }}
      >
        <Box px="md" pb="lg" style={{ paddingTop: theme.spacing.xxl + theme.spacing.xl }}>
          <Text variant="heading" style={{ fontSize: 36 }}>
            {STEP[step].title}
          </Text>
          <Text variant="body" color="textSecondary" mt="sm">
            {STEP[step].subtitle}
          </Text>
        </Box>

        <CurrencyPickerModal
          visible={true}
          onSelect={step === "home" ? handleSelectHome : handleSelectTravel}
          onClose={() => {}}
          mode="inline"
        />
      </Animated.View>
    </Box>
  );
}
