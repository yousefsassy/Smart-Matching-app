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
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from '../components/Icons';

interface ClientProfileData {
  fullName: string;
  email: string;
  location: string;
  preferences: string[];
}

interface ProviderProfileData {
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
  serviceCategories: string[];
  isAvailable: boolean;
}

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newPreference, setNewPreference] = useState('');
  const [newCategory, setNewCategory] = useState('');

  // Client profile state
  const [clientProfile, setClientProfile] = useState<ClientProfileData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    location: 'San Francisco, CA',
    preferences: ['Web Development', 'Marketing', 'Design'],
  });

  // Provider profile state
  const [providerProfile, setProviderProfile] = useState<ProviderProfileData>({
    businessName: user?.businessName || '',
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    serviceCategories: ['Business Consulting', 'Strategy', 'Growth'],
    isAvailable: true,
  });

  const handleSaveProfile = async () => {
    try {
      if (user?.role === 'client') {
        // Update user context with new data
        await updateUser({
          fullName: clientProfile.fullName,
          email: clientProfile.email,
        });
        Alert.alert('Success', 'Your profile has been updated!');
      } else {
        // Update user context with new data
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
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const addPreference = () => {
    if (newPreference.trim()) {
      setClientProfile({
        ...clientProfile,
        preferences: [...clientProfile.preferences, newPreference.trim()],
      });
      setNewPreference('');
    }
  };

  const removePreference = (index: number) => {
    setClientProfile({
      ...clientProfile,
      preferences: clientProfile.preferences.filter((_, i) => i !== index),
    });
  };

  const addCategory = () => {
    if (newCategory.trim()) {
      setProviderProfile({
        ...providerProfile,
        serviceCategories: [...providerProfile.serviceCategories, newCategory.trim()],
      });
      setNewCategory('');
    }
  };

  const removeCategory = (index: number) => {
    setProviderProfile({
      ...providerProfile,
      serviceCategories: providerProfile.serviceCategories.filter((_, i) => i !== index),
    });
  };

  const renderClientProfile = () => (
    <>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <LinearGradient
          colors={[colors.primary[500], colors.primary[700]]}
          style={styles.avatarContainer}
        >
          <UserIcon size={48} color={colors.neutral[0]} />
        </LinearGradient>
        <Text style={styles.profileName}>{clientProfile.fullName}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>Client</Text>
        </View>
      </View>

      {/* Edit Toggle */}
      <View style={styles.editButtonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <XIcon size={18} color={colors.neutral[0]} />
              <Text style={styles.editButtonText}>Cancel</Text>
            </>
          ) : (
            <>
              <EditIcon size={18} color={colors.neutral[0]} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Profile Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.card}>
          <Input
            label="Full Name"
            value={clientProfile.fullName}
            onChangeText={(text) => setClientProfile({ ...clientProfile, fullName: text })}
            icon={<UserIcon size={20} color={colors.neutral[400]} />}
            editable={isEditing}
            containerStyle={styles.inputContainer}
          />
          <Input
            label="Email"
            value={clientProfile.email}
            onChangeText={(text) => setClientProfile({ ...clientProfile, email: text })}
            icon={<MailIcon size={20} color={colors.neutral[400]} />}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={isEditing}
            containerStyle={styles.inputContainer}
          />
          <Input
            label="Location"
            value={clientProfile.location}
            onChangeText={(text) => setClientProfile({ ...clientProfile, location: text })}
            icon={<MapPinIcon size={20} color={colors.neutral[400]} />}
            editable={isEditing}
            containerStyle={styles.inputContainer}
          />
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Preferences</Text>
        <View style={styles.card}>
          <View style={styles.chipsContainer}>
            {clientProfile.preferences.map((pref, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{pref}</Text>
                {isEditing && (
                  <TouchableOpacity
                    onPress={() => removePreference(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <XIcon size={14} color={colors.primary[600]} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
          {isEditing && (
            <View style={styles.addChipContainer}>
              <RNTextInput
                style={styles.addChipInput}
                placeholder="Add preference..."
                value={newPreference}
                onChangeText={setNewPreference}
                placeholderTextColor={colors.neutral[400]}
              />
              <TouchableOpacity style={styles.addChipButton} onPress={addPreference}>
                <Text style={styles.addChipButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Stats</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Saved Providers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Active Requests</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Total Matches</Text>
          </View>
        </View>
      </View>

      {/* Save Button */}
      {isEditing && (
        <View style={styles.section}>
          <PrimaryButton title="Save Changes" onPress={handleSaveProfile} />
        </View>
      )}
    </>
  );

  const renderProviderProfile = () => (
    <>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <LinearGradient
          colors={[colors.accent.cyan, colors.primary[500]]}
          style={styles.avatarContainer}
        >
          <BriefcaseIcon size={48} color={colors.neutral[0]} />
        </LinearGradient>
        <Text style={styles.profileName}>{providerProfile.businessName || providerProfile.fullName}</Text>
        <View style={[styles.roleBadge, styles.roleBadgeProvider]}>
          <Text style={styles.roleBadgeText}>Provider</Text>
        </View>
      </View>

      {/* Edit Toggle */}
      <View style={styles.editButtonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <XIcon size={18} color={colors.neutral[0]} />
              <Text style={styles.editButtonText}>Cancel</Text>
            </>
          ) : (
            <>
              <EditIcon size={18} color={colors.neutral[0]} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Profile Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Information</Text>
        <View style={styles.card}>
          <Input
            label="Business Name"
            value={providerProfile.businessName}
            onChangeText={(text) => setProviderProfile({ ...providerProfile, businessName: text })}
            icon={<BriefcaseIcon size={20} color={colors.neutral[400]} />}
            editable={isEditing}
            containerStyle={styles.inputContainer}
          />
          <Input
            label="Full Name"
            value={providerProfile.fullName}
            onChangeText={(text) => setProviderProfile({ ...providerProfile, fullName: text })}
            icon={<UserIcon size={20} color={colors.neutral[400]} />}
            editable={isEditing}
            containerStyle={styles.inputContainer}
          />
          <Input
            label="Email"
            value={providerProfile.email}
            onChangeText={(text) => setProviderProfile({ ...providerProfile, email: text })}
            icon={<MailIcon size={20} color={colors.neutral[400]} />}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={isEditing}
            containerStyle={styles.inputContainer}
          />
          <Input
            label="Phone"
            value={providerProfile.phone}
            onChangeText={(text) => setProviderProfile({ ...providerProfile, phone: text })}
            icon={<PhoneIcon size={20} color={colors.neutral[400]} />}
            keyboardType="phone-pad"
            editable={isEditing}
            containerStyle={styles.inputContainer}
          />
        </View>
      </View>

      {/* Service Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Categories</Text>
        <View style={styles.card}>
          <View style={styles.chipsContainer}>
            {providerProfile.serviceCategories.map((category, index) => (
              <View key={index} style={[styles.chip, styles.chipProvider]}>
                <Text style={[styles.chipText, styles.chipTextProvider]}>{category}</Text>
                {isEditing && (
                  <TouchableOpacity
                    onPress={() => removeCategory(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <XIcon size={14} color={colors.accent.cyan} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
          {isEditing && (
            <View style={styles.addChipContainer}>
              <RNTextInput
                style={styles.addChipInput}
                placeholder="Add service category..."
                value={newCategory}
                onChangeText={setNewCategory}
                placeholderTextColor={colors.neutral[400]}
              />
              <TouchableOpacity style={styles.addChipButton} onPress={addCategory}>
                <Text style={styles.addChipButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Availability Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.card}>
          <View style={styles.toggleContainer}>
            <View>
              <Text style={styles.toggleLabel}>Currently Available</Text>
              <Text style={styles.toggleSubtext}>
                {providerProfile.isAvailable ? 'Accepting new clients' : 'Not accepting new clients'}
              </Text>
            </View>
            <ToggleSwitch
              value={providerProfile.isAvailable}
              onValueChange={(value) =>
                setProviderProfile({ ...providerProfile, isAvailable: value })
              }
              disabled={!isEditing}
            />
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Stats</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>47</Text>
            <Text style={styles.statLabel}>Completed Matches</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>
      </View>

      {/* Save Button */}
      {isEditing && (
        <View style={styles.section}>
          <PrimaryButton title="Save Changes" onPress={handleSaveProfile} />
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {user?.role === 'client' ? renderClientProfile() : renderProviderProfile()}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOutIcon size={20} color={colors.error} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding */}
        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
    ...shadows.lg,
  },
  profileName: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleBadgeProvider: {
    backgroundColor: colors.accent.cyanLight,
  },
  roleBadgeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary[700],
  },
  editButtonContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  editButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
    marginLeft: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    ...shadows.sm,
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
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  chipProvider: {
    backgroundColor: colors.accent.cyanLight,
  },
  chipText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary[700],
  },
  chipTextProvider: {
    color: colors.accent.cyan,
  },
  addChipContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addChipInput: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.size.base,
    color: colors.neutral[800],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  addChipButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
  },
  addChipButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
    marginBottom: 2,
  },
  toggleSubtext: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    ...shadows.sm,
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
    paddingVertical: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.error,
    gap: spacing.sm,
  },
  logoutButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.error,
  },
});
