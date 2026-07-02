import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { profileService } from '../services/profile';
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
  ChevronRightIcon,
  CheckIcon,
} from '../components/Icons';
import Avatar from '../components/Avatar';
import { TUNISIA_GOVERNORATES } from '../constants/tunisiaGovernorates';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  governorate: string;
}

function buildProfileFromUser(user: ReturnType<typeof useAuth>['user']): ProfileData {
  return {
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    governorate: user?.governorate || '',
  };
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
    backgroundColor: colors.surface.base,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[100],
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
    ...typography.role.eyebrow,
    color: colors.primary[400],
    marginBottom: 1,
  },
  title: {
    ...typography.role.cardTitle,
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
  const [governorateModalVisible, setGovernorateModalVisible] = useState(false);

  const [profile, setProfile] = useState<ProfileData>(buildProfileFromUser(user));

  const isClient = user?.role === 'client';

  useEffect(() => {
    setProfile(buildProfileFromUser(user));
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      setAvatarUri(null);
      return;
    }

    if (user.avatar) {
      setAvatarUri(user.avatar);
    }

    profileService.getAvatar(user.id).then((uri) => {
      if (uri) {
        setAvatarUri(uri);
      }
    });
  }, [user?.avatar, user?.id]);

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
      if (user?.id) {
        const savedUri = await profileService.saveAvatar(user.id, uri);
        if (savedUri) {
          setAvatarUri(savedUri);
          await updateUser({ avatar: savedUri });
        }
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateUser({
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        governorate: profile.governorate,
      });
      Alert.alert('Success', 'Your profile has been updated!');
      setIsEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      setProfile(buildProfileFromUser(user));
      setGovernorateModalVisible(false);
    }

    setIsEditing((current) => !current);
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
          colors={colors.gradients.header as [string, string, string]}
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
            onPress={toggleEditMode}
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
            <View style={styles.governorateFieldWrap}>
              <Text style={styles.governorateLabel}>Location</Text>
              <TouchableOpacity
                style={[
                  styles.governorateField,
                  !isEditing && styles.governorateFieldDisabled,
                ]}
                onPress={() => {
                  if (isEditing) {
                    setGovernorateModalVisible(true);
                  }
                }}
                activeOpacity={isEditing ? 0.82 : 1}
              >
                <View style={styles.governorateIconWrap}>
                  <MapPinIcon size={18} color={colors.primary[600]} />
                </View>
                <View style={styles.governorateCopy}>
                  <Text
                    style={[
                      styles.governorateValue,
                      !profile.governorate && styles.governoratePlaceholder,
                    ]}
                  >
                    {profile.governorate || 'Select your location'}
                  </Text>
                  <Text style={styles.governorateHint}>
                    {isEditing
                      ? 'Choose your location from the Tunisia list'
                      : 'Saved profile location'}
                  </Text>
                </View>
                <ChevronRightIcon
                  size={18}
                  color={isEditing ? colors.neutral[400] : colors.neutral[300]}
                />
              </TouchableOpacity>
            </View>
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

      <Modal
        visible={governorateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGovernorateModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setGovernorateModalVisible(false)}
        >
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select location</Text>
            <Text style={styles.modalSubtitle}>Tunisia regions</Text>

            <ScrollView
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalListContent}
            >
              {TUNISIA_GOVERNORATES.map((governorate) => {
                const isSelected = profile.governorate === governorate;
                return (
                  <TouchableOpacity
                    key={governorate}
                    style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                    onPress={() => {
                      setProfile((current) => ({ ...current, governorate }));
                      setGovernorateModalVisible(false);
                    }}
                    activeOpacity={0.82}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        isSelected && styles.modalOptionTextSelected,
                      ]}
                    >
                      {governorate}
                    </Text>
                    {isSelected ? <CheckIcon size={16} color={colors.primary[600]} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
    backgroundColor: 'rgba(34, 92, 146, 0.18)',
    top: -50,
    right: -50,
  },
  avatarRing: {
    borderWidth: 3,
    borderColor: colors.overlay.borderStrong,
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
    ...typography.role.heroTitle,
    color: colors.neutral[0],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.overlay.glassSoft,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.overlay.border,
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rolePillText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: 'rgba(255,255,255,0.88)',
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
    backgroundColor: colors.surface.base,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
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
  governorateFieldWrap: {
    gap: 6,
  },
  governorateLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[700],
  },
  governorateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.surface.raised,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  governorateFieldDisabled: {
    opacity: 0.9,
  },
  governorateIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  governorateCopy: {
    flex: 1,
  },
  governorateValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
  },
  governoratePlaceholder: {
    color: colors.neutral[400],
  },
  governorateHint: {
    marginTop: 2,
    fontSize: typography.size.sm,
    color: colors.neutral[500],
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,11,19,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
    maxHeight: '72%',
  },
  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[200],
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  modalList: {
    flexGrow: 0,
  },
  modalListContent: {
    gap: spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    backgroundColor: colors.surface.base,
  },
  modalOptionSelected: {
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
  },
  modalOptionText: {
    fontSize: typography.size.base,
    color: colors.neutral[800],
    fontWeight: typography.weight.medium,
  },
  modalOptionTextSelected: {
    color: colors.primary[700],
    fontWeight: typography.weight.bold,
  },
});
