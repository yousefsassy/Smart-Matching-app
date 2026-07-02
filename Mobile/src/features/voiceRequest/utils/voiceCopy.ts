import {
  VoiceCaptureSupport,
  VoicePermissionState,
  VoiceRequestStage,
  VoiceStageDescriptor,
} from '../types/voice';

interface GetVoiceStageDescriptorOptions {
  stage: VoiceRequestStage;
  support: VoiceCaptureSupport;
  permissionState: VoicePermissionState;
  missingDetailsCount?: number;
}

export function getVoiceStageDescriptor({
  stage,
  support,
  permissionState,
  missingDetailsCount = 0,
}: GetVoiceStageDescriptorOptions): VoiceStageDescriptor {
  if (!support.isVoiceFlowAvailable) {
    return {
      eyebrow: 'Guided voice request',
      title: 'The voice assistant is unavailable right now',
      body: support.unavailableReason ?? 'You can still complete the request comfortably in the guided form below.',
      statusLabel: 'Voice unavailable',
      announcement: support.unavailableReason ?? 'Voice input is unavailable right now.',
      tone: 'error',
      primaryActionLabel: 'Continue in the form',
      primaryActionHint: 'Moves you to the guided request form below.',
    };
  }

  switch (stage) {
    case 'listening':
      return {
        eyebrow: 'Guided voice request',
        title: 'We’re listening',
        body: 'Speak naturally. A short sentence is enough, and you can stop whenever you are ready.',
        statusLabel: 'Listening now',
        announcement: 'The voice assistant is now listening.',
        tone: 'listening',
        primaryActionLabel: 'Finish speaking',
        primaryActionHint: 'Stops listening and prepares your request.',
      };
    case 'processing':
      return {
        eyebrow: 'Guided voice request',
        title: 'We’re preparing your request',
        body: 'Please hold on for a moment while we shape your words into a clear service request.',
        statusLabel: 'Preparing your request',
        announcement: 'Your request is being prepared.',
        tone: 'processing',
      };
    case 'review':
      return {
        eyebrow: 'Prepared for you',
        title: 'Here is the request we prepared for you',
        body: 'Please review it calmly. You can use it, say it again, or continue in the form.',
        statusLabel: 'Review your request',
        announcement: 'Your prepared request is ready for review.',
        tone: 'review',
      };
    case 'confirmed':
      return {
        eyebrow: 'Request prepared',
        title:
          missingDetailsCount > 0
            ? 'Your request has been prepared'
            : 'Your request is ready',
        body:
          missingDetailsCount > 0
            ? 'We filled in what we understood. A few final details will help us finish it properly.'
            : 'We captured the important details. You can continue below whenever you are ready.',
        statusLabel:
          missingDetailsCount > 0
            ? 'Prepared with a few details remaining'
            : 'Prepared and ready to continue',
        announcement:
          missingDetailsCount > 0
            ? 'Your request was prepared, and a few details still need to be added.'
            : 'Your request was prepared and is ready to continue.',
        tone: 'success',
      };
    case 'error':
      return {
        eyebrow: 'Guided voice request',
        title:
          permissionState === 'denied'
            ? 'Microphone access is needed'
            : 'We could not finish that voice request',
        body:
          permissionState === 'denied'
            ? 'Please allow microphone access if you would like to speak your request. You can also continue with the form below.'
            : 'Please try once more, or continue with the guided form below if you prefer.',
        statusLabel:
          permissionState === 'denied' ? 'Microphone access needed' : 'Voice request interrupted',
        announcement:
          permissionState === 'denied'
            ? 'Microphone access is needed for voice requests.'
            : 'The voice request could not be completed.',
        tone: 'error',
        primaryActionLabel:
          permissionState === 'denied' ? 'Continue in the form' : 'Try again',
        primaryActionHint:
          permissionState === 'denied'
            ? 'Moves you to the guided request form below.'
            : 'Restarts the voice request.',
      };
    case 'idle':
    default:
      return {
        eyebrow: '',
        title: 'Speak your request',
        body: '',
        statusLabel: 'Ready to listen',
        announcement: 'The voice assistant is ready.',
        tone: 'resting',
        primaryActionLabel: 'Begin speaking',
        primaryActionHint: 'Starts listening to your request.',
      };
  }
}
