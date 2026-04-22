import {
  backendRequestParserService,
  isVoiceBackendEnabled,
} from './backendVoiceService';
import { geminiRequestParserService, isGeminiVoiceEnabled } from './geminiVoiceService';
import { mockRequestParserService } from './mockVoiceService';
import { RequestParserService } from '../types/voice';
import { resolveVoiceRuntime } from './runtimeResolver';

export type { RequestParserService } from '../types/voice';

const requestParserServicesByRuntime = {
  backend: backendRequestParserService,
  gemini: geminiRequestParserService,
  mock: mockRequestParserService,
} satisfies Record<string, RequestParserService>;

export const requestParserService: RequestParserService =
  requestParserServicesByRuntime[resolveVoiceRuntime()];

export const isGeminiParserEnabled = isGeminiVoiceEnabled;
export const isVoiceBackendParserEnabled = isVoiceBackendEnabled;
