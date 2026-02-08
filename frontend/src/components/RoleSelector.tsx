import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { UserIcon, BriefcaseIcon } from './Icons';
import { UserRole } from '../context/AuthContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface RoleSelectorProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export default function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  const clientScale = useRef(new Animated.Value(selectedRole === 'client' ? 1 : 0.95)).current;
  const providerScale = useRef(new Animated.Value(selectedRole === 'provider' ? 1 : 0.95)).current;

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    Animated.parallel([
      Animated.spring(clientScale, {
        toValue: selectedRole === 'client' ? 1 : 0.95,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }),
      Animated.spring(providerScale, {
        toValue: selectedRole === 'provider' ? 1 : 0.95,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }),
    ]).start();
  }, [selectedRole]);

  const handleSelect = (role: UserRole) => {
    onSelectRole(role);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>I am a:</Text>
      <View style={styles.optionsContainer}>
        <Animated.View style={[styles.optionWrapper, { transform: [{ scale: clientScale }] }]}>
          <TouchableOpacity
            onPress={() => handleSelect('client')}
            activeOpacity={0.9}
            style={styles.touchable}
          >
            {selectedRole === 'client' ? (
              <LinearGradient
                colors={[colors.primary[500], colors.primary[700]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.option, styles.selectedOption]}
              >
                <View style={styles.iconContainerSelected}>
                  <UserIcon size={24} color={colors.neutral[0]} />
                </View>
                <Text style={[styles.optionTitle, styles.selectedText]}>Client</Text>
                <Text style={[styles.optionSubtitle, styles.selectedSubtext]}>
                  Looking for services
                </Text>
              </LinearGradient>
            ) : (
              <View style={styles.option}>
                <View style={styles.iconContainer}>
                  <UserIcon size={24} color={colors.primary[600]} />
                </View>
                <Text style={styles.optionTitle}>Client</Text>
                <Text style={styles.optionSubtitle}>Looking for services</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.optionWrapper, { transform: [{ scale: providerScale }] }]}>
          <TouchableOpacity
            onPress={() => handleSelect('provider')}
            activeOpacity={0.9}
            style={styles.touchable}
          >
            {selectedRole === 'provider' ? (
              <LinearGradient
                colors={[colors.primary[500], colors.primary[700]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.option, styles.selectedOption]}
              >
                <View style={styles.iconContainerSelected}>
                  <BriefcaseIcon size={24} color={colors.neutral[0]} />
                </View>
                <Text style={[styles.optionTitle, styles.selectedText]}>Provider</Text>
                <Text style={[styles.optionSubtitle, styles.selectedSubtext]}>
                  Offering services
                </Text>
              </LinearGradient>
            ) : (
              <View style={styles.option}>
                <View style={styles.iconContainer}>
                  <BriefcaseIcon size={24} color={colors.primary[600]} />
                </View>
                <Text style={styles.optionTitle}>Provider</Text>
                <Text style={styles.optionSubtitle}>Offering services</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[700],
    marginBottom: spacing.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  optionWrapper: {
    flex: 1,
  },
  touchable: {
    width: '100%',
  },
  option: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  selectedOption: {
    borderWidth: 0,
    ...shadows.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainerSelected: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  optionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
    marginBottom: 2,
  },
  selectedText: {
    color: colors.neutral[0],
  },
  optionSubtitle: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  selectedSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});