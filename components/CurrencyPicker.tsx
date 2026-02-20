import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { type Currency, currencies } from "@/constants/currencies";

interface CurrencyPickerProps {
  visible: boolean;
  onSelect: (currency: Currency) => void;
  onClose: () => void;
  selected?: string;
  mode?: "modal" | "inline";
}

export function CurrencyPicker({
  visible,
  onSelect,
  onClose,
  selected,
  mode = "modal",
}: CurrencyPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return currencies;
    const q = search.toLowerCase().trim();
    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSelect = useCallback(
    (currency: Currency) => {
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onSelect(currency);
      setSearch("");
    },
    [onSelect]
  );

  const renderItem = useCallback(
    ({ item }: { item: Currency }) => {
      const isSelected = item.code === selected;
      return (
        <Pressable
          style={[styles.row, isSelected && styles.rowSelected]}
          onPress={() => handleSelect(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${item.code}`}
        >
          <Text style={styles.flag}>{item.flag}</Text>
          <View style={styles.rowText}>
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {item.country} · {item.name}
            </Text>
          </View>
        </Pressable>
      );
    },
    [selected, handleSelect]
  );

  const keyExtractor = useCallback((item: Currency) => item.code, []);

  const content = (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {mode === "modal" && (
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={styles.closeButton}>Close</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search currency or country..."
          placeholderTextColor="#666666"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={20}
      />
    </KeyboardAvoidingView>
  );

  if (mode === "inline") {
    return content;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: theme.spacing.md,
    paddingTop: rt.insets.top + theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  closeButton: {
    color: theme.colors.accent,
    fontSize: 17,
    fontWeight: "600",
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
    fontSize: 16,
  },
  list: {
    paddingBottom: theme.spacing.xxl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.md,
    minHeight: 56,
  },
  rowSelected: {
    backgroundColor: theme.colors.accentDim,
  },
  flag: {
    fontSize: 28,
    marginRight: theme.spacing.sm + 4,
  },
  rowText: {
    flex: 1,
  },
  code: {
    color: theme.colors.text,
    ...theme.typography.codeMedium,
  },
  name: {
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
    marginTop: 2,
  },
}));
