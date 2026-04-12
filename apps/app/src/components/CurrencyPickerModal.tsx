import { type Currency, currencies } from "@koin/shared";
import { Star } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SectionList,
  TextInput,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Box, Text } from "@/src/components/ui";
import { useFavoriteCurrencies } from "@/src/hooks/useFavoriteCurrencies";
import * as haptics from "@/src/lib/haptics";

type CurrencyPickerModalProps = {
  visible: boolean;
  onSelect: (currency: Currency) => void;
  onClose: () => void;
  selected?: string;
  mode?: "modal" | "inline";
};

type Section = { title: string; data: Currency[] };

export function CurrencyPickerModal({
  visible,
  onSelect,
  onClose,
  selected,
  mode = "modal",
}: CurrencyPickerModalProps) {
  const { theme } = useUnistyles();
  const [search, setSearch] = useState("");
  const { favorites, setFavorites } = useFavoriteCurrencies();

  // Snapshot: frozen on modal open, determines section membership
  const snapshotFavoritesRef = useRef<Set<string>>(new Set());
  // Display: updated on every star tap, drives star fill state
  const [displayFavorites, setDisplayFavorites] = useState<Set<string>>(new Set());
  // Bumped on open to force sections useMemo to recompute
  const [sectionVersion, setSectionVersion] = useState(0);

  useEffect(() => {
    if (visible) {
      const currentFavs = new Set(favorites);
      snapshotFavoritesRef.current = currentFavs;
      setDisplayFavorites(currentFavs);
      setSectionVersion((v) => v + 1);
    } else {
      setSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]); // favorites intentionally excluded — only read on open

  const sections = useMemo(() => {
    const snapshot = snapshotFavoritesRef.current;
    const q = search.toLowerCase().trim();

    const matchesSearch = (c: Currency) =>
      !q ||
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q);

    const favSection: Currency[] = [];
    const allSection: Currency[] = [];

    for (const c of currencies) {
      if (!matchesSearch(c)) continue;
      if (snapshot.has(c.code)) favSection.push(c);
      else allSection.push(c);
    }

    const result: Section[] = [];
    if (favSection.length > 0) {
      result.push({ title: "Favorites", data: favSection });
    }
    result.push({ title: "All Currencies", data: allSection });
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sectionVersion]);

  const toggleFavorite = useCallback(
    (code: string) => {
      if (Platform.OS === "ios") {
        haptics.rigid();
      }
      setDisplayFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(code)) next.delete(code);
        else next.add(code);
        setFavorites([...next]);
        return next;
      });
    },
    [setFavorites]
  );

  const handleSelect = useCallback(
    (currency: Currency) => {
      if (Platform.OS === "ios") {
        haptics.tap();
      }
      onSelect(currency);
      setSearch("");
    },
    [onSelect]
  );

  const renderItem = useCallback(
    ({ item }: { item: Currency }) => {
      const isSelected = item.code === selected;
      const isFavorited = displayFavorites.has(item.code);
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
          <Pressable
            onPress={() => toggleFavorite(item.code)}
            hitSlop={12}
            style={styles.starButton}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorited ? `Remove ${item.code} from favorites` : `Add ${item.code} to favorites`
            }
          >
            <Star
              size={20}
              color={theme.colors.accent}
              fill={isFavorited ? theme.colors.accent : "transparent"}
            />
          </Pressable>
        </Pressable>
      );
    },
    [selected, handleSelect, displayFavorites, toggleFavorite, theme]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <Box px="md" pt="md" pb="xs" bg="background">
        <Text variant="caption" color="textSecondary" style={styles.sectionHeader}>
          {section.title}
        </Text>
      </Box>
    ),
    []
  );

  const keyExtractor = useCallback((item: Currency, index: number) => `${index}-${item.code}`, []);

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

      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={20}
        stickySectionHeadersEnabled={false}
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
  starButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  sectionHeader: {
    textTransform: "uppercase",
    letterSpacing: 1,
  },
}));
