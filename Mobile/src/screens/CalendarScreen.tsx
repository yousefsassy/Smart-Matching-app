import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
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
import { availabilityService, BackendAvailabilityEntry } from '../services/availability';

// Day-of-week availability defaults (0=Sun … 6=Sat)
const DEFAULT_AVAILABLE_DAYS = new Set([1, 2, 3, 4, 5]); // Mon–Fri

// ── Underline color constants ──────────────────────────────────────────────────
const UNDERLINE_JOB       = colors.primary[500];
const UNDERLINE_AVAILABLE = colors.success;
const UNDERLINE_BUSY      = colors.error;

// ── Time slot options ──────────────────────────────────────────────────────────
const TIME_SLOTS: string[] = Array.from({ length: 24 }, (_, h) =>
  `${String(h).padStart(2, '0')}:00`
);

// ── Availability override shape ────────────────────────────────────────────────
interface DayOverride {
  available: boolean;
  from: string | null; // null = all day
  to: string | null;
}

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

function normalizeBackendDate(value: string): string {
  return new Date(value).toISOString().split('T')[0];
}

function buildOverridesFromBackend(entries: BackendAvailabilityEntry[]) {
  return entries.reduce((acc, entry) => {
    const date = normalizeBackendDate(entry.date);
    const firstSlot = entry.slot1;

    acc[date] = {
      available: true,
      from: firstSlot?.start || null,
      to: firstSlot?.end || null,
    };

    return acc;
  }, {} as Record<string, DayOverride>);
}

// ── Time chip component ────────────────────────────────────────────────────────
function TimeChip({
  time,
  selected,
  onPress,
}: {
  time: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[timeChipStyles.chip, selected && timeChipStyles.chipSelected]}
    >
      <Text style={[timeChipStyles.text, selected && timeChipStyles.textSelected]}>
        {time}
      </Text>
    </TouchableOpacity>
  );
}

const timeChipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    marginRight: 8,
  },
  chipSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  text: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[500],
  },
  textSelected: {
    color: colors.primary[700],
    fontWeight: typography.weight.bold,
  },
});

// ── Main screen ────────────────────────────────────────────────────────────────

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { getProviderRequests, updateRequestStatus } = useServiceRequests();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // overrides: key = YYYY-MM-DD
  const [overrides, setOverrides] = useState<Record<string, DayOverride>>({});

  // modal draft state
  const [draftAvailable, setDraftAvailable] = useState(true);
  const [draftFrom, setDraftFrom] = useState<string | null>(null);
  const [draftTo, setDraftTo] = useState<string | null>(null);

  const fromScrollRef = useRef<ScrollView>(null);
  const toScrollRef   = useRef<ScrollView>(null);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useFocusEffect(
    useCallback(() => {
      setRequests(getProviderRequests());

      if (availabilityService) {
        availabilityService
          .getMe()
          .then((state) => {
            setOverrides(buildOverridesFromBackend(state.availability || []));
          })
          .catch(() => {
            // Keep the calendar usable if availability sync is temporarily unavailable.
          });
      }
    }, [getProviderRequests])
  );

  const reloadRequests = useCallback(() => {
    setRequests(getProviderRequests());
  }, [getProviderRequests]);

  // ── Derived day availability ─────────────────────────────────────────────────

  const isDayAvailable = useCallback(
    (dateStr: string): boolean => {
      const ov = overrides[dateStr];
      if (ov !== undefined) return ov.available;
      if (availabilityService) return false;
      const dow = new Date(dateStr + 'T00:00:00').getDay();
      return DEFAULT_AVAILABLE_DAYS.has(dow);
    },
    [overrides]
  );

  const getDayTimeLabel = useCallback(
    (dateStr: string): string => {
      const ov = overrides[dateStr];
      if (!ov || !ov.available) return '';
      if (ov.from && ov.to) return `${ov.from} – ${ov.to}`;
      return 'All day';
    },
    [overrides]
  );

  const hasJobOnDay = useCallback(
    (dateStr: string): boolean => {
      const jobStatuses = new Set(['in_progress', 'completed']);
      return requests.some((r) => r.timeSlot.date === dateStr && jobStatuses.has(r.status));
    },
    [requests]
  );

  // ── Marked dates ─────────────────────────────────────────────────────────────

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    const days = getDaysInMonth(currentMonth.year, currentMonth.month);

    days.forEach((day) => {
      const ds = toDateString(day);
      const hasJob  = hasJobOnDay(ds);
      const available = isDayAvailable(ds);
      const isSelected = ds === selectedDate;

      const underlineColor = hasJob
        ? UNDERLINE_JOB
        : available
        ? UNDERLINE_AVAILABLE
        : UNDERLINE_BUSY;

      marks[ds] = {
        customStyles: {
          container: {
            backgroundColor: hasJob
              ? isSelected ? colors.primary[600] : colors.primary[50]
              : isSelected ? colors.primary[600] : undefined,
            borderRadius: 6,
            borderWidth: hasJob ? 1.5 : 0,
            borderColor: hasJob ? colors.primary[500] : 'transparent',
          },
          text: {
            color: isSelected
              ? colors.neutral[0]
              : hasJob
              ? colors.primary[700]
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
    return requests.filter(
      (r) =>
        r.timeSlot.date === selectedDate &&
        (r.status === 'in_progress' || r.status === 'completed')
    );
  }, [selectedDate, requests]);

  // ── Availability edit handlers ───────────────────────────────────────────────

  const handleEditAvailability = () => {
    if (!selectedDate) return;
    const existing = overrides[selectedDate];
    if (existing) {
      setDraftAvailable(existing.available);
      setDraftFrom(existing.from);
      setDraftTo(existing.to);
    } else {
      const dow = new Date(selectedDate + 'T00:00:00').getDay();
      setDraftAvailable(DEFAULT_AVAILABLE_DAYS.has(dow));
      setDraftFrom(null);
      setDraftTo(null);
    }
    setEditModalVisible(true);
  };

  const handleSaveAvailability = async () => {
    if (!selectedDate) return;
    // If not available, clear time range
    const from = draftAvailable ? draftFrom : null;
    const to   = draftAvailable ? draftTo   : null;
    const previous = overrides;
    const nextOverrides = {
      ...previous,
      [selectedDate]: { available: draftAvailable, from, to },
    };

    setOverrides(nextOverrides);

    try {
      if (availabilityService) {
        const state = draftAvailable
          ? await availabilityService.syncDay({
              date: selectedDate,
              slot1: from && to ? { start: from, end: to } : null,
              slot2: null,
            })
          : await availabilityService.deleteDay(selectedDate);

        setOverrides(buildOverridesFromBackend(state.availability || []));
      }

      setEditModalVisible(false);
    } catch (error) {
      setOverrides(previous);
      Alert.alert(
        'Availability update failed',
        error instanceof Error ? error.message : 'Could not update availability right now.'
      );
    }
  };

  const handleMarkCompleted = async (requestId: string) => {
    try {
      await updateRequestStatus(requestId, 'completed');
      reloadRequests();
    } catch {
      // lightweight — ignore in calendar surface
    }
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
          colors={colors.gradients.header as [string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
        >
          <View style={styles.heroGlow} />
          <View style={styles.heroIconWrap}>
            <CalendarIcon size={22} color={colors.neutral[0]} />
          </View>
          <Text style={styles.heroTitle}>My Calendar</Text>
          <Text style={styles.heroSubtitle}>Tap any date to view or edit availability</Text>
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
                <View style={styles.daySectionStatusRow}>
                  <Text style={[
                    styles.daySectionSub,
                    { color: isDayAvailable(selectedDate) ? colors.success : colors.error },
                  ]}>
                    {isDayAvailable(selectedDate) ? '✓ Available' : '✗ Unavailable'}
                  </Text>
                  {isDayAvailable(selectedDate) && getDayTimeLabel(selectedDate) !== '' && (
                    <View style={styles.timePill}>
                      <ClockIcon size={11} color={colors.primary[500]} />
                      <Text style={styles.timePillText}>{getDayTimeLabel(selectedDate)}</Text>
                    </View>
                  )}
                </View>
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
                          {job.requestLocation?.addressLabel}
                        </Text>
                      </View>
                      {job.status === 'in_progress' ? (
                        <TouchableOpacity
                          style={styles.completeButton}
                          onPress={() => handleMarkCompleted(job.id)}
                          activeOpacity={0.82}
                        >
                          <CheckCircleIcon size={14} color={colors.success} />
                          <Text style={styles.completeButtonText}>Mark completed</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Availability sync notice ──────────────────────────────────────────── */}
        <View style={styles.notice}>
          <TagIcon size={14} color={colors.neutral[400]} />
          <Text style={styles.noticeText}>
            {availabilityService
              ? 'Availability changes sync with your provider backend profile.'
              : 'Availability changes are saved locally only until a backend URL is configured.'}
          </Text>
        </View>
      </ScrollView>

      {/* ── Edit availability modal ──────────────────────────────────────────── */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setEditModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Edit Availability</Text>
            {selectedDate && (
              <Text style={styles.modalSubtitle}>{formatDisplayDate(selectedDate)}</Text>
            )}

            {/* ── Available / Unavailable toggle ─────────────────────────────── */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, draftAvailable && styles.toggleBtnAvailActive]}
                onPress={() => setDraftAvailable(true)}
                activeOpacity={0.8}
              >
                <CheckCircleIcon size={18} color={draftAvailable ? colors.success : colors.neutral[400]} />
                <Text style={[styles.toggleBtnText, draftAvailable && { color: colors.success }]}>
                  Available
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, !draftAvailable && styles.toggleBtnBusyActive]}
                onPress={() => setDraftAvailable(false)}
                activeOpacity={0.8}
              >
                <XCircleIcon size={18} color={!draftAvailable ? colors.error : colors.neutral[400]} />
                <Text style={[styles.toggleBtnText, !draftAvailable && { color: colors.error }]}>
                  Unavailable
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Time range (only shown when available) ─────────────────────── */}
            {draftAvailable && (
              <View style={styles.timeSection}>
                {/* All-day shortcut */}
                <TouchableOpacity
                  style={[styles.allDayBtn, !draftFrom && !draftTo && styles.allDayBtnActive]}
                  onPress={() => { setDraftFrom(null); setDraftTo(null); }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.allDayBtnText,
                    !draftFrom && !draftTo && styles.allDayBtnTextActive,
                  ]}>
                    All day
                  </Text>
                </TouchableOpacity>

                {/* From picker */}
                <View style={styles.timePicker}>
                  <View style={styles.timePickerLabelRow}>
                    <ClockIcon size={14} color={colors.primary[500]} />
                    <Text style={styles.timePickerLabel}>From</Text>
                    {draftFrom && (
                      <TouchableOpacity onPress={() => setDraftFrom(null)}>
                        <Text style={styles.timeClear}>Clear</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <ScrollView
                    ref={fromScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timeChipRow}
                  >
                    {TIME_SLOTS.map((t) => (
                      <TimeChip
                        key={t}
                        time={t}
                        selected={draftFrom === t}
                        onPress={() => setDraftFrom(draftFrom === t ? null : t)}
                      />
                    ))}
                  </ScrollView>
                </View>

                {/* To picker */}
                <View style={styles.timePicker}>
                  <View style={styles.timePickerLabelRow}>
                    <ClockIcon size={14} color={colors.accent.cyan} />
                    <Text style={styles.timePickerLabel}>To</Text>
                    {draftTo && (
                      <TouchableOpacity onPress={() => setDraftTo(null)}>
                        <Text style={styles.timeClear}>Clear</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <ScrollView
                    ref={toScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timeChipRow}
                  >
                    {TIME_SLOTS.map((t) => (
                      <TimeChip
                        key={t}
                        time={t}
                        selected={draftTo === t}
                        onPress={() => setDraftTo(draftTo === t ? null : t)}
                      />
                    ))}
                  </ScrollView>
                </View>

                <Text style={styles.timeHint}>
                  {draftFrom && draftTo
                    ? `Available ${draftFrom} – ${draftTo}`
                    : draftFrom
                    ? `Available from ${draftFrom}`
                    : draftTo
                    ? `Available until ${draftTo}`
                    : 'Available all day (no time restriction)'}
                </Text>
              </View>
            )}

            {/* ── Save button ───────────────────────────────────────────────── */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveAvailability}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={colors.gradients.primary as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtnGradient}
              >
                <Text style={styles.saveBtnText}>Save Availability</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.modalNote}>
              {availabilityService
                ? 'Changes sync to your backend provider calendar.'
                : 'Changes are saved locally on this device.'}
            </Text>
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
    backgroundColor: 'rgba(34, 92, 146, 0.18)',
    top: -60,
    right: -40,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.overlay.glassSoft,
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

  // Legend
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
    gap: 4,
  },
  daySectionDate: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  daySectionStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daySectionSub: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary[50],
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timePillText: {
    fontSize: 11,
    fontWeight: typography.weight.semibold,
    color: colors.primary[600],
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
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.successLight,
  },
  completeButtonText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.success,
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

  // Modal
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
  },

  // Available / Unavailable toggle
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  toggleBtnAvailActive: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  toggleBtnBusyActive: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  toggleBtnText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.neutral[400],
  },

  // Time range section
  timeSection: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing.md,
  },
  allDayBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  allDayBtnActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  allDayBtnText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[500],
  },
  allDayBtnTextActive: {
    color: colors.primary[600],
  },
  timePicker: {
    gap: spacing.sm,
  },
  timePickerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timePickerLabel: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[700],
  },
  timeClear: {
    fontSize: typography.size.xs,
    color: colors.accent.coral,
    fontWeight: typography.weight.semibold,
  },
  timeChipRow: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.xl,
  },
  timeHint: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Save button
  saveBtn: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  saveBtnGradient: {
    paddingVertical: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
  modalNote: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    textAlign: 'center',
  },
});
