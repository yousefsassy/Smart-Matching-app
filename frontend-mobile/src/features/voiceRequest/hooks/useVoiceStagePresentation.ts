import { useMemo } from 'react';
import { VoiceCaptureSupport, VoicePermissionState, VoiceRequestStage } from '../types/voice';
import { getVoiceStageDescriptor } from '../utils/voiceCopy';

interface UseVoiceStagePresentationOptions {
  stage: VoiceRequestStage;
  support: VoiceCaptureSupport;
  permissionState: VoicePermissionState;
  missingDetailsCount?: number;
}

export function useVoiceStagePresentation({
  stage,
  support,
  permissionState,
  missingDetailsCount = 0,
}: UseVoiceStagePresentationOptions) {
  return useMemo(
    () =>
      getVoiceStageDescriptor({
        stage,
        support,
        permissionState,
        missingDetailsCount,
      }),
    [missingDetailsCount, permissionState, stage, support]
  );
}
