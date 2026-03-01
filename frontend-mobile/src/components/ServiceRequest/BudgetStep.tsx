import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { TagIcon, CheckCircleIcon } from '../Icons';
import ToggleSwitch from '../ToggleSwitch';
import Input from '../Input';

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
  isFlexible: boolean;
  customMin: string;
  customMax: string;
}

interface BudgetStepProps {
  data: BudgetData;
  onChange: (field: keyof BudgetData, value: BudgetPreset | boolean | string | null) => void;
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
  const presetsOpacity = useRef(new Animated.Value(data.isFlexible ? 0.4 : 1)).current;
  const [showCustom, setShowCustom] = React.useState(false);

  const handleFlexibleToggle = (value: boolean) => {
    onChange('isFlexible', value);
    Animated.timing(presetsOpacity, {
      toValue: value ? 0.4 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    if (value) {
      onChange('preset', null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>💸</Text>
        <Text style={styles.title}>What's your budget?</Text>
        <Text style={styles.subtitle}>This is optional — you can skip and decide later</Text>
      </View>

      {/* Flexible toggle */}
      <View style={styles.flexibleRow}>
        <View style={styles.flexibleLeft}>
          <Text style={styles.flexibleTitle}>I'm flexible on budget</Text>
          <Text style={styles.flexibleSubtitle}>Let providers suggest their rates</Text>
        </View>
        <ToggleSwitch
          value={data.isFlexible}
          onValueChange={handleFlexibleToggle}
        />
      </View>

      {/* Preset tier cards */}
      <Animated.View style={{ opacity: presetsOpacity }}>
        <View style={styles.presetsContainer}>
          {BUDGET_PRESETS.map((preset) => (
            <PresetCard
              key={preset.key}
              config={preset}
              isSelected={data.preset === preset.key}
              disabled={data.isFlexible}
              onPress={() => onChange('preset', data.preset === preset.key ? null : preset.key)}
            />
          ))}
        </View>
      </Animated.View>

      {/* Custom range (collapsible) */}
      {!data.isFlexible && (
        <TouchableOpacity
          style={styles.customToggle}
          onPress={() => setShowCustom(!showCustom)}
          activeOpacity={0.7}
        >
          <TagIcon size={14} color={colors.primary[500]} />
          <Text style={styles.customToggleText}>
            {showCustom ? 'Hide custom range' : 'Set a custom range instead'}
          </Text>
        </TouchableOpacity>
      )}

      {showCustom && !data.isFlexible && (
        <View style={styles.customInputsRow}>
          <View style={styles.customInput}>
            <Input
              label="Min (TND)"
              value={data.customMin}
              onChangeText={(v) => onChange('customMin', v)}
              placeholder="e.g. 100"
              keyboardType="numeric"
              icon={<TagIcon size={18} color={colors.neutral[400]} />}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
          <Text style={styles.customDivider}>–</Text>
          <View style={styles.customInput}>
            <Input
              label="Max (TND)"
              value={data.customMax}
              onChangeText={(v) => onChange('customMax', v)}
              placeholder="e.g. 300"
              keyboardType="numeric"
              icon={<TagIcon size={18} color={colors.neutral[400]} />}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
        </View>
      )}

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
  flexibleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  flexibleLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  flexibleTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
    marginBottom: 2,
  },
  flexibleSubtitle: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
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
    opacity: 0.5,
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
  customToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  customToggleText: {
    fontSize: typography.size.sm,
    color: colors.primary[500],
    fontWeight: typography.weight.medium,
  },
  customInputsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  customInput: {
    flex: 1,
  },
  customDivider: {
    fontSize: typography.size.lg,
    color: colors.neutral[400],
    fontWeight: typography.weight.medium,
    paddingBottom: spacing.md,
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
