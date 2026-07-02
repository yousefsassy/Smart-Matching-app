import {
  backendTranscriptionService,
  isVoiceBackendEnabled,
} from './backendVoiceService';
import { geminiTranscriptionService, isGeminiVoiceEnabled } from './geminiVoiceService';
import { mockTranscriptionService } from './mockVoiceService';
import { TranscriptionService } from '../types/voice';
import { resolveVoiceRuntime } from './runtimeResolver';

export type { TranscriptionService } from '../types/voice';

const transcriptionServicesByRuntime = {
  backend: backendTranscriptionService,
  gemini: geminiTranscriptionService,
  mock: mockTranscriptionService,
} satisfies Record<string, TranscriptionService>;

export const transcriptionService: TranscriptionService =
  transcriptionServicesByRuntime[resolveVoiceRuntime()];

export const isGeminiTranscriptionEnabled = isGeminiVoiceEnabled;
export const isVoiceBackendTranscriptionEnabled = isVoiceBackendEnabled;
