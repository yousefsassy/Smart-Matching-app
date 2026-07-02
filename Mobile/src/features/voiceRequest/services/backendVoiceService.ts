import {
  ParsedVoiceRequest,
  RequestParserService,
  TranscriptionInput,
  TranscriptionResult,
  TranscriptionService,
} from '../types/voice';
import { appEnvironment, isVoiceBackendConfigured } from '../../../config/appEnvironment';
import {
  fetchWithTimeout,
  joinUrl,
  parseJsonResponse,
} from '../../../services/shared/http';

const BACKEND_REQUEST_TIMEOUT_MS = 30000;

function getBackendBaseUrl() {
  return appEnvironment.voiceBackendUrl;
}

export function isVoiceBackendEnabled() {
  return isVoiceBackendConfigured();
}

function normalizeTranscript(text: string) {
  return text.trim().replace(/\s+/g, ' ');
}

function buildCacheKey(text: string) {
  return normalizeTranscript(text).toLowerCase();
}

const parsedRequestCache = new Map<string, ParsedVoiceRequest>();

function normalizeBackendParsedRequest(value: any, transcript?: string): ParsedVoiceRequest {
  const normalizedTranscript = normalizeTranscript(transcript ?? value?.rawText ?? value?.cleanedText ?? '');

  return {
    rawText: normalizedTranscript,
    cleanedText: normalizeTranscript(value?.cleanedText ?? normalizedTranscript),
    category: value?.category ?? 'unknown',
    issueSummary: value?.issueSummary ?? normalizedTranscript,
    locationHint: value?.locationHint ?? null,
    preferredDateTime: value?.preferredDateTime ?? null,
    budgetRange: value?.budgetRange ?? null,
    urgency: value?.urgency ?? null,
    notes: value?.notes ?? null,
    confidence: value?.confidence ?? null,
    analysisSource: value?.analysisSource ?? 'backend',
  };
}

export const backendTranscriptionService: TranscriptionService = {
  async transcribe(input: TranscriptionInput): Promise<TranscriptionResult> {
    const formData = new FormData();
    const normalizedFallbackTranscript = normalizeTranscript(input.fallbackTranscript ?? '');

    if (normalizedFallbackTranscript) {
      return {
        transcript: normalizedFallbackTranscript,
        source: 'speech-recognition',
        durationMs: null,
      };
    }

    if (input.audioFileUri) {
      const filename = `voice-request.${input.mimeType?.includes('mp4') ? 'm4a' : 'webm'}`;
      formData.append('audio', {
        uri: input.audioFileUri,
        type: input.mimeType || 'audio/mp4',
        name: filename,
      } as unknown as Blob);
    } else if (input.audioBlob) {
      const filename = `voice-request.${input.mimeType?.includes('mp4') ? 'm4a' : 'webm'}`;
      formData.append('audio', input.audioBlob, filename);
    }

    const response = await fetchWithTimeout(joinUrl(getBackendBaseUrl(), '/voice/analyze'), {
      method: 'POST',
      body: formData,
    }, BACKEND_REQUEST_TIMEOUT_MS);

    const payload = await parseJsonResponse<Record<string, unknown>>(
      response,
      'Voice backend request failed.'
    );
    const transcript = normalizeTranscript(String(payload.transcript ?? ''));
    const parsedRequest = payload.parsedRequest
      ? normalizeBackendParsedRequest(payload.parsedRequest, transcript)
      : null;

    if (!transcript) {
      throw new Error('Voice backend returned an empty transcript.');
    }

    if (parsedRequest) {
      parsedRequestCache.set(buildCacheKey(transcript), parsedRequest);
    }

    return {
      transcript,
      source: 'backend-api',
      durationMs: null,
    };
  },
};

export const backendRequestParserService: RequestParserService = {
  async parse(rawText: string): Promise<ParsedVoiceRequest> {
    const cacheKey = buildCacheKey(rawText);
    const cached = parsedRequestCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await fetchWithTimeout(joinUrl(getBackendBaseUrl(), '/voice/parse'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript: rawText }),
    }, BACKEND_REQUEST_TIMEOUT_MS);

    const payload = await parseJsonResponse<{ parsedRequest?: unknown }>(
      response,
      'Voice backend request failed.'
    );
    const parsedRequest = normalizeBackendParsedRequest(payload.parsedRequest, rawText);
    parsedRequestCache.set(cacheKey, parsedRequest);
    return parsedRequest;
  },
};
