import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import {
  SERVICE_CATEGORY_ROWS,
  ServiceCategoryMeta,
} from '../../constants/serviceCategories';
import { ServiceCategory } from '../../types/serviceRequest';

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

  // Bounce the card when selection state changes
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.02 : 1,
      useNativeDriver: true,
      damping: isSelected ? 12 : 15,
      stiffness: isSelected ? 180 : 300,
    }).start();
  }, [isSelected, scaleAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.02 : 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const cardContent = (selected: boolean) => (
    <>
      {/* Icon circle */}
      <View style={selected ? styles.iconCircleSelected : styles.iconCircle}>
        <Text style={styles.emoji}>{config.emoji}</Text>
      </View>

      {/* Label */}
      <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
        {config.label}
      </Text>

      {/* Description */}
      <Text style={[styles.cardDescription, selected && styles.cardDescriptionSelected]}>
        {config.description}
      </Text>
    </>
  );

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ scale: scaleAnim }] },
        isSelected && styles.cardWrapperSelected,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.touchable}
      >
        {isSelected ? (
          <LinearGradient
            colors={[colors.primary[500], colors.primary[800]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, styles.cardSelected]}
          >
            {cardContent(true)}
          </LinearGradient>
        ) : (
          <View style={styles.card}>
            {cardContent(false)}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ServiceTypeStep({
  selectedCategory,
  error,
  onChange,
}: ServiceTypeStepProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🛠️</Text>
        <Text style={styles.title}>What do you need help with?</Text>
        <Text style={styles.subtitle}>Choose the type of service you're looking for</Text>
      </View>

      {/* Category grid — 4 rows × 2 flex:1 cards */}
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

      {/* Validation error */}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    textAlign: 'center',
  },

  // Grid layout
  grid: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Card wrapper (holds scale animation + glow shadow)
  cardWrapper: {
    flex: 1,
    borderRadius: borderRadius.xl,
  },
  cardWrapperSelected: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  touchable: {
    flex: 1,
    borderRadius: borderRadius.xl,
  },

  // Card surface (shared padding/radius, different bg)
  card: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    ...shadows.sm,
  },
  cardSelected: {
    borderWidth: 0,
  },

  // Icon circle
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconCircleSelected: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 26,
  },

  // Text
  cardLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    textAlign: 'center',
    marginBottom: 3,
  },
  cardLabelSelected: {
    color: colors.neutral[0],
  },
  cardDescription: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  cardDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.75)',
  },

  // Error
  error: {
    fontSize: typography.size.sm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: typography.weight.medium,
  },
});
