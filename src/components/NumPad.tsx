import * as Haptics from "expo-haptics";
import { useCallback, useMemo } from "react";
import { Platform, Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Box, Text } from "@/src/components/ui";

type NumPadProps = {
  onPress: (key: string) => void;
  decimalKey?: "," | ".";
};

export function NumPad({ onPress, decimalKey = "," }: NumPadProps) {
  const keys = useMemo(
    () => [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
      [decimalKey, "0", "⌫"],
    ],
    [decimalKey]
  );

  const handlePress = useCallback(
    (key: string) => {
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      // Normalise decimal separator to '.' for parseFloat
      onPress(key === "," ? "." : key);
    },
    [onPress]
  );

  return (
    <Box px="md" pb="md">
      {keys.map((row) => (
        <Box key={row[0]} direction="row" justify="space-around">
          {row.map((key) => (
            <Pressable
              key={key}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              onPress={() => handlePress(key)}
              accessibilityRole="button"
              accessibilityLabel={
                key === "⌫" ? "Backspace" : key === "," || key === "." ? "Decimal point" : key
              }
            >
              <Text variant="numpad" style={key === "⌫" ? { fontSize: 24 } : undefined}>
                {key}
              </Text>
            </Pressable>
          ))}
        </Box>
      ))}
    </Box>
  );
}

const styles = StyleSheet.create((theme) => ({
  key: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    marginVertical: theme.spacing.xs,
    minHeight: 56,
    minWidth: 56,
    borderRadius: theme.radius.md,
  },
  keyPressed: {
    backgroundColor: theme.colors.surfaceElevated,
  },
}));
