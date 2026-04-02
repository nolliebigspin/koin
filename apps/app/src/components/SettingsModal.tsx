import * as WebBrowser from "expo-web-browser";
import { ExternalLink, Trash2 } from "lucide-react-native";
import { Alert, Modal, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Box, Text } from "@/src/components/ui";
import { type DecimalSeparator, useDecimalSeparator } from "@/src/hooks/useDecimalSeparator";
import * as haptics from "@/src/lib/haptics";
import { storage } from "@/src/lib/storage";

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

        <Box mt="xl">
          <Text
            variant="caption"
            color="textSecondary"
            mb="sm"
            style={{ textTransform: "uppercase", letterSpacing: 1 }}
          >
            About
          </Text>

          <Box style={styles.aboutContainer}>
            <Text variant="body" mb="sm">
              Exchange rates provided by ExchangeRate-API.
            </Text>
            <Text variant="caption" color="textSecondary" mb="md">
              Rates are for informational purposes only and may vary from actual market rates.
            </Text>

            <Pressable
              style={styles.linkButton}
              onPress={() => WebBrowser.openBrowserAsync("https://awinter.dev/other/koin/privacy")}
            >
              <Text variant="body" color="accent" style={{ fontWeight: "600" }}>
                Privacy Policy
              </Text>
              <ExternalLink size={16} color={theme.colors.accent} />
            </Pressable>
          </Box>
        </Box>

        {__DEV__ && (
          <Box mt="xl">
            <Text
              variant="caption"
              color="textSecondary"
              mb="sm"
              style={{ textTransform: "uppercase", letterSpacing: 1 }}
            >
              Developer
            </Text>

            <Pressable
              style={styles.dangerButton}
              onPress={() => {
                Alert.alert("Clear all data?", "This will reset the app to its initial state.", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => {
                      storage.clearAll();
                      haptics.warning();
                    },
                  },
                ]);
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear all stored data"
            >
              <Trash2 size={18} color={theme.colors.error} />
              <Text variant="body" color="error" style={{ fontWeight: "600" }}>
                Clear MMKV Storage
              </Text>
            </Pressable>
          </Box>
        )}
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
  aboutContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    minHeight: 56,
  },
}));
