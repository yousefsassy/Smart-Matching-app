import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import {
  UserIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  LogOutIcon,
  EditIcon,
  XIcon,
  CameraIcon,
} from '../components/Icons';
import Avatar from '../components/Avatar';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
}

// ── Section card ───────────────────────────────────────────────────────────────

function SectionCard({
  eyebrow,
  title,
  iconBg,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  iconBg: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.wrapper}>
      <View style={sectionStyles.header}>
        <View style={[sectionStyles.iconWrap, { backgroundColor: iconBg }]}>
          {icon}
        </View>
        <View>
          <Text style={sectionStyles.eyebrow}>{eyebrow}</Text>
          <Text style={sectionStyles.title}>{title}</Text>
        </View>
      </View>
      <View style={sectionStyles.body}>{children}</View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.base,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: typography.size.xs - 1,
    fontWeight: typography.weight.bold,
    color: colors.primary[400],
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
  },
  body: {
    padding: spacing.base,
  },
});

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    location: '',
  });

  const isClient = user?.role === 'client';

  // Load persisted avatar on mount
  const AVATAR_KEY = `@tawtaw_avatar_${user?.id || 'user'}`;

  useEffect(() => {
    AsyncStorage.getItem(AVATAR_KEY).then((uri) => {
      if (uri) setAvatarUri(uri);
    });
  }, [AVATAR_KEY]);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to set a profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await AsyncStorage.setItem(AVATAR_KEY, uri);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateUser({ fullName: profile.fullName, email: profile.email });
      Alert.alert('Success', 'Your profile has been updated!');
      setIsEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: async () => { await logout(); } },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing['5xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Gradient Hero Header ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#0A2744', '#134686', '#1a5699']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
        >
          <View style={styles.heroGlowCircle} />

          {/* Avatar + camera overlay */}
          <TouchableOpacity
            style={styles.avatarRing}
            onPress={handlePickAvatar}
            activeOpacity={0.85}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Avatar
                name={profile.fullName || user?.fullName || ''}
                size="xl"
                role={isClient ? 'client' : 'provider'}
              />
            )}
            <View style={styles.cameraOverlay}>
              <CameraIcon size={14} color={colors.neutral[0]} />
            </View>
          </TouchableOpacity>

          <Text style={styles.heroName}>{profile.fullName || user?.fullName}</Text>
          <View style={styles.rolePill}>
            <View style={[styles.roleDot, { backgroundColor: isClient ? colors.accent.mustard : colors.accent.cyan }]} />
            <Text style={styles.rolePillText}>{isClient ? 'Client' : 'Service Provider'}</Text>
          </View>
        </LinearGradient>

        {/* ── Edit button ───────────────────────────────────────────────────────── */}
        <View style={styles.editButtonRow}>
          <TouchableOpacity
            style={[styles.editButton, isEditing && styles.editButtonActive]}
            onPress={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <XIcon size={16} color={colors.error} />
                <Text style={[styles.editButtonText, { color: colors.error }]}>Cancel</Text>
              </>
            ) : (
              <>
                <EditIcon size={16} color={colors.primary[600]} />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Personal Info ─────────────────────────────────────────────────────── */}
        <View style={styles.content}>
          <SectionCard
            eyebrow="PERSONAL"
            title="Personal Information"
            iconBg={colors.primary[50]}
            icon={<UserIcon size={18} color={colors.primary[600]} />}
          >
            <Input
              label="Full Name"
              value={profile.fullName}
              onChangeText={(text) => setProfile({ ...profile, fullName: text })}
              icon={<UserIcon size={18} color={colors.neutral[400]} />}
              editable={isEditing}
              containerStyle={styles.inputContainer}
            />
            <Input
              label="Email"
              value={profile.email}
              onChangeText={(text) => setProfile({ ...profile, email: text })}
              icon={<MailIcon size={18} color={colors.neutral[400]} />}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={isEditing}
              containerStyle={styles.inputContainer}
            />
            <Input
              label="Phone"
              value={profile.phone}
              onChangeText={(text) => setProfile({ ...profile, phone: text })}
              icon={<PhoneIcon size={18} color={colors.neutral[400]} />}
              keyboardType="phone-pad"
              editable={isEditing}
              containerStyle={styles.inputContainer}
            />
            <Input
              label="Location"
              value={profile.location}
              onChangeText={(text) => setProfile({ ...profile, location: text })}
              icon={<MapPinIcon size={18} color={colors.neutral[400]} />}
              editable={isEditing}
            />
          </SectionCard>

          {/* Save */}
          {isEditing && (
            <PrimaryButton title="Save Changes" onPress={handleSaveProfile} style={styles.saveBtn} />
          )}

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOutIcon size={18} color={colors.error} />
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },

  // Hero
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  heroGlowCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(38, 96, 175, 0.22)',
    top: -50,
    right: -50,
  },
  avatarRing: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: borderRadius.full,
    padding: 3,
    marginBottom: spacing.md,
    position: 'relative',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral[0],
  },
  heroName: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.sm,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rolePillText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: 'rgba(255,255,255,0.9)',
  },

  // Edit button row
  editButtonRow: {
    alignItems: 'center',
    marginTop: -spacing.base,
    marginBottom: spacing.lg,
    zIndex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.primary[100],
    ...shadows.md,
  },
  editButtonActive: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  editButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary[600],
  },

  // Content
  content: {
    paddingHorizontal: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },

  // Save + Logout
  saveBtn: {
    marginBottom: spacing.base,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
    paddingVertical: spacing.base,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.error,
    gap: spacing.sm,
    marginTop: spacing.sm,
    ...shadows.card,
  },
  logoutBtnText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.error,
  },
});
