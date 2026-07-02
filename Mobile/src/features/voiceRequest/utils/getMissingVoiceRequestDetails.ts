import { DescribeJobData } from '../../../components/ServiceRequest/DescribeJobStep';
import { ScheduleData, normalizeTimeValue } from '../../../components/ServiceRequest/ScheduleStep';
import { ServiceCategory } from '../../../types/serviceRequest';

export type VoiceRequestMissingField =
  | 'serviceCategory'
  | 'description'
  | 'requestLocation'
  | 'scheduleDate'
  | 'scheduleTime';

export interface VoiceRequestFormSnapshot {
  serviceCategory: ServiceCategory | null;
  describe: DescribeJobData;
  schedule: ScheduleData;
}

export interface MissingDetailItem {
  field: VoiceRequestMissingField;
  title: string;
  prompt: string;
  step: number;
}

const MISSING_DETAIL_COPY: Record<VoiceRequestMissingField, Omit<MissingDetailItem, 'field'>> = {
  serviceCategory: {
    title: 'Service type',
    prompt: 'Please choose the type of help you need.',
    step: 0,
  },
  description: {
    title: 'Problem details',
    prompt: 'Please add a little more about what needs to be fixed.',
    step: 1,
  },
  requestLocation: {
    title: 'Location',
    prompt: 'Please tell us where the service is needed.',
    step: 1,
  },
  scheduleDate: {
    title: 'Preferred date',
    prompt: 'Please choose the day you want the provider to come.',
    step: 2,
  },
  scheduleTime: {
    title: 'Preferred time',
    prompt: 'Please choose a start and end time for the visit.',
    step: 2,
  },
};

export function getMissingVoiceRequestDetails(
  formData: VoiceRequestFormSnapshot
): MissingDetailItem[] {
  const missingFields: VoiceRequestMissingField[] = [];

  if (!formData.serviceCategory) {
    missingFields.push('serviceCategory');
  }

  if (!formData.describe.description.trim() || formData.describe.description.trim().length < 10) {
    missingFields.push('description');
  }

  if (!formData.describe.requestLocation) {
    missingFields.push('requestLocation');
  }

  if (!formData.schedule.date) {
    missingFields.push('scheduleDate');
  }

  const normalizedStart = normalizeTimeValue(formData.schedule.startTime);
  const normalizedEnd = normalizeTimeValue(formData.schedule.endTime);
  if (!normalizedStart || !normalizedEnd || normalizedEnd <= normalizedStart) {
    missingFields.push('scheduleTime');
  }

  return missingFields.map((field) => ({
    field,
    ...MISSING_DETAIL_COPY[field],
  }));
}
