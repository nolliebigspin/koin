import { Modal, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { type DecimalSeparator, useDecimalSeparator } from "@/hooks/useDecimalSeparator";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={styles.closeButton}>Done</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Decimal separator</Text>

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
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <Text style={styles.optionExample}>{opt.example}</Text>
              </View>
              <View style={[styles.radio, isActive && styles.radioActive]}>
                {isActive && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: rt.insets.top + theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: theme.spacing.xl,
  },
  title: {
    color: theme.colors.text,
    ...theme.typography.heading,
  },
  closeButton: {
    color: theme.colors.accent,
    fontSize: 17,
    fontWeight: "600",
  },
  sectionLabel: {
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    minHeight: 56,
  },
  optionActive: {
    backgroundColor: theme.colors.accentDim,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    color: theme.colors.text,
    ...theme.typography.body,
    fontWeight: "600",
  },
  optionExample: {
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
    fontFamily: theme.fonts.mono,
    marginTop: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.textTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing.md,
  },
  radioActive: {
    borderColor: theme.colors.accent,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.accent,
  },
}));
