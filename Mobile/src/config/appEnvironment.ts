import { VoiceRuntime } from '../features/voiceRequest/types/voice';

export type RequestsRuntime = 'mock' | 'backend';

function readEnv(name: string) {
  return process.env[name]?.trim() ?? '';
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, '');
}

function resolveConfiguredVoiceBackendUrl() {
  return normalizeBaseUrl(readEnv('EXPO_PUBLIC_VOICE_BACKEND_URL'));
}

function coerceVoiceRuntime(value: string): VoiceRuntime | null {
  if (value === 'backend' || value === 'gemini' || value === 'mock') {
    return value;
  }

  return null;
}

function coerceRequestsRuntime(value: string): RequestsRuntime | null {
  if (value === 'backend' || value === 'mock') {
    return value;
  }

  return null;
}

const appApiBaseUrl = normalizeBaseUrl(readEnv('EXPO_PUBLIC_APP_API_BASE_URL'));
const voiceBackendUrl = resolveConfiguredVoiceBackendUrl();
const geminiApiKey = readEnv('EXPO_PUBLIC_GEMINI_API_KEY');
const preferredVoiceRuntime = coerceVoiceRuntime(readEnv('EXPO_PUBLIC_VOICE_RUNTIME'));
const preferredRequestsRuntime = coerceRequestsRuntime(readEnv('EXPO_PUBLIC_REQUESTS_RUNTIME'));

export const appEnvironment = {
  appApiBaseUrl,
  voiceBackendUrl,
  geminiApiKey,
  preferredVoiceRuntime,
  preferredRequestsRuntime,
} as const;

export function isAppBackendConfigured() {
  return Boolean(appEnvironment.appApiBaseUrl);
}

export function isVoiceBackendConfigured() {
  return Boolean(appEnvironment.voiceBackendUrl);
}

export function isGeminiConfigured() {
  return Boolean(appEnvironment.geminiApiKey);
}

export function resolveVoiceRuntimeConfig(): VoiceRuntime {
  if (appEnvironment.preferredVoiceRuntime) {
    return appEnvironment.preferredVoiceRuntime;
  }

  if (isVoiceBackendConfigured()) {
    return 'backend';
  }

  if (isGeminiConfigured()) {
    return 'gemini';
  }

  return 'mock';
}

export function resolveRequestsRuntimeConfig(): RequestsRuntime {
  if (appEnvironment.preferredRequestsRuntime) {
    return appEnvironment.preferredRequestsRuntime;
  }

  return isAppBackendConfigured() ? 'backend' : 'mock';
}
