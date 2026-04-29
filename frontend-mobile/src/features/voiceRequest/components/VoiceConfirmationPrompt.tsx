import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MicrophoneIcon } from '../../../components/Icons';
import { borderRadius, colors, shadows, spacing, typography } from '../../../theme';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import {
  VoiceConfirmationIntent,
  VoiceConfirmationStage,
} from '../types/voice';

interface VoiceConfirmationPromptProps {
  stage: VoiceConfirmationStage;
  transcript: string;
  intent: VoiceConfirmationIntent;
  errorMessage: string | null;
  isDisabled: boolean;
  onMicPress: () => void;
}

function getStatusCopy(
  stage: VoiceConfirmationStage,
  intent: VoiceConfirmationIntent,
  isDisabled: boolean
) {
  if (isDisabled) {
    return {
      eyebrow: 'One more step',
      title: 'We still need a few details',
      body: 'You can add the missing details below, or speak the request again and include them.',
      status: 'More details needed',
    };
  }

  switch (stage) {
    case 'listening':
      return {
        eyebrow: 'Do you confirm?',
        title: 'Listening for confirmation',
        body: 'Say "confirm", "yes", "go ahead", "cancel", or "start over".',
        status: 'Listening now',
      };
    case 'processing':
      return {
        eyebrow: 'Do you confirm?',
        title: 'Checking your response',
        body: 'We are verifying whether you want to continue, cancel, or restart.',
        status: 'Processing response',
      };
    case 'resolved':
      if (intent === 'confirm') {
        return {
          eyebrow: 'Confirmed',
          title: 'Confirmation received',
          body: 'Your request is being submitted and we are opening the matching page.',
          status: 'Confirmed',
        };
      }

      if (intent === 'reject') {
        return {
          eyebrow: 'Not confirmed',
          title: 'Request kept in review',
          body: 'You can edit the details, speak again, or start over when you are ready.',
          status: 'Confirmation declined',
        };
      }

      if (intent === 'restart') {
        return {
          eyebrow: 'Restart requested',
          title: 'We will restart the voice request',
          body: 'You can now speak the request again from the beginning.',
          status: 'Restart requested',
        };
      }

      return {
        eyebrow: 'Try once more',
        title: 'We still need a clear confirmation',
        body: 'Please tap the mic again and say "confirm", "cancel", or "start over".',
        status: 'Confirmation unclear',
      };
    case 'error':
      return {
        eyebrow: 'Confirmation interrupted',
        title: 'We could not capture that confirmation',
        body: 'Please try again, or use the tap confirmation button below.',
        status: 'Confirmation interrupted',
      };
    case 'idle':
    default:
      return {
        eyebrow: 'Do you confirm?',
        title: 'Awaiting confirmation',
        body: 'Tap the mic and say "confirm" to continue, or "cancel" to stay here.',
        status: 'Ready for confirmation',
      };
  }
}

export default function VoiceConfirmationPrompt({
  stage,
  transcript,
  intent,
  errorMessage,
  isDisabled,
  onMicPress,
}: VoiceConfirmationPromptProps) {
  const reducedMotion = useReducedMotionPreference();
  const pulse = useRef(new Animated.Value(0)).current;
  const copy = useMemo(
    () => getStatusCopy(stage, intent, isDisabled),
    [intent, isDisabled, stage]
  );

  useEffect(() => {
    pulse.stopAnimation();
    pulse.setValue(0);

    if (reducedMotion || stage !== 'listening') {
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
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
  }, [pulse, reducedMotion, stage]);

  const ringScale = reducedMotion
    ? 1
    : pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.12],
      });

  const ringOpacity = reducedMotion
    ? 0.18
    : pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.22, 0.06],
      });

  return (
    <View style={styles.card}>
      <View style={styles.copyWrap}>
        <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.body}>{copy.body}</Text>
      </View>

      <View style={styles.micStage}>
        <Animated.View
          style={[
            styles.micRing,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />

        {isDisabled ? (
          <View style={styles.disabledBadge}>
            <Text style={styles.disabledBadgeText}>Add details or speak again</Text>
          </View>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Confirmation microphone"
            accessibilityHint="Starts or stops listening for a confirmation command."
            accessibilityState={{ disabled: false, busy: stage === 'processing' }}
            activeOpacity={0.9}
            disabled={stage === 'processing'}
            onPress={onMicPress}
            style={styles.micButton}
          >
            <LinearGradient
              colors={
                stage === 'listening'
                  ? [colors.accent.amber, colors.accent.gold]
                  : [colors.surface.base, colors.surface.muted]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.micFill}
            >
              <MicrophoneIcon
                size={22}
                color={colors.primary[800]}
              />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.metaWrap}>
        <Text style={styles.statusLabel}>{copy.status}</Text>
        {transcript.trim() ? (
          <Text style={styles.transcript}>Heard: "{transcript.trim()}"</Text>
        ) : null}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {!isDisabled ? (
          <Text style={styles.examples}>
            Try: "yes confirm", "confirm", "go ahead", "cancel", or "start over"
          </Text>
        ) : (
          <Text style={styles.examples}>
            If something is missing, use `Edit details` or `Speak again`.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.raised,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.card,
  },
  copyWrap: {
    gap: spacing.xs,
  },
  eyebrow: {
    ...typography.role.eyebrow,
    color: colors.primary[600],
  },
  title: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
  },
  body: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.neutral[700],
  },
  micStage: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 92,
  },
  micRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(232,178,78,0.34)',
    backgroundColor: 'rgba(232,178,78,0.08)',
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.mustard,
  },
  micButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledBadge: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.tint,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBadgeText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.primary[800],
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  micFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  metaWrap: {
    gap: spacing.xs,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.primary[700],
    fontWeight: typography.weight.semibold,
  },
  transcript: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  error: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.accent.coral,
    textAlign: 'center',
  },
  examples: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
