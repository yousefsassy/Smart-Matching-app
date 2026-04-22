import { useCallback, useEffect, useMemo, useState } from 'react';
import { transcriptionService as defaultTranscriptionService } from '../services/transcriptionService';
import { TranscriptionService, VoiceConfirmationStage } from '../types/voice';
import { getVoiceCaptureSupport } from '../utils/browserSupport';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useVoiceRecorder } from './useVoiceRecorder';

interface UseVoiceConfirmationFlowOptions {
  transcriptionService?: TranscriptionService;
}

interface UseVoiceConfirmationFlowResult {
  stage: VoiceConfirmationStage;
  support: ReturnType<typeof getVoiceCaptureSupport>;
  transcript: string;
  interimTranscript: string;
  errorMessage: string | null;
  permissionState: ReturnType<typeof useVoiceRecorder>['permissionState'];
  canStart: boolean;
  canStop: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<string | null>;
  reset: () => void;
  retry: () => void;
}

const TRANSCRIPTION_TIMEOUT_MS = 20000;

function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function normalizeTranscript(text: string) {
  return text.trim().replace(/\s+/g, ' ');
}

function withTimeout<T>(promise: Promise<T>, duration: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, duration);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export function useVoiceConfirmationFlow({
  transcriptionService = defaultTranscriptionService,
}: UseVoiceConfirmationFlowOptions = {}): UseVoiceConfirmationFlowResult {
  const voiceRecorder = useVoiceRecorder();
  const speechRecognition = useSpeechRecognition();
  const support = useMemo(
    () => getVoiceCaptureSupport(voiceRecorder.isSupported, speechRecognition.isSupported),
    [speechRecognition.isSupported, voiceRecorder.isSupported]
  );
  const [stage, setStage] = useState<VoiceConfirmationStage>(
    support.isVoiceFlowAvailable ? 'idle' : 'error'
  );
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(support.unavailableReason ?? null);

  const reset = useCallback(() => {
    voiceRecorder.reset();
    speechRecognition.reset();
    setTranscript('');
    setErrorMessage(support.isVoiceFlowAvailable ? null : support.unavailableReason ?? null);
    setStage(support.isVoiceFlowAvailable ? 'idle' : 'error');
  }, [speechRecognition, support.isVoiceFlowAvailable, support.unavailableReason, voiceRecorder]);

  const startListening = useCallback(async () => {
    if (!support.isVoiceFlowAvailable) {
      setStage('error');
      setErrorMessage(support.unavailableReason ?? 'Voice input is not available right now.');
      return;
    }

    voiceRecorder.reset();
    speechRecognition.reset();
    setTranscript('');
    setErrorMessage(null);

    let hasStarted = false;
    let nextErrorMessage: string | null = null;

    if (voiceRecorder.isSupported) {
      try {
        await voiceRecorder.startRecording();
        hasStarted = true;
      } catch {
        nextErrorMessage =
          voiceRecorder.error ?? 'We could not start recording. Please check your microphone.';
      }
    }

    if (speechRecognition.isSupported) {
      try {
        speechRecognition.start();
        hasStarted = true;
      } catch {
        nextErrorMessage =
          speechRecognition.error ??
          nextErrorMessage ??
          'Live speech recognition could not start in this browser.';
      }
    }

    if (!hasStarted) {
      setStage('error');
      setErrorMessage(nextErrorMessage ?? support.unavailableReason ?? 'Voice input could not start.');
      return;
    }

    setStage('listening');
  }, [speechRecognition, support.isVoiceFlowAvailable, support.unavailableReason, voiceRecorder]);

  const stopListening = useCallback(async () => {
    if (stage !== 'listening') {
      return null;
    }

    setStage('processing');
    speechRecognition.stop();

    const recordedAudio = voiceRecorder.isSupported ? await voiceRecorder.stopRecording() : null;
    await wait(250);

    try {
      const speechTranscript =
        speechRecognition.finalTranscript.trim() || speechRecognition.interimTranscript.trim();
      const finalTranscript = speechTranscript
        ? speechTranscript
        : (
            await withTimeout(
              transcriptionService.transcribe({
                audioBlob: recordedAudio?.blob ?? null,
                audioFileUri: recordedAudio?.fileUri ?? null,
                mimeType: recordedAudio?.mimeType ?? null,
                fallbackTranscript: speechTranscript || null,
              }),
              TRANSCRIPTION_TIMEOUT_MS,
              'Listening for confirmation took too long. Please try once more.'
            )
          ).transcript.trim();

      const normalizedTranscript = normalizeTranscript(finalTranscript);
      if (!normalizedTranscript) {
        throw new Error('We could not hear a clear confirmation. Please try again.');
      }

      setTranscript(normalizedTranscript);
      setErrorMessage(null);
      setStage('resolved');
      return normalizedTranscript;
    } catch (processingError) {
      setTranscript('');
      setStage('error');
      setErrorMessage(
        processingError instanceof Error
          ? processingError.message
          : 'We could not process that confirmation. Please try again.'
      );
      return null;
    }
  }, [speechRecognition, stage, transcriptionService, voiceRecorder]);

  const retry = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (!support.isVoiceFlowAvailable) {
      setStage('error');
      setErrorMessage(support.unavailableReason ?? 'Voice input is not available right now.');
    }
  }, [support.isVoiceFlowAvailable, support.unavailableReason]);

  useEffect(() => {
    const recorderError = voiceRecorder.error;
    const speechError = speechRecognition.error;

    if (stage === 'listening' && (recorderError || speechError) && !voiceRecorder.isRecording) {
      setErrorMessage(recorderError ?? speechError ?? null);
    }
  }, [
    speechRecognition.error,
    stage,
    voiceRecorder.error,
    voiceRecorder.isRecording,
  ]);

  return {
    stage,
    support,
    transcript,
    interimTranscript: speechRecognition.interimTranscript,
    errorMessage,
    permissionState: voiceRecorder.permissionState,
    canStart: support.isVoiceFlowAvailable && stage !== 'listening' && stage !== 'processing',
    canStop: stage === 'listening',
    startListening,
    stopListening,
    reset,
    retry,
  };
}
