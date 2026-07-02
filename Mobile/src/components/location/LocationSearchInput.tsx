import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { LocationSearchSuggestion } from '../../types/location';
import { MapPinIcon, SearchIcon, XIcon } from '../Icons';

interface LocationSearchInputProps {
  query: string;
  isLoading: boolean;
  suggestions: LocationSearchSuggestion[];
  onChangeText: (value: string) => void;
  onClear: () => void;
  onSelectSuggestion: (suggestion: LocationSearchSuggestion) => void;
}

export default function LocationSearchInput({
  query,
  isLoading,
  suggestions,
  onChangeText,
  onClear,
  onSelectSuggestion,
}: LocationSearchInputProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.searchField}>
        <SearchIcon size={18} color={colors.neutral[400]} />
        <TextInput
          value={query}
          onChangeText={onChangeText}
          placeholder="Search a city or governorate in Tunisia"
          placeholderTextColor={colors.neutral[400]}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <XIcon size={18} color={colors.neutral[400]} />
          </TouchableOpacity>
        ) : null}
      </View>

      {query.trim().length > 0 ? (
        <View style={styles.resultsCard}>
          {isLoading ? (
            <View style={styles.stateRow}>
              <ActivityIndicator size="small" color={colors.primary[600]} />
              <Text style={styles.stateText}>Searching…</Text>
            </View>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestionRow}
                onPress={() => onSelectSuggestion(suggestion)}
                activeOpacity={0.85}
              >
                <View style={styles.suggestionIcon}>
                  <MapPinIcon size={16} color={colors.primary[600]} />
                </View>
                <View style={styles.suggestionBody}>
                  <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                  {suggestion.subtitle ? (
                    <Text style={styles.suggestionSubtitle}>{suggestion.subtitle}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.stateRow}>
              <Text style={styles.stateText}>
                No local scaffold matches yet. Try a city or governorate like Tunis,
                Sousse, or Sfax, or place the pin manually on the map.
              </Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.neutral[100],
    paddingHorizontal: spacing.base,
    minHeight: 54,
    ...shadows.sm,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.size.base,
    color: colors.neutral[800],
    paddingVertical: spacing.md,
  },
  resultsCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.sm,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[100],
    gap: spacing.md,
  },
  suggestionIcon: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionBody: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
  },
  suggestionSubtitle: {
    marginTop: 2,
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
  stateText: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    lineHeight: 20,
    textAlign: 'center',
  },
});
