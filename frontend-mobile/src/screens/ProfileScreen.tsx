import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput as RNTextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import ToggleSwitch from '../components/ToggleSwitch';
import {
  UserIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TagIcon,
  BriefcaseIcon,
  LogOutIcon,
  EditIcon,
  XIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  HeartIcon,
  SparkleIcon,
} from '../components/Icons';
import Avatar from '../components/Avatar';
import Chip from '../components/Chip';

interface ClientProfileData {
  fullName: string;
  email: string;
  location: string;
  preferences: string[];
}

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface ProviderProfileData {
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
  serviceCategories: string[];
  serviceRadius: string;
  availabilitySlots: TimeSlot[];
  isAvailable: boolean;
}

// ── Section card header component ──────────────────────────────────────────────

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

// ── Main Screen ─────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [newPreference, setNewPreference] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const [clientProfile, setClientProfile] = useState<ClientProfileData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    location: 'San Francisco, CA',
    preferences: ['Web Development', 'Marketing', 'Design'],
  });

  const [providerProfile, setProviderProfile] = useState<ProviderProfileData>({
    businessName: user?.businessName || '',
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    serviceCategories: ['Business Consulting', 'Strategy', 'Growth'],
    serviceRadius: '25',
    availabilitySlots: [
      { id: '1', day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { id: '2', day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
    ],
    isAvailable: true,
  });

  const [newSlotDay, setNewSlotDay] = useState('Monday');
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('17:00');

  const handleSaveProfile = async () => {
    try {
      if (user?.role === 'client') {
        await updateUser({ fullName: clientProfile.fullName, email: clientProfile.email });
        Alert.alert('Success', 'Your profile has been updated!');
      } else {
        await updateUser({
          fullName: providerProfile.fullName,
          email: providerProfile.email,
          businessName: providerProfile.businessName,
        });
        Alert.alert('Success', 'Your profile has been updated!');
      }
      setIsEditing(false);
    } catch (error) {
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

  const addPreference = () => {
    if (newPreference.trim()) {
      setClientProfile({ ...clientProfile, preferences: [...clientProfile.preferences, newPreference.trim()] });
      setNewPreference('');
    }
  };

  const removePreference = (index: number) => {
    setClientProfile({ ...clientProfile, preferences: clientProfile.preferences.filter((_, i) => i !== index) });
  };

  const addCategory = () => {
    if (newCategory.trim()) {
      setProviderProfile({ ...providerProfile, serviceCategories: [...providerProfile.serviceCategories, newCategory.trim()] });
      setNewCategory('');
    }
  };

  const removeCategory = (index: number) => {
    setProviderProfile({ ...providerProfile, serviceCategories: providerProfile.serviceCategories.filter((_, i) => i !== index) });
  };

  const addTimeSlot = () => {
    if (newSlotDay && newSlotStart && newSlotEnd) {
      const newSlot: TimeSlot = { id: Date.now().toString(), day: newSlotDay, startTime: newSlotStart, endTime: newSlotEnd };
      setProviderProfile({ ...providerProfile, availabilitySlots: [...providerProfile.availabilitySlots, newSlot] });
      setNewSlotDay('Monday');
      setNewSlotStart('09:00');
      setNewSlotEnd('17:00');
    }
  };

  const removeTimeSlot = (id: string) => {
    setProviderProfile({ ...providerProfile, availabilitySlots: providerProfile.availabilitySlots.filter((slot) => slot.id !== id) });
  };

  const isClient = user?.role === 'client';
  const displayName = isClient
    ? clientProfile.fullName
    : (providerProfile.businessName || providerProfile.fullName);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing['5xl'] }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Gradient Hero Header ────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#0A2744', '#134686', '#1a5699']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
        >
          <View style={styles.heroGlowCircle} />

          {/* Avatar + name + role */}
          <View style={styles.avatarRing}>
            <Avatar
              name={isClient ? (clientProfile.fullName || user?.fullName || '') : (providerProfile.fullName || user?.fullName || '')}
              size="xl"
              role={isClient ? 'client' : 'provider'}
            />
          </View>
          <Text style={styles.heroName}>{displayName}</Text>
          <View style={styles.rolePill}>
            <View style={[styles.roleDot, { backgroundColor: isClient ? colors.accent.mustard : colors.accent.cyan }]} />
            <Text style={styles.rolePillText}>{isClient ? 'Client' : 'Service Provider'}</Text>
          </View>
        </LinearGradient>

        {/* ── Edit button (below hero, above sections) ──────────────────────── */}
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

        <View style={styles.content}>
          {isClient ? (
            <>
              {/* Personal Info */}
              <SectionCard
                eyebrow="PERSONAL"
                title="Personal Information"
                iconBg={colors.primary[50]}
                icon={<UserIcon size={18} color={colors.primary[600]} />}
              >
                <Input
                  label="Full Name"
                  value={clientProfile.fullName}
                  onChangeText={(text) => setClientProfile({ ...clientProfile, fullName: text })}
                  icon={<UserIcon size={18} color={colors.neutral[400]} />}
                  editable={isEditing}
                  containerStyle={styles.inputContainer}
                />
                <Input
                  label="Email"
                  value={clientProfile.email}
                  onChangeText={(text) => setClientProfile({ ...clientProfile, email: text })}
                  icon={<MailIcon size={18} color={colors.neutral[400]} />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={isEditing}
                  containerStyle={styles.inputContainer}
                />
                <Input
                  label="Location"
                  value={clientProfile.location}
                  onChangeText={(text) => setClientProfile({ ...clientProfile, location: text })}
                  icon={<MapPinIcon size={18} color={colors.neutral[400]} />}
                  editable={isEditing}
                />
              </SectionCard>

              {/* Preferences */}
              <SectionCard
                eyebrow="SERVICES"
                title="Service Preferences"
                iconBg={colors.accent.mustardLight}
                icon={<TagIcon size={18} color={colors.accent.mustard} />}
              >
                <View style={styles.chipsContainer}>
                  {clientProfile.preferences.map((pref, index) => (
                    <Chip
                      key={index}
                      label={pref}
                      variant="primary"
                      selected
                      onRemove={isEditing ? () => removePreference(index) : undefined}
                    />
                  ))}
                </View>
                {isEditing && (
                  <View style={styles.addChipRow}>
                    <RNTextInput
                      style={styles.addInput}
                      placeholder="Add preference..."
                      value={newPreference}
                      onChangeText={setNewPreference}
                      placeholderTextColor={colors.neutral[400]}
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={addPreference}>
                      <Text style={styles.addBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </SectionCard>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: colors.primary[50] }]}>
                    <HeartIcon size={16} color={colors.primary[600]} />
                  </View>
                  <Text style={styles.statValue}>8</Text>
                  <Text style={styles.statLabel}>Saved</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: colors.accent.goldLight }]}>
                    <ClockIcon size={16} color={colors.accent.gold} />
                  </View>
                  <Text style={styles.statValue}>12</Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: colors.accent.cyanLight }]}>
                    <SparkleIcon size={16} color={colors.accent.cyan} />
                  </View>
                  <Text style={styles.statValue}>24</Text>
                  <Text style={styles.statLabel}>Matches</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Business Info */}
              <SectionCard
                eyebrow="BUSINESS"
                title="Business Information"
                iconBg={colors.primary[50]}
                icon={<BriefcaseIcon size={18} color={colors.primary[600]} />}
              >
                <Input
                  label="Business Name"
                  value={providerProfile.businessName}
                  onChangeText={(text) => setProviderProfile({ ...providerProfile, businessName: text })}
                  icon={<BriefcaseIcon size={18} color={colors.neutral[400]} />}
                  editable={isEditing}
                  containerStyle={styles.inputContainer}
                />
                <Input
                  label="Full Name"
                  value={providerProfile.fullName}
                  onChangeText={(text) => setProviderProfile({ ...providerProfile, fullName: text })}
                  icon={<UserIcon size={18} color={colors.neutral[400]} />}
                  editable={isEditing}
                  containerStyle={styles.inputContainer}
                />
                <Input
                  label="Email"
                  value={providerProfile.email}
                  onChangeText={(text) => setProviderProfile({ ...providerProfile, email: text })}
                  icon={<MailIcon size={18} color={colors.neutral[400]} />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={isEditing}
                  containerStyle={styles.inputContainer}
                />
                <Input
                  label="Phone"
                  value={providerProfile.phone}
                  onChangeText={(text) => setProviderProfile({ ...providerProfile, phone: text })}
                  icon={<PhoneIcon size={18} color={colors.neutral[400]} />}
                  keyboardType="phone-pad"
                  editable={isEditing}
                />
              </SectionCard>

              {/* Service Categories */}
              <SectionCard
                eyebrow="CATEGORIES"
                title="Service Categories"
                iconBg={colors.accent.cyanLight}
                icon={<TagIcon size={18} color={colors.accent.cyan} />}
              >
                <View style={styles.chipsContainer}>
                  {providerProfile.serviceCategories.map((category, index) => (
                    <Chip
                      key={index}
                      label={category}
                      variant="accent"
                      selected
                      onRemove={isEditing ? () => removeCategory(index) : undefined}
                    />
                  ))}
                </View>
                {isEditing && (
                  <View style={styles.addChipRow}>
                    <RNTextInput
                      style={styles.addInput}
                      placeholder="Add category..."
                      value={newCategory}
                      onChangeText={setNewCategory}
                      placeholderTextColor={colors.neutral[400]}
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={addCategory}>
                      <Text style={styles.addBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </SectionCard>

              {/* Service Radius */}
              <SectionCard
                eyebrow="LOCATION"
                title="Service Radius"
                iconBg={colors.successLight}
                icon={<MapPinIcon size={18} color={colors.success} />}
              >
                <Input
                  label="Radius (km)"
                  value={providerProfile.serviceRadius}
                  onChangeText={(text) => setProviderProfile({ ...providerProfile, serviceRadius: text })}
                  icon={<MapPinIcon size={18} color={colors.neutral[400]} />}
                  keyboardType="numeric"
                  editable={isEditing}
                  placeholder="Enter radius in kilometers"
                />
              </SectionCard>

              {/* Availability */}
              <SectionCard
                eyebrow="SCHEDULE"
                title="Availability Slots"
                iconBg={colors.accent.goldLight}
                icon={<ClockIcon size={18} color={colors.accent.gold} />}
              >
                {providerProfile.availabilitySlots.length > 0 ? (
                  <View style={styles.slotsContainer}>
                    {providerProfile.availabilitySlots.map((slot) => (
                      <View key={slot.id} style={styles.slotItem}>
                        <View style={styles.slotDot} />
                        <View style={styles.slotInfo}>
                          <Text style={styles.slotDay}>{slot.day}</Text>
                          <Text style={styles.slotTime}>{slot.startTime} – {slot.endTime}</Text>
                        </View>
                        {isEditing && (
                          <TouchableOpacity
                            onPress={() => removeTimeSlot(slot.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <XIcon size={15} color={colors.error} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptySlotText}>No time slots configured</Text>
                )}

                {isEditing && (
                  <View style={styles.addSlotForm}>
                    <View style={styles.addSlotDivider} />
                    <Text style={styles.addSlotLabel}>Add Time Slot</Text>
                    <RNTextInput
                      style={styles.slotInput}
                      value={newSlotDay}
                      onChangeText={setNewSlotDay}
                      placeholder="Day (e.g., Monday)"
                      placeholderTextColor={colors.neutral[400]}
                    />
                    <View style={styles.slotTimeRow}>
                      <RNTextInput
                        style={[styles.slotInput, { flex: 1 }]}
                        value={newSlotStart}
                        onChangeText={setNewSlotStart}
                        placeholder="Start (HH:mm)"
                        placeholderTextColor={colors.neutral[400]}
                      />
                      <RNTextInput
                        style={[styles.slotInput, { flex: 1 }]}
                        value={newSlotEnd}
                        onChangeText={setNewSlotEnd}
                        placeholder="End (HH:mm)"
                        placeholderTextColor={colors.neutral[400]}
                      />
                    </View>
                    <TouchableOpacity style={styles.addSlotBtn} onPress={addTimeSlot}>
                      <Text style={styles.addSlotBtnText}>Add Time Slot</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </SectionCard>

              {/* Availability Toggle */}
              <SectionCard
                eyebrow="STATUS"
                title="Availability Status"
                iconBg={providerProfile.isAvailable ? colors.successLight : colors.errorLight}
                icon={
                  providerProfile.isAvailable
                    ? <CheckCircleIcon size={18} color={colors.success} />
                    : <XIcon size={18} color={colors.error} />
                }
              >
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleLabel}>Currently Available</Text>
                    <Text style={[
                      styles.toggleSubtext,
                      { color: providerProfile.isAvailable ? colors.success : colors.neutral[500] },
                    ]}>
                      {providerProfile.isAvailable ? 'Accepting new clients' : 'Not accepting new clients'}
                    </Text>
                  </View>
                  <ToggleSwitch
                    value={providerProfile.isAvailable}
                    onValueChange={(value) => setProviderProfile({ ...providerProfile, isAvailable: value })}
                    disabled={!isEditing}
                  />
                </View>
              </SectionCard>

              {/* Provider Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: colors.accent.goldLight }]}>
                    <SparkleIcon size={16} color={colors.accent.gold} />
                  </View>
                  <Text style={styles.statValue}>4.9</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
                    <CheckCircleIcon size={16} color={colors.success} />
                  </View>
                  <Text style={styles.statValue}>47</Text>
                  <Text style={styles.statLabel}>Done</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: colors.primary[50] }]}>
                    <TrendingUpIcon size={16} color={colors.primary[600]} />
                  </View>
                  <Text style={styles.statValue}>98%</Text>
                  <Text style={styles.statLabel}>Success</Text>
                </View>
              </View>
            </>
          )}

          {/* Save Button */}
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

  // ── Hero
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

  // ── Edit button row (below hero)
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

  // ── Content
  content: {
    paddingHorizontal: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  addChipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.size.sm,
    color: colors.neutral[800],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  addBtn: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
  },

  // ── Stats row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.card,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.primary[700],
    lineHeight: typography.lineHeight.xl,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    textAlign: 'center',
    fontWeight: typography.weight.medium,
  },

  // ── Time slots
  slotsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  slotDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent.cyan,
  },
  slotInfo: {
    flex: 1,
  },
  slotDay: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
  },
  slotTime: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
  },
  emptySlotText: {
    fontSize: typography.size.sm,
    color: colors.neutral[400],
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  addSlotForm: {
    gap: spacing.sm,
  },
  addSlotDivider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginVertical: spacing.sm,
  },
  addSlotLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.neutral[700],
  },
  slotInput: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.size.sm,
    color: colors.neutral[800],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  slotTimeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addSlotBtn: {
    backgroundColor: colors.accent.cyan,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addSlotBtnText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },

  // ── Toggle
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
    marginBottom: 2,
  },
  toggleSubtext: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },

  // ── Save + Logout
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
