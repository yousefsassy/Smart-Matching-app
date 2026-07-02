import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import {
  SERVICE_CATEGORY_ROWS,
  ServiceCategoryMeta,
  getServiceSearchSuggestions,
  getServiceCategoryLabel,
} from '../../constants/serviceCategories';
import { ServiceCategory } from '../../types/serviceRequest';
import Input from '../Input';
import { SearchIcon } from '../Icons';

interface ServiceTypeStepProps {
  selectedCategory: ServiceCategory | null;
  error?: string;
  onChange: (category: ServiceCategory) => void;
}

function CategoryCard({
  config,
  isSelected,
  onPress,
}: {
  config: ServiceCategoryMeta;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scaleAnim, {
      toValue: value,
      useNativeDriver: true,
      damping: 16,
      stiffness: 260,
    }).start();
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.92}
        onPressIn={() => animateTo(0.985)}
        onPressOut={() => animateTo(1)}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
          {config.label}
        </Text>
        <Text style={[styles.cardDescription, isSelected && styles.cardDescriptionSelected]}>
          {config.description}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ServiceTypeStep({
  selectedCategory,
  error,
  onChange,
}: ServiceTypeStepProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const suggestions = useMemo(
    () => getServiceSearchSuggestions(searchQuery),
    [searchQuery]
  );

  const handleSuggestionPress = (label: string, category: ServiceCategory) => {
    setSearchQuery(label);
    onChange(category);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose a service</Text>
      </View>

      <Input
        label="Search service"
        placeholder="Try electrician, cleaner, mover..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        icon={<SearchIcon size={18} color={colors.neutral[400]} />}
        containerStyle={styles.searchField}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="search"
      />

      {searchQuery.trim().length > 0 ? (
        <View style={styles.suggestionsCard}>
          {suggestions.length > 0 ? (
            <View style={styles.suggestionsWrap}>
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestionPress(suggestion.label, suggestion.serviceCategory)}
                  activeOpacity={0.82}
                >
                  <Text style={styles.suggestionText}>{suggestion.label}</Text>
                  <Text style={styles.suggestionMeta}>{getServiceCategoryLabel(suggestion.serviceCategory)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noResultsText}>
              No local matches yet. Try terms like electrician, plumber, cleaner, or mover.
            </Text>
          )}
        </View>
      ) : null}

      <View style={styles.grid}>
        {SERVICE_CATEGORY_ROWS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cat) => (
              <CategoryCard
                key={cat.value}
                config={cat}
                isSelected={selectedCategory === cat.value}
                onPress={() => onChange(cat.value)}
              />
            ))}
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.raised,
    borderRadius: 26,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.role.sectionTitle,
    color: colors.primary[900],
  },
  searchField: {
    marginBottom: spacing.md,
  },
  suggestionsCard: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    backgroundColor: colors.surface.base,
    marginBottom: spacing.lg,
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.tint,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  suggestionText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary[800],
  },
  suggestionMeta: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    marginTop: 2,
  },
  noResultsText: {
    fontSize: typography.size.sm,
    lineHeight: 20,
    color: colors.neutral[500],
  },
  grid: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    minHeight: 132,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.surface.base,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderColor: colors.primary[700],
    backgroundColor: colors.surface.tint,
  },
  emoji: {
    fontSize: 26,
  },
  cardLabel: {
    fontSize: typography.size.base,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.2,
  },
  cardLabelSelected: {
    color: colors.primary[800],
  },
  cardDescription: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    lineHeight: 16,
  },
  cardDescriptionSelected: {
    color: colors.primary[600],
  },
  error: {
    fontSize: typography.size.xs,
    color: colors.error,
    marginTop: spacing.md,
  },
});
