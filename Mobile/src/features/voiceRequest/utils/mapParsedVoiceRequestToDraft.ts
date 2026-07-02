import { ParsedVoiceRequest, VoiceRequestDraft } from '../types/voice';
import { extractBudgetRange } from './extractBudgetRange';
import { extractLocationHint } from './extractLocationHint';
import { extractPreferredDateTime } from './extractPreferredDateTime';

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function mapParsedVoiceRequestToDraft(parsedRequest: ParsedVoiceRequest): VoiceRequestDraft {
  const normalizedCategory =
    parsedRequest.category === 'unknown' ? null : parsedRequest.category;
  const transcriptDateTime = extractPreferredDateTime(
    parsedRequest.cleanedText || parsedRequest.rawText || ''
  );
  const preferredDateTimeValue =
    transcriptDateTime.preferredDateTime ?? parsedRequest.preferredDateTime ?? null;
  const preferredDate =
    preferredDateTimeValue ? new Date(preferredDateTimeValue) : null;
  const hasPreferredDate =
    preferredDate !== null && !Number.isNaN(preferredDate.getTime());

  const parsedDate =
    parsedRequest.preferredDateTime ? new Date(parsedRequest.preferredDateTime) : null;
  const parsedHasExplicitTime =
    parsedDate !== null &&
    !Number.isNaN(parsedDate.getTime()) &&
    (parsedDate.getHours() !== 0 || parsedDate.getMinutes() !== 0);
  const hasExplicitTime = transcriptDateTime.preferredDateTime
    ? transcriptDateTime.hasExplicitTime
    : parsedHasExplicitTime;

  const endDate = hasPreferredDate && hasExplicitTime ? new Date(preferredDate as Date) : null;
  if (endDate && hasExplicitTime) {
    endDate.setHours(endDate.getHours() + 1);
  }

  return {
    serviceCategory: normalizedCategory,
    summary:
      parsedRequest.issueSummary.trim() ||
      parsedRequest.cleanedText.trim() ||
      parsedRequest.rawText.trim(),
    spokenRequest:
      parsedRequest.cleanedText.trim() || parsedRequest.rawText.trim(),
    locationHint:
      parsedRequest.locationHint?.trim() ||
      extractLocationHint(parsedRequest.cleanedText || parsedRequest.rawText || '') ||
      '',
    preferredDate: hasPreferredDate ? preferredDate : null,
    startTime: hasPreferredDate && hasExplicitTime ? formatTime(preferredDate as Date) : null,
    endTime: endDate ? formatTime(endDate) : null,
    budgetRange:
      parsedRequest.budgetRange ??
      extractBudgetRange(parsedRequest.cleanedText || parsedRequest.rawText || ''),
    notes: parsedRequest.notes?.trim() ?? '',
    urgency: parsedRequest.urgency ?? null,
    requestLocation: null,
    confidence: parsedRequest.confidence ?? null,
    analysisSource: parsedRequest.analysisSource,
  };
}
