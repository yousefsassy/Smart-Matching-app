import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircleIcon,
  MicrophoneIcon,
  SparkleIcon,
  XCircleIcon,
} from '../../../components/Icons';
import { borderRadius, colors, shadows, spacing, typography } from '../../../theme';
import { VoiceVisualTone } from '../types/voice';

interface VoiceHaloProps {
  tone: VoiceVisualTone;
  label: string;
  statusLabel: string;
  accessibilityHint?: string;
  onPress?: () => void;
  disabled?: boolean;
  reducedMotion?: boolean;
}

const TONE_STYLES: Record<
  VoiceVisualTone,
  {
    gradient: [string, string];
    borderColor: string;
    ringColor: string;
    iconColor: string;
    labelColor: string;
  }
> = {
  resting: {
    gradient: ['#FFF6EA', '#F2E7D8'],
    borderColor: 'rgba(232,178,78,0.36)',
    ringColor: 'rgba(232,178,78,0.22)',
    iconColor: colors.primary[800],
    labelColor: colors.neutral[0],
  },
  listening: {
    gradient: ['#FFF5DA', '#F6DDA7'],
    borderColor: 'rgba(232,178,78,0.62)',
    ringColor: 'rgba(232,178,78,0.32)',
    iconColor: colors.primary[900],
    labelColor: colors.neutral[0],
  },
  processing: {
    gradient: ['#F3F6FA', '#DDE7F3'],
    borderColor: 'rgba(21,122,115,0.38)',
    ringColor: 'rgba(21,122,115,0.24)',
    iconColor: colors.primary[800],
    labelColor: colors.neutral[0],
  },
  review: {
    gradient: ['#FFF9EE', '#ECE3D5'],
    borderColor: 'rgba(255,255,255,0.18)',
    ringColor: 'rgba(255,255,255,0.12)',
    iconColor: colors.primary[800],
    labelColor: colors.neutral[0],
  },
  success: {
    gradient: ['#EAF8F2', '#D9F1E7'],
    borderColor: 'rgba(16,185,129,0.36)',
    ringColor: 'rgba(16,185,129,0.22)',
    iconColor: colors.accent.cyan,
    labelColor: colors.neutral[0],
  },
  error: {
    gradient: ['#FAECE7', '#F2D8D0'],
    borderColor: 'rgba(199,102,77,0.34)',
    ringColor: 'rgba(199,102,77,0.24)',
    iconColor: colors.accent.coral,
    labelColor: colors.neutral[0],
  },
};

function getDuration(tone: VoiceVisualTone) {
  switch (tone) {
    case 'listening':
      return 1800;
    case 'processing':
      return 2400;
    case 'resting':
      return 3200;
    default:
      return 0;
  }
}

function renderToneIcon(tone: VoiceVisualTone, color: string) {
  switch (tone) {
    case 'processing':
    case 'review':
      return <SparkleIcon size={42} color={color} />;
    case 'success':
      return <CheckCircleIcon size={44} color={color} />;
    case 'error':
      return <XCircleIcon size={42} color={color} />;
    case 'resting':
    case 'listening':
    default:
      return <MicrophoneIcon size={42} color={color} />;
  }
}

export default function VoiceHalo({
  tone,
  label,
  statusLabel,
  accessibilityHint,
  onPress,
  disabled = false,
  reducedMotion = false,
}: VoiceHaloProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const theme = TONE_STYLES[tone];
  const isPressable = Boolean(onPress) && !disabled;

  useEffect(() => {
    pulse.stopAnimation();
    pulse.setValue(0);

    const duration = getDuration(tone);
    if (reducedMotion || duration === 0) {
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
      pulse.stopAnimation();
    };
  }, [pulse, reducedMotion, tone]);

  const outerScale = reducedMotion
    ? 1
    : pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.96, 1.08],
      });

  const outerOpacity = reducedMotion
    ? 0.12
    : pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.18, 0.05],
      });

  const innerScale = reducedMotion
    ? 1
    : pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.03],
      });

  return (
    <View style={styles.container}>
      <View style={styles.orbStage}>
        <Animated.View
          style={[
            styles.ring,
            styles.ringOuter,
            {
              borderColor: theme.ringColor,
              opacity: outerOpacity,
              transform: [{ scale: outerScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            styles.ringInner,
            {
              borderColor: theme.borderColor,
              transform: [{ scale: innerScale }],
            },
          ]}
        />
        <Animated.View style={{ transform: [{ scale: innerScale }] }}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint={accessibilityHint}
            accessibilityState={{ disabled, busy: tone === 'processing' }}
            activeOpacity={0.92}
            disabled={!isPressable}
            onPress={onPress}
            style={[styles.touchable, !isPressable && styles.touchableStatic]}
          >
            <LinearGradient
              colors={theme.gradient}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={[
                styles.core,
                {
                  borderColor: theme.borderColor,
                  shadowColor: theme.ringColor,
                },
              ]}
            >
              <View style={styles.iconWrap}>{renderToneIcon(tone, theme.iconColor)}</View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color: theme.labelColor }]}>{label}</Text>
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  orbStage: {
    width: 248,
    height: 248,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  ringOuter: {
    width: 232,
    height: 232,
  },
  ringInner: {
    width: 200,
    height: 200,
  },
  touchable: {
    borderRadius: borderRadius.full,
  },
  touchableStatic: {
    opacity: 0.98,
  },
  core: {
    width: 168,
    height: 168,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    ...shadows.xl,
  },
  iconWrap: {
    width: 108,
    height: 108,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    gap: spacing.xs,
    alignItems: 'center',
  },
  label: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
  statusText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
  },
});
