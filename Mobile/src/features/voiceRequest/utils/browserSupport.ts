import { VoiceCaptureSupport } from '../types/voice';

export function getVoiceCaptureSupport(
  canRecordAudio: boolean,
  hasSpeechRecognition: boolean
): VoiceCaptureSupport {
  if (canRecordAudio || hasSpeechRecognition) {
    return {
      canRecordAudio,
      hasSpeechRecognition,
      isVoiceFlowAvailable: true,
      unavailableReason: null,
    };
  }

  return {
    canRecordAudio,
    hasSpeechRecognition,
    isVoiceFlowAvailable: false,
    unavailableReason:
      'Voice input is not available on this device yet. You can still fill in the form below.',
  };
}
