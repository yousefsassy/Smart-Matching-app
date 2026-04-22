import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MatchingScreen from '../components/ServiceRequest/MatchingScreen';
import PrimaryButton from '../components/PrimaryButton';
import { MOCK_NETWORK_DELAYS } from '../constants/appConfig';
import { useServiceRequests } from '../context/ServiceRequestContext';
import { HomeStackParamList } from '../navigation/MainTabs';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'MatchingResults'>;

export default function MatchingResultsScreen({ navigation, route }: Props) {
  const { getRequestById, selectProvider } = useServiceRequests();
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const request = getRequestById(route.params.requestId);

  const providers = useMemo(() => request?.rankedProviders ?? [], [request?.rankedProviders]);

  const exitToRequestsTab = useCallback(() => {
    completionTimeoutRef.current = setTimeout(() => {
      navigation.popToTop();
      navigation.getParent()?.navigate('RequestsTab');
    }, 1200);
  }, [navigation]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoadingProviders(false);
    }, MOCK_NETWORK_DELAYS.matchingRevealMs);

    return () => {
      clearTimeout(timeoutId);
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedProviderId || !request) {
      return;
    }

    await selectProvider(request.id, selectedProviderId);
    setShowSuccess(true);
    exitToRequestsTab();
  }, [exitToRequestsTab, request, selectProvider, selectedProviderId]);

  const handleSkip = useCallback(() => {
    setShowSuccess(true);
    exitToRequestsTab();
  }, [exitToRequestsTab]);

  if (!request) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>We could not find that request.</Text>
        <Text style={styles.emptyBody}>
          The request may have expired from local state. You can return to your requests and try again.
        </Text>
        <PrimaryButton
          title="Go to requests"
          onPress={() => {
            navigation.popToTop();
            navigation.getParent()?.navigate('RequestsTab');
          }}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <MatchingScreen
      isLoading={isLoadingProviders}
      providers={providers}
      selectedProviderId={selectedProviderId}
      showSuccess={showSuccess}
      onSelectProvider={setSelectedProviderId}
      onConfirm={handleConfirm}
      onSkip={handleSkip}
    />
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface.base,
  },
  emptyTitle: {
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
  emptyBody: {
    marginTop: spacing.sm,
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.neutral[700],
    textAlign: 'center',
    maxWidth: 420,
  },
  emptyButton: {
    marginTop: spacing.xl,
    width: '100%',
    maxWidth: 280,
  },
});
