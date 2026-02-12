import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  TextInput,
  Keyboard,
  Platform,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { MapPinIcon, ChevronDownIcon, SearchIcon, XIcon, CheckIcon } from './Icons';

const TUNISIA_GOVERNORATES = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Zaghouan',
  'Bizerte',
  'Béja',
  'Jendouba',
  'Le Kef',
  'Siliana',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gabès',
  'Médenine',
  'Tataouine',
  'Gafsa',
  'Tozeur',
  'Kebili',
];

interface LocationPickerProps {
  value: string;
  onSelect: (location: string) => void;
  error?: string;
}

export default function LocationPicker({ value, onSelect, error }: LocationPickerProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const filtered = search
    ? TUNISIA_GOVERNORATES.filter((g) =>
        g.toLowerCase().includes(search.toLowerCase())
      )
    : TUNISIA_GOVERNORATES;

  const open = () => {
    setSearch('');
    setVisible(true);
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 1,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const close = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  };

  const handleSelect = (location: string) => {
    onSelect(location);
    close();
  };

  const borderColor = error ? colors.error : colors.neutral[200];

  return (
    <>
      <TouchableOpacity
        style={[styles.field, { borderColor }]}
        onPress={open}
        activeOpacity={0.7}
      >
        <View style={styles.iconLeft}>
          <MapPinIcon size={20} color={colors.neutral[400]} />
        </View>
        <Text style={[styles.fieldText, !value && styles.placeholder]}>
          {value || 'Select location'}
        </Text>
        <View style={styles.iconRight}>
          <ChevronDownIcon size={20} color={colors.neutral[400]} />
        </View>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={visible} transparent animationType="none">
        <View style={styles.modalWrapper}>
          {/* Backdrop */}
          <Animated.View
            style={[styles.backdrop, { opacity: backdropAnim }]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={close}
            />
          </Animated.View>

          {/* Sheet */}
          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Location</Text>
              <TouchableOpacity onPress={close} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <XIcon size={22} color={colors.neutral[500]} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <SearchIcon size={18} color={colors.neutral[400]} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search governorate..."
                placeholderTextColor={colors.neutral[400]}
                autoCorrect={false}
              />
            </View>

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No results found</Text>
              }
              renderItem={({ item }) => {
                const isSelected = item === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <MapPinIcon
                      size={18}
                      color={isSelected ? colors.primary[600] : colors.neutral[400]}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <CheckIcon size={18} color={colors.primary[600]} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // --- Trigger field ---
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[50],
    overflow: 'hidden',
  },
  fieldText: {
    flex: 1,
    fontSize: typography.size.base,
    color: colors.neutral[800],
    paddingVertical: spacing.md + 2,
  },
  placeholder: {
    color: colors.neutral[400],
  },
  iconLeft: {
    paddingLeft: spacing.base,
    paddingRight: spacing.sm,
  },
  iconRight: {
    paddingRight: spacing.base,
  },
  error: {
    fontSize: typography.size.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },

  // --- Modal ---
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  sheet: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
    ...shadows.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },

  // --- Search ---
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.xs,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.base,
    color: colors.neutral[800],
    marginLeft: spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? 0 : spacing.xs,
  },

  // --- Options ---
  list: {
    paddingHorizontal: spacing.xl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.primary[50],
  },
  optionText: {
    flex: 1,
    fontSize: typography.size.base,
    color: colors.neutral[700],
  },
  optionTextSelected: {
    color: colors.primary[700],
    fontWeight: typography.weight.semibold,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.neutral[400],
    fontSize: typography.size.base,
    paddingVertical: spacing.xl,
  },
});
