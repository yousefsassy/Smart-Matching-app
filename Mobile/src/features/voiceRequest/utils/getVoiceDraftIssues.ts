import { normalizeTimeValue } from '../../../components/ServiceRequest/ScheduleStep';
import { VoiceDraftIssue, VoiceRequestDraft } from '../types/voice';

export function getVoiceDraftIssues(draft: VoiceRequestDraft): VoiceDraftIssue[] {
  const issues: VoiceDraftIssue[] = [];

  if (!draft.serviceCategory) {
    issues.push({
      field: 'serviceCategory',
      title: 'Service needed',
      prompt: 'Please confirm the type of service you need.',
    });
  }

  if (!draft.summary.trim() || draft.summary.trim().length < 10) {
    issues.push({
      field: 'summary',
      title: 'Problem summary',
      prompt: 'Please add a short summary so providers know what needs attention.',
    });
  }

  if (!draft.requestLocation) {
    issues.push({
      field: 'requestLocation',
      title: 'Service location',
      prompt: 'Please add the location where the service is needed.',
    });
  }

  if (!draft.preferredDate) {
    issues.push({
      field: 'preferredDate',
      title: 'Preferred day',
      prompt: 'Please choose the day you would like the visit to happen.',
    });
  }

  const normalizedStart = normalizeTimeValue(draft.startTime);
  const normalizedEnd = normalizeTimeValue(draft.endTime);
  if (!normalizedStart || !normalizedEnd || normalizedEnd <= normalizedStart) {
    issues.push({
      field: 'preferredTime',
      title: 'Preferred time',
      prompt: 'Please choose a start and end time for the visit.',
    });
  }

  return issues;
}

export function isVoiceDraftLowConfidence(draft: VoiceRequestDraft) {
  return (draft.confidence ?? 1) < 0.75;
}
