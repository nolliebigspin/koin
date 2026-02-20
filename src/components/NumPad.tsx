import * as Haptics from "expo-haptics";
import { useCallback, useMemo } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface NumPadProps {
  onPress: (key: string) => void;
  decimalKey?: "," | ".";
}

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
    <View style={styles.container}>
      {keys.map((row) => (
        <View key={row[0]} style={styles.row}>
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
              <Text style={[styles.keyText, key === "⌫" && styles.backspaceText]}>{key}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  key: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    marginVertical: theme.spacing.xs,
    minHeight: 56,
    minWidth: 56,
    borderRadius: theme.radii.md,
  },
  keyPressed: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  keyText: {
    color: theme.colors.text,
    ...theme.typography.numpad,
  },
  backspaceText: {
    fontSize: 24,
  },
}));
