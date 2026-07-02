import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Animated,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, animations } from '../theme';
import { AuthStackParamList } from '../navigation/AuthStack';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  BriefcaseIcon,
  TawTawMarkIcon,
} from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

function RoleCard({
  title,
  subtitle,
  icon,
  accent,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      ...animations.spring.snappy,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        onPressIn={() => animateTo(0.99)}
        onPressOut={() => animateTo(1)}
        style={styles.roleCard}
      >
        <View style={[styles.roleIcon, { backgroundColor: accent }]}>{icon}</View>
        <View style={styles.roleCopy}>
          <Text style={styles.roleTitle}>{title}</Text>
          <Text style={styles.roleSubtitle}>{subtitle}</Text>
        </View>
        <ChevronRightIcon size={16} color={colors.primary[700]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SignUpGateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require('../../assets/welcome-hero.png')}
      style={styles.root}
      resizeMode="cover"
      fadeDuration={0}
    >
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['rgba(5,11,19,0.24)', 'rgba(5,11,19,0.76)', 'rgba(5,11,19,0.94)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.base, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.82}>
            <ChevronLeftIcon size={20} color={colors.neutral[0]} />
          </TouchableOpacity>
          <View style={styles.brandChip}>
            <TawTawMarkIcon size={20} />
            <Text style={styles.brandChipText}>TAWTAW</Text>
          </View>
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>How will you use TawTaw?</Text>
          <Text style={styles.heroSubtitle}>Choose one role to continue.</Text>
        </View>

        <View style={styles.roleStage}>
          <RoleCard
            title="Client"
            subtitle="Request a service"
            accent={colors.surface.tint}
            icon={<UserIcon size={22} color={colors.primary[900]} />}
            onPress={() => navigation.navigate('ClientSignup')}
          />
          <RoleCard
            title="Provider"
            subtitle="Offer a service"
            accent={colors.accent.amberLight}
            icon={<BriefcaseIcon size={22} color={colors.primary[900]} />}
            onPress={() => navigation.navigate('ProviderSignup')}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.82}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary[900],
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  brandChipText: {
    ...typography.role.eyebrow,
    color: colors.neutral[0],
  },
  heroCopy: {
    marginBottom: spacing['3xl'],
  },
  heroTitle: {
    ...typography.role.heroTitle,
    color: colors.neutral[0],
    marginBottom: spacing.sm,
    maxWidth: 280,
  },
  heroSubtitle: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.72)',
  },
  roleStage: {
    gap: spacing.md,
    marginBottom: spacing['3xl'],
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 26,
    backgroundColor: colors.surface.raised,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  roleIcon: {
    width: 46,
    height: 46,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleCopy: {
    flex: 1,
  },
  roleTitle: {
    fontSize: typography.size.base,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
    marginBottom: 2,
  },
  roleSubtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.62)',
  },
  footerLink: {
    fontSize: typography.size.base,
    color: colors.accent.amber,
    fontWeight: typography.weight.bold,
  },
});
