import { BudgetData } from '../../components/ServiceRequest/BudgetStep';
import { DescribeJobData } from '../../components/ServiceRequest/DescribeJobStep';
import { ScheduleData, normalizeTimeValue } from '../../components/ServiceRequest/ScheduleStep';
import { ManualRequestPrefillParams } from '../../navigation/types';
import { ServiceCategory } from '../../types/serviceRequest';

export interface ManualRequestFormData {
  serviceCategory: ServiceCategory | null;
  describe: DescribeJobData;
  schedule: ScheduleData;
  budget: BudgetData;
}

export function buildManualRequestDraft(
  prefill?: ManualRequestPrefillParams | null
): ManualRequestFormData {
  const scheduleDate = prefill?.scheduleDateIso ? new Date(prefill.scheduleDateIso) : null;
  const normalizedScheduleDate =
    scheduleDate && !Number.isNaN(scheduleDate.getTime()) ? scheduleDate : null;

  return {
    serviceCategory: prefill?.serviceCategory ?? null,
    describe: {
      description: prefill?.description?.trim() ?? '',
      requestLocation: null,
    },
    schedule: {
      date: normalizedScheduleDate,
      startTime: prefill?.startTime ?? null,
      endTime: prefill?.endTime ?? null,
    },
    budget: {
      preset: null,
    },
  };
}

export function getFirstIncompleteManualRequestStep(data: ManualRequestFormData) {
  if (!data.serviceCategory) {
    return 0;
  }

  if (!data.describe.description.trim() || !data.describe.requestLocation) {
    return 1;
  }

  const normalizedStart = normalizeTimeValue(data.schedule.startTime);
  const normalizedEnd = normalizeTimeValue(data.schedule.endTime);
  if (!data.schedule.date || !normalizedStart || !normalizedEnd || normalizedEnd <= normalizedStart) {
    return 2;
  }

  return 3;
}
