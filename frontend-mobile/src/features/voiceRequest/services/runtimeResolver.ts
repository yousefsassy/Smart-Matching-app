import { VoiceRuntime } from '../types/voice';
import { resolveVoiceRuntimeConfig } from '../../../config/appEnvironment';

export function resolveVoiceRuntime(): VoiceRuntime {
  return resolveVoiceRuntimeConfig();
}

export function isVoiceRuntime(runtime: VoiceRuntime) {
  return resolveVoiceRuntime() === runtime;
}
