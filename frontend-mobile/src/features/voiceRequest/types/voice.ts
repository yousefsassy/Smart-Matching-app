import { BudgetRange, ServiceCategory } from '../../../types/serviceRequest';
import { NormalizedLocation } from '../../../types/location';

export type VoiceRequestStage =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'review'
  | 'confirmed'
  | 'error';

export type VoiceVisualTone =
  | 'resting'
  | 'listening'
  | 'processing'
  | 'review'
  | 'success'
  | 'error';

export type VoiceRuntime = 'backend' | 'gemini' | 'mock';
export type VoicePermissionState = 'idle' | 'granted' | 'denied' | 'unsupported';
export type VoiceRequestEntrySource = 'dashboard-fab' | 'create-request';
export type VoiceRequestPhase =
  | 'capturingRequest'
  | 'reviewingDraft'
  | 'awaitingConfirmation'
  | 'listeningForConfirmation'
  | 'submittingRequest'
  | 'navigatingToMatching';
export type VoiceConfirmationStage =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'resolved'
  | 'error';
export type VoiceConfirmationIntent =
  | 'confirm'
  | 'reject'
  | 'restart'
  | 'ambiguous'
  | 'unknown';

export interface VoiceCaptureSupport {
  canRecordAudio: boolean;
  hasSpeechRecognition: boolean;
  isVoiceFlowAvailable: boolean;
  unavailableReason?: string | null;
}

export interface TranscriptionInput {
  audioBlob?: Blob | null;
  audioFileUri?: string | null;
  mimeType?: string | null;
  fallbackTranscript?: string | null;
}

export interface TranscriptionResult {
  transcript: string;
  source:
    | 'speech-recognition'
    | 'audio-upload'
    | 'mock-fallback'
    | 'gemini-audio'
    | 'backend-api';
  durationMs?: number | null;
}

export interface ParsedVoiceRequest {
  rawText: string;
  cleanedText: string;
  category: ServiceCategory | 'unknown';
  issueSummary: string;
  locationHint?: string | null;
  preferredDateTime?: string | null;
  budgetRange?: BudgetRange | null;
  urgency?: 'low' | 'medium' | 'high' | null;
  notes?: string | null;
  confidence?: number | null;
  analysisSource?: 'mock' | 'gemini' | 'speech-recognition' | 'backend';
}

export interface VoiceRequestDraft {
  serviceCategory: ServiceCategory | null;
  summary: string;
  spokenRequest: string;
  locationHint: string;
  preferredDate: Date | null;
  startTime: string | null;
  endTime: string | null;
  budgetRange: BudgetRange | null;
  notes: string;
  urgency: 'low' | 'medium' | 'high' | null;
  requestLocation: NormalizedLocation | null;
  confidence: number | null;
  analysisSource?: ParsedVoiceRequest['analysisSource'];
}

export type VoiceReviewStep = 'review' | 'edit';

export type VoiceDraftIssueField =
  | 'serviceCategory'
  | 'summary'
  | 'preferredDate'
  | 'preferredTime'
  | 'requestLocation';

export interface VoiceDraftIssue {
  field: VoiceDraftIssueField;
  title: string;
  prompt: string;
}

export interface VoiceStageDescriptor {
  eyebrow: string;
  title: string;
  body: string;
  statusLabel: string;
  announcement: string;
  tone: VoiceVisualTone;
  primaryActionLabel?: string;
  primaryActionHint?: string;
}

export interface TranscriptionService {
  transcribe(input: TranscriptionInput): Promise<TranscriptionResult>;
}

export interface RequestParserService {
  parse(rawText: string): Promise<ParsedVoiceRequest>;
}

export interface VoiceConfirmationCommand {
  normalizedTranscript: string;
  intent: VoiceConfirmationIntent;
}
