import { Modal, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Box, Text } from "@/src/components/ui";
import { type DecimalSeparator, useDecimalSeparator } from "@/src/hooks/useDecimalSeparator";

type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { theme } = useUnistyles();
  const { decimal, setDecimal } = useDecimalSeparator();

  const options: { value: DecimalSeparator; label: string; example: string }[] = [
    { value: ",", label: "Comma (,)", example: "1.000,50" },
    { value: ".", label: "Period (.)", example: "1,000.50" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <Box flex={1} bg="background" p="lg">
        <Box direction="row" justify="space-between" align="center" pb="xl">
          <Text variant="heading">Settings</Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text variant="button">Done</Text>
          </Pressable>
        </Box>

        <Text
          variant="caption"
          color="textSecondary"
          mb="sm"
          style={{ textTransform: "uppercase", letterSpacing: 1 }}
        >
          Decimal separator
        </Text>

        {options.map((opt) => {
          const isActive = decimal === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.option, isActive && styles.optionActive]}
              onPress={() => setDecimal(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${opt.label}, example: ${opt.example}`}
            >
              <Box flex={1}>
                <Text variant="body" style={{ fontWeight: "600" }}>
                  {opt.label}
                </Text>
                <Text
                  variant="caption"
                  color="textSecondary"
                  mt="xxs"
                  style={{ fontFamily: theme.fonts.mono }}
                >
                  {opt.example}
                </Text>
              </Box>
              <View style={[styles.radio, isActive && styles.radioActive]}>
                {isActive && <Box width={12} height={12} radius="full" bg="accent" />}
              </View>
            </Pressable>
          );
        })}
      </Box>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    minHeight: 56,
  },
  optionActive: {
    backgroundColor: theme.colors.accentDim,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.textTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing.md,
  },
  radioActive: {
    borderColor: theme.colors.accent,
  },
}));
