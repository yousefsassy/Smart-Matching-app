import { normalizeTimeValue } from '../../../components/ServiceRequest/ScheduleStep';
import { getServiceCategoryLabel } from '../../../constants/serviceCategories';
import { BudgetRange, ServiceCategory } from '../../../types/serviceRequest';
import { NormalizedLocation } from '../../../types/location';
import { ParsedVoiceRequest } from '../types/voice';
import { MissingDetailItem } from './getMissingVoiceRequestDetails';

export function formatVoiceCategory(
  category: ParsedVoiceRequest['category'] | ServiceCategory | null
) {
  return !category || category === 'unknown'
    ? 'Needs confirmation'
    : getServiceCategoryLabel(category);
}

export function formatVoiceDateTime(value?: string | null) {
  if (!value) {
    return 'Preferred time can be added in the form';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Preferred time can be added in the form';
  }

  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatVoiceSummary(parsedRequest: ParsedVoiceRequest) {
  const candidate =
    parsedRequest.issueSummary.trim() ||
    parsedRequest.cleanedText.trim() ||
    parsedRequest.rawText.trim();

  if (!candidate) {
    return 'We prepared a request from your voice note.';
  }

  return candidate.charAt(0).toUpperCase() + candidate.slice(1);
}

export function formatVoiceDraftSchedule(
  preferredDate: Date | null,
  startTime: string | null,
  endTime: string | null
) {
  if (!preferredDate) {
    return 'Add preferred day';
  }

  const dateLabel = preferredDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const normalizedStart = normalizeTimeValue(startTime);
  const normalizedEnd = normalizeTimeValue(endTime);
  if (!normalizedStart || !normalizedEnd || normalizedEnd <= normalizedStart) {
    return `${dateLabel} • Add preferred time`;
  }

  return `${dateLabel} • ${normalizedStart} to ${normalizedEnd}`;
}

export function formatVoiceLocation(location: NormalizedLocation | null) {
  return location?.addressLabel?.trim() || 'Add service location';
}

export function formatVoicePriority(
  urgency: ParsedVoiceRequest['urgency']
) {
  if (!urgency) {
    return '';
  }

  if (urgency === 'high') {
    return 'High priority';
  }

  if (urgency === 'medium') {
    return 'Medium priority';
  }

  return 'Flexible timing';
}

export function formatVoiceBudget(budgetRange: BudgetRange | null) {
  if (!budgetRange) {
    return 'No budget added';
  }

  if (budgetRange.min === budgetRange.max) {
    return `${budgetRange.min} ${budgetRange.currency}`;
  }

  return `${budgetRange.min} to ${budgetRange.max} ${budgetRange.currency}`;
}

export function formatMissingDetailsSummary(missingDetails: MissingDetailItem[]) {
  if (missingDetails.length === 0) {
    return 'Everything essential is in place.';
  }

  if (missingDetails.length === 1) {
    return `One final detail remains: ${missingDetails[0].title.toLowerCase()}.`;
  }

  if (missingDetails.length === 2) {
    return `Two details remain: ${missingDetails[0].title.toLowerCase()} and ${missingDetails[1].title.toLowerCase()}.`;
  }

  return `${missingDetails.length} details still need to be added before sending this request.`;
}
