import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { CheckCircleIcon } from '../Icons';

export type BudgetPreset = 'economy' | 'standard' | 'premium';

interface BudgetPresetConfig {
  key: BudgetPreset;
  label: string;
  description: string;
  range: string;
  accentColor: string;
}

const BUDGET_PRESETS: BudgetPresetConfig[] = [
  {
    key: 'economy',
    label: 'Economy',
    description: 'Lower range',
    range: '50 – 150 TND',
    accentColor: colors.accent.cyan,
  },
  {
    key: 'standard',
    label: 'Standard',
    description: 'Balanced range',
    range: '150 – 400 TND',
    accentColor: colors.primary[500],
  },
  {
    key: 'premium',
    label: 'Premium',
    description: 'Higher range',
    range: '400 – 800 TND',
    accentColor: colors.accent.gold,
  },
];

export interface BudgetData {
  preset: BudgetPreset | null;
}

interface BudgetStepProps {
  data: BudgetData;
  onChange: (field: keyof BudgetData, value: BudgetPreset | null) => void;
}

function PresetCard({
  config,
  isSelected,
  onPress,
}: {
  config: BudgetPresetConfig;
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
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && {
            borderColor: config.accentColor,
            backgroundColor: `${config.accentColor}10`,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.92}
        onPressIn={() => animateTo(0.985)}
        onPressOut={() => animateTo(1)}
      >
        <View style={styles.cardCopy}>
          <Text style={[styles.cardLabel, isSelected && { color: config.accentColor }]}>
            {config.label}
          </Text>
          <Text style={styles.cardDescription}>{config.description}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.cardRange, isSelected && { color: config.accentColor }]}>
            {config.range}
          </Text>
          {isSelected ? <CheckCircleIcon size={18} color={config.accentColor} /> : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function BudgetStep({ data, onChange }: BudgetStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget</Text>
        <Text style={styles.subtitle}>Optional. You can skip this.</Text>
      </View>

      <View style={styles.presetsContainer}>
        {BUDGET_PRESETS.map((preset) => (
          <PresetCard
            key={preset.key}
            config={preset}
            isSelected={data.preset === preset.key}
            onPress={() => onChange('preset', data.preset === preset.key ? null : preset.key)}
          />
        ))}
      </View>
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
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.role.sectionTitle,
    color: colors.primary[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },
  presetsContainer: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.surface.base,
  },
  cardCopy: {
    flex: 1,
  },
  cardLabel: {
    fontSize: typography.size.base,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  cardRange: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
    fontWeight: typography.weight.semibold,
  },
});
