import {
  ParsedVoiceRequest,
  RequestParserService,
  TranscriptionInput,
  TranscriptionResult,
  TranscriptionService,
} from '../types/voice';
import { appEnvironment } from '../../../config/appEnvironment';
import { mockRequestParserService } from './mockVoiceService';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GEMINI_REQUEST_TIMEOUT_MS = 15000;

const PARSED_REQUEST_SCHEMA = {
  type: 'object',
  properties: {
    rawText: { type: 'string' },
    cleanedText: { type: 'string' },
    category: {
      type: 'string',
      enum: ['plumbing', 'electrical', 'cleaning', 'gardening', 'painting', 'carpentry', 'moving', 'other', 'unknown'],
    },
    issueSummary: { type: 'string' },
    locationHint: { type: 'string' },
    preferredDateTime: { type: 'string' },
    budgetRange: {
      type: 'object',
      properties: {
        min: { type: 'number' },
        max: { type: 'number' },
        currency: { type: 'string' },
      },
      required: ['min', 'max', 'currency'],
    },
    urgency: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
    },
    notes: { type: 'string' },
    confidence: { type: 'number' },
  },
  required: ['rawText', 'cleanedText', 'category', 'issueSummary'],
} as const;

function getGeminiApiKey() {
  return appEnvironment.geminiApiKey;
}

function extractResponseText(payload: any): string {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return '';
  }

  return parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();
}

function normalizeTranscript(text: string) {
  return text.trim().replace(/\s+/g, ' ');
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Could not prepare the recording for Gemini.'));
        return;
      }

      const [, base64 = ''] = result.split(',');
      resolve(base64);
    };

    reader.onerror = () => reject(new Error('Could not read the recorded audio.'));
    reader.readAsDataURL(blob);
  });
}

async function callGemini(body: unknown) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is missing.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      throw new Error('Gemini took too long to respond.');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      'Gemini could not process this voice request right now.';
    throw new Error(message);
  }

  return payload;
}

export function isGeminiVoiceEnabled() {
  return Boolean(getGeminiApiKey());
}

export const geminiTranscriptionService: TranscriptionService = {
  async transcribe(input: TranscriptionInput): Promise<TranscriptionResult> {
    const fallbackTranscript = normalizeTranscript(input.fallbackTranscript ?? '');

    if (!input.audioBlob) {
      if (fallbackTranscript) {
        return {
          transcript: fallbackTranscript,
          source: 'speech-recognition',
          durationMs: null,
        };
      }

      throw new Error('No recorded audio was available for transcription.');
    }

    try {
      const base64Audio = await blobToBase64(input.audioBlob);
      const payload = await callGemini({
        contents: [
          {
            parts: [
              {
                text:
                  'Transcribe this maintenance or home-service request audio. Return only the spoken words as plain text. Do not add explanation, labels, or markdown.',
              },
              {
                inlineData: {
                  mimeType: input.mimeType || input.audioBlob.type || 'audio/webm',
                  data: base64Audio,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
        },
      });

      const transcript = normalizeTranscript(extractResponseText(payload));
      if (!transcript) {
        throw new Error('Gemini returned an empty transcript.');
      }

      return {
        transcript,
        source: 'gemini-audio',
        durationMs: null,
      };
    } catch (error) {
      if (fallbackTranscript) {
        return {
          transcript: fallbackTranscript,
          source: 'speech-recognition',
          durationMs: null,
        };
      }

      throw error;
    }
  },
};

export const geminiRequestParserService: RequestParserService = {
  async parse(rawText: string): Promise<ParsedVoiceRequest> {
    const cleanedInput = normalizeTranscript(rawText);
    if (!cleanedInput) {
      throw new Error('No transcript was available to analyze.');
    }

    try {
      const payload = await callGemini({
        contents: [
          {
            parts: [
              {
                text:
                  'You are analyzing a spoken maintenance or home-service request from an elderly user. Extract a structured request. Keep the original meaning, normalize wording lightly, infer service category conservatively, extract a spoken location hint when the transcript clearly mentions where the service is needed, extract budgetRange when the user mentions an amount or range such as 200 to 300 dinar, and only set preferredDateTime when the transcript clearly indicates a time or date. Preserve exact spoken calendar dates like April 25th or 25th of April instead of replacing them with today. Return valid JSON that matches the schema. If a field is unknown, omit it instead of guessing.',
              },
              {
                text: `Transcript: ${cleanedInput}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: PARSED_REQUEST_SCHEMA,
        },
      });

      const text = extractResponseText(payload);
      const parsed = JSON.parse(text) as ParsedVoiceRequest;

      return {
        rawText: cleanedInput,
        cleanedText: normalizeTranscript(parsed.cleanedText || cleanedInput),
        category: parsed.category || 'unknown',
        issueSummary: parsed.issueSummary || cleanedInput,
        locationHint: parsed.locationHint ?? null,
        preferredDateTime: parsed.preferredDateTime ?? null,
        budgetRange: parsed.budgetRange ?? null,
        urgency: parsed.urgency ?? null,
        notes: parsed.notes ?? null,
        confidence: parsed.confidence ?? null,
        analysisSource: 'gemini',
      };
    } catch {
      const fallback = await mockRequestParserService.parse(cleanedInput);
      return {
        ...fallback,
        analysisSource: 'mock',
      };
    }
  },
};
