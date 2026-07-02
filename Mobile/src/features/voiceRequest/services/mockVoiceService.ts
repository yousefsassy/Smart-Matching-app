import {
  ParsedVoiceRequest,
  RequestParserService,
  TranscriptionInput,
  TranscriptionResult,
  TranscriptionService,
} from '../types/voice';
import { extractBudgetRange } from '../utils/extractBudgetRange';
import { extractLocationHint } from '../utils/extractLocationHint';
import { extractPreferredDateTime } from '../utils/extractPreferredDateTime';

const MOCK_TRANSCRIPTION_DELAY_MS = 900;
const MOCK_PARSER_DELAY_MS = 650;
const FALLBACK_TRANSCRIPTS = [
  'My sink is leaking in the kitchen.',
  'I need a plumber at 9 AM tomorrow.',
  'The light in the kitchen is broken.',
];

function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function normalizeTranscript(text: string) {
  return text.trim().replace(/\s+/g, ' ');
}

function inferCategory(text: string): ParsedVoiceRequest['category'] {
  const normalized = text.toLowerCase();

  if (/(sink|plumb|pipe|toilet|drain|water|leak|faucet|tap)/.test(normalized)) {
    return 'plumbing';
  }

  if (/(light|electric|power|socket|switch|wiring|lamp|outlet)/.test(normalized)) {
    return 'electrical';
  }

  if (/(clean|dirty|sweep|wash|mop|vacuum)/.test(normalized)) {
    return 'cleaning';
  }

  if (/(garden|yard|grass|tree|plant)/.test(normalized)) {
    return 'gardening';
  }

  if (/(paint|wall|ceiling|color)/.test(normalized)) {
    return 'painting';
  }

  if (/(wood|cabinet|door|table|chair|furniture|carpenter)/.test(normalized)) {
    return 'carpentry';
  }

  if (/(move|moving|boxes|transport|carry)/.test(normalized)) {
    return 'moving';
  }

  if (/(service|repair|help|fix)/.test(normalized)) {
    return 'other';
  }

  return 'unknown';
}

function inferUrgency(text: string): ParsedVoiceRequest['urgency'] {
  const normalized = text.toLowerCase();

  if (/(urgent|asap|immediately|right away|emergency)/.test(normalized)) {
    return 'high';
  }

  if (/(soon|today|this afternoon|this evening)/.test(normalized)) {
    return 'medium';
  }

  if (text.trim()) {
    return 'low';
  }

  return null;
}

function summarizeIssue(text: string, category: ParsedVoiceRequest['category']) {
  const cleaned = normalizeTranscript(text);

  if (!cleaned) {
    return 'No issue was detected.';
  }

  switch (category) {
    case 'plumbing':
      return cleaned.includes('sink') ? 'Sink issue needs plumbing help.' : 'Plumbing help is needed.';
    case 'electrical':
      return cleaned.includes('light') ? 'A light fixture needs electrical repair.' : 'Electrical help is needed.';
    case 'cleaning':
      return 'Cleaning help is needed.';
    case 'gardening':
      return 'Gardening help is needed.';
    case 'painting':
      return 'Painting help is needed.';
    case 'carpentry':
      return 'Carpentry help is needed.';
    case 'moving':
      return 'Moving help is needed.';
    case 'other':
      return 'General maintenance help is needed.';
    default:
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
}

function inferConfidence(category: ParsedVoiceRequest['category'], preferredDateTime: string | null) {
  let confidence = category === 'unknown' ? 0.56 : 0.84;

  if (preferredDateTime) {
    confidence += 0.06;
  }

  return Math.min(0.97, Number(confidence.toFixed(2)));
}

export const mockTranscriptionService: TranscriptionService = {
  async transcribe(input: TranscriptionInput): Promise<TranscriptionResult> {
    await wait(MOCK_TRANSCRIPTION_DELAY_MS);

    const fallbackTranscript = normalizeTranscript(input.fallbackTranscript ?? '');
    if (fallbackTranscript) {
      return {
        transcript: fallbackTranscript,
        source: 'speech-recognition',
        durationMs: null,
      };
    }

    const blobSize = input.audioBlob?.size ?? 0;
    const selectedTranscript = FALLBACK_TRANSCRIPTS[blobSize % FALLBACK_TRANSCRIPTS.length];

    return {
      transcript: selectedTranscript,
      source: input.audioBlob ? 'audio-upload' : 'mock-fallback',
      durationMs: null,
    };
  },
};

export const mockRequestParserService: RequestParserService = {
  async parse(rawText: string): Promise<ParsedVoiceRequest> {
    await wait(MOCK_PARSER_DELAY_MS);

    const cleanedText = normalizeTranscript(rawText);
    const category = inferCategory(cleanedText);
    const locationHint = extractLocationHint(cleanedText);
    const preferredDateTime = extractPreferredDateTime(cleanedText).preferredDateTime;
    const budgetRange = extractBudgetRange(cleanedText);
    const urgency = inferUrgency(cleanedText);

    return {
      rawText,
      cleanedText,
      category,
      issueSummary: summarizeIssue(cleanedText, category),
      locationHint,
      preferredDateTime,
      budgetRange,
      urgency,
      notes: null,
      confidence: inferConfidence(category, preferredDateTime),
      analysisSource: 'mock',
    };
  },
};
