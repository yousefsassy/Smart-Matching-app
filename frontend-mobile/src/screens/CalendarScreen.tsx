import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getServiceCategoryLabel, getServiceCategoryMeta } from '../constants/serviceCategories';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useServiceRequests } from '../context/ServiceRequestContext';
import { ServiceRequest } from '../types/serviceRequest';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '../components/Icons';
import StatusBadge from '../components/StatusBadge';

// Day-of-week availability defaults (0=Sun … 6=Sat)
const DEFAULT_AVAILABLE_DAYS = new Set([1, 2, 3, 4, 5]); // Mon–Fri

// ── Underline color constants ──────────────────────────────────────────────────
const UNDERLINE_JOB       = colors.primary[500];   // blue  — has scheduled jobs
const UNDERLINE_AVAILABLE = colors.success;         // green — available
const UNDERLINE_BUSY      = colors.error;           // red   — unavailable

// ── Helpers ────────────────────────────────────────────────────────────────────

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { getProviderRequests } = useServiceRequests();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // availabilityOverrides: key = YYYY-MM-DD, value = true (available) | false (unavailable)
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useFocusEffect(
    useCallback(() => {
      setRequests(getProviderRequests());
    }, [getProviderRequests])
  );

  // ── Derived day availability ─────────────────────────────────────────────────

  const isDayAvailable = useCallback(
    (dateStr: string): boolean => {
      if (overrides[dateStr] !== undefined) return overrides[dateStr];
      const dow = new Date(dateStr + 'T00:00:00').getDay();
      return DEFAULT_AVAILABLE_DAYS.has(dow);
    },
    [overrides]
  );

  const hasJobOnDay = useCallback(
    (dateStr: string): boolean => {
      const jobStatuses = new Set(['accepted', 'completed']);
      return requests.some((r) => r.timeSlot.date === dateStr && jobStatuses.has(r.status));
    },
    [requests]
  );

  // ── Marked dates for the calendar (custom underline style) ──────────────────

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    const days = getDaysInMonth(currentMonth.year, currentMonth.month);

    days.forEach((day) => {
      const ds = toDateString(day);
      const hasJob = hasJobOnDay(ds);
      const available = isDayAvailable(ds);
      const isSelected = ds === selectedDate;

      // Priority: jobs (blue) > available (green) > unavailable (red)
      const underlineColor = hasJob
        ? UNDERLINE_JOB
        : available
        ? UNDERLINE_AVAILABLE
        : UNDERLINE_BUSY;

      marks[ds] = {
        customStyles: {
          container: {
            backgroundColor: isSelected ? colors.primary[600] : undefined,
            borderRadius: 6,
          },
          text: {
            color: isSelected
              ? colors.neutral[0]
              : colors.neutral[800],
            fontWeight: isSelected ? typography.weight.bold as any : undefined,
            textDecorationLine: 'underline',
            textDecorationColor: underlineColor,
            textDecorationStyle: 'solid' as const,
          },
        },
      };
    });

    return marks;
  }, [currentMonth, selectedDate, requests, isDayAvailable, hasJobOnDay]);

  // ── Jobs for selected day ────────────────────────────────────────────────────

  const jobsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return requests.filter((r) => r.timeSlot.date === selectedDate);
  }, [selectedDate, requests]);

  // ── Availability edit handlers ───────────────────────────────────────────────

  const handleEditAvailability = () => {
    if (!selectedDate) return;
    setEditModalVisible(true);
  };

  const applyAvailability = (available: boolean) => {
    if (!selectedDate) return;
    setOverrides((prev) => ({ ...prev, [selectedDate]: available }));
    setEditModalVisible(false);
  };

  // ── Month navigation ─────────────────────────────────────────────────────────

  const goToPrevMonth = () => {
    setSelectedDate(null);
    setCurrentMonth((prev) => {
      const d = new Date(prev.year, prev.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const goToNextMonth = () => {
    setSelectedDate(null);
    setCurrentMonth((prev) => {
      const d = new Date(prev.year, prev.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const currentMonthStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-01`;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing['3xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#0A2744', '#134686', '#1a5699']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
        >
          <View style={styles.heroGlow} />
          <View style={styles.heroIconWrap}>
            <CalendarIcon size={22} color={colors.neutral[0]} />
          </View>
          <Text style={styles.heroTitle}>My Calendar</Text>
          <Text style={styles.heroSubtitle}>Your schedule at a glance</Text>
        </LinearGradient>

        {/* ── Legend ──────────────────────────────────────────────────────────── */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: UNDERLINE_JOB }]} />
            <Text style={styles.legendLabel}>Job scheduled</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: UNDERLINE_AVAILABLE }]} />
            <Text style={styles.legendLabel}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: UNDERLINE_BUSY }]} />
            <Text style={styles.legendLabel}>Unavailable</Text>
          </View>
        </View>

        {/* ── Month nav header ────────────────────────────────────────────────── */}
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.monthNavBtn} onPress={goToPrevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ChevronLeftIcon size={20} color={colors.primary[600]} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {formatMonthLabel(currentMonth.year, currentMonth.month)}
          </Text>
          <TouchableOpacity style={styles.monthNavBtn} onPress={goToNextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ChevronRightIcon size={20} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>

        {/* ── Calendar ────────────────────────────────────────────────────────── */}
        <View style={styles.calendarWrapper}>
          <Calendar
            key={currentMonthStr}
            current={currentMonthStr}
            onDayPress={(day: DateData) => {
              setSelectedDate(day.dateString === selectedDate ? null : day.dateString);
            }}
            markedDates={markedDates}
            markingType="custom"
            hideArrows
            renderHeader={() => null}
            theme={{
              backgroundColor: colors.neutral[0],
              calendarBackground: colors.neutral[0],
              textSectionTitleColor: colors.neutral[400],
              todayTextColor: colors.primary[600],
              todayBackgroundColor: colors.primary[50],
              dayTextColor: colors.neutral[800],
              textDisabledColor: colors.neutral[300],
              dotColor: colors.primary[500],
              monthTextColor: colors.neutral[900],
              arrowColor: colors.primary[600],
              textDayFontWeight: typography.weight.medium as any,
              textDayHeaderFontWeight: typography.weight.bold as any,
              textDayFontSize: typography.size.sm,
              textDayHeaderFontSize: typography.size.xs,
            }}
          />
        </View>

        {/* ── Selected day section ─────────────────────────────────────────────── */}
        {selectedDate && (
          <View style={styles.daySection}>
            {/* Day header */}
            <View style={styles.daySectionHeader}>
              <View style={styles.daySectionInfo}>
                <Text style={styles.daySectionDate}>{formatDisplayDate(selectedDate)}</Text>
                <Text style={[
                  styles.daySectionSub,
                  { color: isDayAvailable(selectedDate) ? colors.success : colors.error },
                ]}>
                  {isDayAvailable(selectedDate) ? '✓ Available' : '✗ Unavailable'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editAvailBtn}
                onPress={handleEditAvailability}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <EditIcon size={16} color={colors.primary[600]} />
                <Text style={styles.editAvailBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Jobs list */}
            {jobsForSelectedDay.length === 0 ? (
              <View style={styles.emptyDay}>
                <Text style={styles.emptyDayText}>No jobs scheduled for this day</Text>
              </View>
            ) : (
              <View style={styles.jobsList}>
                {jobsForSelectedDay.map((job) => (
                  <View key={job.id} style={styles.jobCard}>
                    <View style={styles.jobCardLeft}>
                      <Text style={styles.jobEmoji}>
                        {getServiceCategoryMeta(job.serviceCategory).emoji}
                      </Text>
                    </View>
                    <View style={styles.jobCardBody}>
                      <View style={styles.jobCardTop}>
                        <Text style={styles.jobCategory}>
                          {getServiceCategoryLabel(job.serviceCategory)}
                        </Text>
                        <StatusBadge status={job.status} size="sm" />
                      </View>
                      <Text style={styles.jobClient} numberOfLines={1}>
                        {job.clientName}
                      </Text>
                      <View style={styles.jobMeta}>
                        <ClockIcon size={12} color={colors.neutral[400]} />
                        <Text style={styles.jobMetaText}>
                          {job.timeSlot.startTime} – {job.timeSlot.endTime}
                        </Text>
                        <MapPinIcon size={12} color={colors.neutral[400]} />
                        <Text style={styles.jobMetaText} numberOfLines={1}>
                          {job.requestLocation.addressLabel}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Local-only notice ─────────────────────────────────────────────────── */}
        <View style={styles.notice}>
          <TagIcon size={14} color={colors.neutral[400]} />
          <Text style={styles.noticeText}>
            Availability changes are saved locally only. Backend sync coming soon.
          </Text>
        </View>
      </ScrollView>

      {/* ── Edit availability modal ──────────────────────────────────────────── */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setEditModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Edit Availability</Text>
            {selectedDate && (
              <Text style={styles.modalSubtitle}>{formatDisplayDate(selectedDate)}</Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnAvail]}
                onPress={() => applyAvailability(true)}
                activeOpacity={0.8}
              >
                <CheckCircleIcon size={20} color={colors.success} />
                <Text style={[styles.modalBtnText, { color: colors.success }]}>Mark Available</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnBusy]}
                onPress={() => applyAvailability(false)}
                activeOpacity={0.8}
              >
                <XCircleIcon size={20} color={colors.error} />
                <Text style={[styles.modalBtnText, { color: colors.error }]}>Mark Unavailable</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalNote}>Changes are saved locally only.</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },

  // Hero
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(38, 96, 175, 0.22)',
    top: -60,
    right: -40,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.7)',
  },

  // Legend — uses lines instead of dots to match underline metaphor
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendLine: {
    width: 18,
    height: 3,
    borderRadius: 1.5,
  },
  legendLabel: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    fontWeight: typography.weight.medium,
  },

  // Month nav
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[0],
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },

  // Calendar
  calendarWrapper: {
    backgroundColor: colors.neutral[0],
    ...shadows.sm,
    marginBottom: spacing.base,
  },

  // Selected day section
  daySection: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.base,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  daySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  daySectionInfo: {
    flex: 1,
  },
  daySectionDate: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  daySectionSub: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  editAvailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  editAvailBtnText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.primary[600],
  },

  // Empty day
  emptyDay: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: typography.size.sm,
    color: colors.neutral[400],
  },

  // Jobs list
  jobsList: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  jobCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  jobCardLeft: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  jobEmoji: {
    fontSize: 20,
  },
  jobCardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  jobCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  jobCategory: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
  },
  jobClient: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  jobMetaText: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    flexShrink: 1,
  },

  // Notice
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
  },
  noticeText: {
    flex: 1,
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    lineHeight: 18,
  },

  // Edit availability modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[200],
    alignSelf: 'center',
    marginBottom: spacing.sm,
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
    marginBottom: spacing.sm,
  },
  modalActions: {
    gap: spacing.md,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
  },
  modalBtnAvail: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  modalBtnBusy: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  modalBtnText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  modalNote: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
