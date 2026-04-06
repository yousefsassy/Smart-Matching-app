import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { CheckCircleIcon } from '../Icons';

export type BudgetPreset = 'economy' | 'standard' | 'premium';

interface BudgetPresetConfig {
  key: BudgetPreset;
  label: string;
  description: string;
  range: string;
  emoji: string;
  accentColor: string;
}

const BUDGET_PRESETS: BudgetPresetConfig[] = [
  {
    key: 'economy',
    label: 'Economy',
    description: 'Budget-friendly service',
    range: '50 – 150 TND',
    emoji: '💰',
    accentColor: colors.accent.cyan,
  },
  {
    key: 'standard',
    label: 'Standard',
    description: 'Quality at a fair price',
    range: '150 – 400 TND',
    emoji: '⭐',
    accentColor: colors.primary[500],
  },
  {
    key: 'premium',
    label: 'Premium',
    description: 'Top-tier providers only',
    range: '400 – 800 TND',
    emoji: '💎',
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
  disabled,
  onPress,
}: {
  config: BudgetPresetConfig;
  isSelected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.presetCard,
          isSelected && { borderColor: config.accentColor, borderWidth: 2, backgroundColor: `${config.accentColor}10` },
          disabled && styles.presetCardDisabled,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={disabled ? 1 : 0.9}
        disabled={disabled}
      >
        <Text style={styles.presetEmoji}>{config.emoji}</Text>
        <View style={styles.presetInfo}>
          <Text style={[styles.presetLabel, isSelected && { color: config.accentColor }]}>
            {config.label}
          </Text>
          <Text style={styles.presetDescription}>{config.description}</Text>
        </View>
        <View style={styles.presetRight}>
          <Text style={[styles.presetRange, isSelected && { color: config.accentColor }]}>
            {config.range}
          </Text>
          {isSelected && (
            <CheckCircleIcon size={18} color={config.accentColor} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function BudgetStep({ data, onChange }: BudgetStepProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>💸</Text>
        <Text style={styles.title}>What's your budget?</Text>
        <Text style={styles.subtitle}>This is optional — you can skip and decide later</Text>
      </View>

      {/* Preset tier cards */}
      <View style={styles.presetsContainer}>
        {BUDGET_PRESETS.map((preset) => (
          <PresetCard
            key={preset.key}
            config={preset}
            isSelected={data.preset === preset.key}
            disabled={false}
            onPress={() => onChange('preset', data.preset === preset.key ? null : preset.key)}
          />
        ))}
      </View>

      {/* Skip note */}
      <View style={styles.skipNote}>
        <Text style={styles.skipNoteText}>
          💡 You can skip budget entirely — it won't affect your matches.
        </Text>
      </View>
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
  presetsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    padding: spacing.base,
    ...shadows.sm,
    gap: spacing.md,
  },
  presetCardDisabled: {
    opacity: 0.55,
  },
  presetEmoji: {
    fontSize: 28,
    width: 36,
    textAlign: 'center',
  },
  presetInfo: {
    flex: 1,
  },
  presetLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
    marginBottom: 2,
  },
  presetDescription: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
  },
  presetRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  presetRange: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[600],
  },
  skipNote: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  skipNoteText: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 18,
  },
});
