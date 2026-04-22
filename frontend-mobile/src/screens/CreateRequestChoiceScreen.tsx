import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeftIcon, EditIcon, MicrophoneIcon } from '../components/Icons';
import { HomeStackParamList } from '../navigation/MainTabs';
import { borderRadius, colors, shadows, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'CreateRequest'>;

interface ChoiceCardProps {
  title: string;
  description: string;
  eyebrow: string;
  accent: string;
  buttonTitle: string;
  icon: React.ReactNode;
  isDark?: boolean;
  onPress: () => void;
}

function ChoiceCard({
  title,
  description,
  eyebrow,
  accent,
  buttonTitle,
  icon,
  isDark = false,
  onPress,
}: ChoiceCardProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.92}
      onPress={onPress}
      style={[styles.choiceCard, isDark ? styles.choiceCardDark : styles.choiceCardLight]}
    >
      <View style={[styles.choiceIconWrap, isDark ? styles.choiceIconWrapDark : styles.choiceIconWrapLight]}>
        {icon}
      </View>

      <View style={styles.choiceHeader}>
        <View style={[styles.choiceEyebrowPill, { backgroundColor: accent }]}>
          <Text style={styles.choiceEyebrow}>{eyebrow}</Text>
        </View>
        <Text style={[styles.choiceTitle, isDark && styles.choiceTitleDark]}>{title}</Text>
        <Text style={[styles.choiceDescription, isDark && styles.choiceDescriptionDark]}>{description}</Text>
      </View>

      <View style={[styles.choiceCta, isDark ? styles.choiceCtaDark : styles.choiceCtaLight]}>
        <Text style={[styles.choiceCtaText, isDark && styles.choiceCtaTextDark]}>{buttonTitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CreateRequestChoiceScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 860;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces={false}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.82}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeftIcon size={18} color={colors.primary[800]} />
        </TouchableOpacity>

        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Choose how to start your request</Text>
          <Text style={styles.heroSubtitle}>Speak or fill the form manually.</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.bodyInner}>
          <View style={[styles.choiceLayout, isWideLayout && styles.choiceLayoutWide]}>
            <ChoiceCard
              title="Speak your request"
              description="Describe the issue by voice."
              eyebrow="Voice"
              accent="rgba(232,178,78,0.18)"
              buttonTitle="Start with voice"
              icon={<MicrophoneIcon size={28} color={colors.neutral[0]} />}
              isDark
              onPress={() =>
                navigation.navigate('VoiceRequest', {
                  source: 'create-request',
                })
              }
            />

            <ChoiceCard
              title="Fill request manually"
              description="Complete the request in the form."
              eyebrow="Manual"
              accent="rgba(21,122,115,0.12)"
              buttonTitle="Open form"
              icon={<EditIcon size={28} color={colors.primary[700]} />}
              onPress={() => navigation.navigate('ManualRequest')}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.base,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.raised,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.card,
  },
  heroCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  heroTitle: {
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral[600],
  },
  body: {
    flex: 1,
  },
  bodyInner: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    gap: spacing.lg,
    flex: 1,
    justifyContent: 'center',
  },
  choiceLayout: {
    gap: spacing.lg,
  },
  choiceLayoutWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  choiceCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 220,
    borderRadius: 28,
    padding: spacing.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  choiceCardDark: {
    backgroundColor: colors.primary[800],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    ...shadows.card,
  },
  choiceCardLight: {
    backgroundColor: colors.surface.raised,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.card,
  },
  choiceIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceIconWrapDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  choiceIconWrapLight: {
    backgroundColor: colors.surface.tint,
  },
  choiceHeader: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  choiceEyebrowPill: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  choiceEyebrow: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.primary[800],
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.2,
  },
  choiceTitle: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.3,
  },
  choiceTitleDark: {
    color: colors.neutral[0],
  },
  choiceDescription: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral[700],
  },
  choiceDescriptionDark: {
    color: 'rgba(255,255,255,0.8)',
  },
  choiceCta: {
    minHeight: 48,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  choiceCtaDark: {
    backgroundColor: colors.accent.amber,
  },
  choiceCtaLight: {
    backgroundColor: colors.primary[900],
  },
  choiceCtaText: {
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  choiceCtaTextDark: {
    color: colors.primary[900],
  },
});
