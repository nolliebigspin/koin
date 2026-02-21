import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Box, Text } from "@/src/components/ui";
import { type Currency, currencies } from "@/src/constants/currencies";

type CurrencyPickerModalProps = {
  visible: boolean;
  onSelect: (currency: Currency) => void;
  onClose: () => void;
  selected?: string;
  mode?: "modal" | "inline";
};

export function CurrencyPickerModal({
  visible,
  onSelect,
  onClose,
  selected,
  mode = "modal",
}: CurrencyPickerModalProps) {
  const { theme } = useUnistyles();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!visible) setSearch("");
  }, [visible]);

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
          <Box flex={1}>
            <Text variant="codeMedium">{item.code}</Text>
            <Text variant="caption" color="textSecondary" mt="xxs" numberOfLines={1}>
              {item.country} · {item.name}
            </Text>
          </Box>
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
        <Box direction="row" justify="flex-end" p="lg" px="md">
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text variant="button">Close</Text>
          </Pressable>
        </Box>
      )}

      <Box px="md" pb="sm">
        <TextInput
          style={styles.searchInput}
          placeholder="Search currency or country..."
          placeholderTextColor={theme.colors.placeholder}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </Box>

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

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderRadius: theme.radius.md,
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
}));
