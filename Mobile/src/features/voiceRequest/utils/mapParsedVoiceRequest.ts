import { ServiceCategory } from '../../../types/serviceRequest';
import { ParsedVoiceRequest } from '../types/voice';

export interface VoiceRequestPrefill {
  serviceCategory: ServiceCategory | null;
  description: string;
  scheduleDate: Date | null;
  startTime: string | null;
  endTime: string | null;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function mapParsedVoiceRequestToPrefill(
  parsedRequest: ParsedVoiceRequest
): VoiceRequestPrefill {
  const normalizedCategory =
    parsedRequest.category === 'unknown' ? null : parsedRequest.category;
  const description =
    parsedRequest.cleanedText.trim() || parsedRequest.issueSummary.trim() || parsedRequest.rawText.trim();

  if (!parsedRequest.preferredDateTime) {
    return {
      serviceCategory: normalizedCategory,
      description,
      scheduleDate: null,
      startTime: null,
      endTime: null,
    };
  }

  const parsedDate = new Date(parsedRequest.preferredDateTime);
  if (Number.isNaN(parsedDate.getTime())) {
    return {
      serviceCategory: normalizedCategory,
      description,
      scheduleDate: null,
      startTime: null,
      endTime: null,
    };
  }

  const endDate = new Date(parsedDate);
  endDate.setHours(endDate.getHours() + 1);

  return {
    serviceCategory: normalizedCategory,
    description,
    scheduleDate: parsedDate,
    startTime: formatTime(parsedDate),
    endTime: formatTime(endDate),
  };
}
