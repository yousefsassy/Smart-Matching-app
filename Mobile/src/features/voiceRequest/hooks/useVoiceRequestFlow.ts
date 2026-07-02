import { useCallback, useEffect, useMemo, useState } from 'react';
import { requestParserService as defaultRequestParserService } from '../services/requestParserService';
import { transcriptionService as defaultTranscriptionService } from '../services/transcriptionService';
import {
  ParsedVoiceRequest,
  RequestParserService,
  TranscriptionResult,
  TranscriptionService,
  VoiceCaptureSupport,
  VoiceRequestStage,
} from '../types/voice';
import { getVoiceCaptureSupport } from '../utils/browserSupport';
import { extractPreferredDateTime } from '../utils/extractPreferredDateTime';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useVoiceRecorder } from './useVoiceRecorder';

interface UseVoiceRequestFlowOptions {
  onConfirm?: (parsedRequest: ParsedVoiceRequest) => void;
  transcriptionService?: TranscriptionService;
  requestParserService?: RequestParserService;
}

interface UseVoiceRequestFlowResult {
  stage: VoiceRequestStage;
  support: VoiceCaptureSupport;
  transcript: string;
  interimTranscript: string;
  parsedRequest: ParsedVoiceRequest | null;
  errorMessage: string | null;
  transcriptionSource: TranscriptionResult['source'] | null;
  permissionState: ReturnType<typeof useVoiceRecorder>['permissionState'];
  isBusy: boolean;
  canStart: boolean;
  canStop: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  confirmReview: () => void;
  retry: () => void;
  cancel: () => void;
}

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

const TRANSCRIPTION_TIMEOUT_MS = 40000;
const PARSE_TIMEOUT_MS = 12000;

export function useVoiceRequestFlow({
  onConfirm,
  transcriptionService = defaultTranscriptionService,
  requestParserService = defaultRequestParserService,
}: UseVoiceRequestFlowOptions = {}): UseVoiceRequestFlowResult {
  const voiceRecorder = useVoiceRecorder();
  const speechRecognition = useSpeechRecognition();
  const support = useMemo(
    () => getVoiceCaptureSupport(voiceRecorder.isSupported, speechRecognition.isSupported),
    [speechRecognition.isSupported, voiceRecorder.isSupported]
  );

  const [stage, setStage] = useState<VoiceRequestStage>(
    support.isVoiceFlowAvailable ? 'idle' : 'error'
  );
  const [transcript, setTranscript] = useState('');
  const [parsedRequest, setParsedRequest] = useState<ParsedVoiceRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(support.unavailableReason ?? null);
  const [transcriptionSource, setTranscriptionSource] = useState<TranscriptionResult['source'] | null>(null);

  const resetState = useCallback(
    (nextStage: VoiceRequestStage) => {
      voiceRecorder.reset();
      speechRecognition.reset();
      setTranscript('');
      setParsedRequest(null);
      setTranscriptionSource(null);
      setErrorMessage(nextStage === 'error' ? support.unavailableReason ?? null : null);
      setStage(nextStage);
    },
    [speechRecognition, support.unavailableReason, voiceRecorder]
  );

  const startListening = useCallback(async () => {
    if (!support.isVoiceFlowAvailable) {
      setStage('error');
      setErrorMessage(support.unavailableReason ?? 'Voice input is not available right now.');
      return;
    }

    voiceRecorder.reset();
    speechRecognition.reset();
    setTranscript('');
    setParsedRequest(null);
    setTranscriptionSource(null);
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
  }, [
    speechRecognition,
    support.isVoiceFlowAvailable,
    support.unavailableReason,
    voiceRecorder,
  ]);

  const stopListening = useCallback(async () => {
    if (stage !== 'listening') {
      return;
    }

    setStage('processing');
    speechRecognition.stop();

    const recordedAudio = voiceRecorder.isSupported ? await voiceRecorder.stopRecording() : null;
    await wait(250);

    try {
      const speechTranscript =
        speechRecognition.finalTranscript.trim() || speechRecognition.interimTranscript.trim();

      const transcriptionResult = speechTranscript
        ? {
            transcript: speechTranscript,
            source: 'speech-recognition' as const,
            durationMs: recordedAudio?.durationMs ?? null,
          }
        : await withTimeout(
            transcriptionService.transcribe({
              audioBlob: recordedAudio?.blob ?? null,
              audioFileUri: recordedAudio?.fileUri ?? null,
              mimeType: recordedAudio?.mimeType ?? null,
              fallbackTranscript: speechTranscript || null,
            }),
            TRANSCRIPTION_TIMEOUT_MS,
            'Preparing your request took too long. Please try again.'
          );

      const nextTranscript = transcriptionResult.transcript.trim();
      if (!nextTranscript) {
        throw new Error('We could not hear a clear request. Please try again.');
      }

      const nextParsedRequest = await withTimeout(
        requestParserService.parse(nextTranscript),
        PARSE_TIMEOUT_MS,
        'We heard you, but preparing the request took too long. Please try once more.'
      );
      const transcriptDateTime = extractPreferredDateTime(nextTranscript);
      const normalizedTranscript = normalizeTranscript(nextTranscript);
      setTranscript(nextTranscript);
      setTranscriptionSource(transcriptionResult.source);
      setParsedRequest({
        ...nextParsedRequest,
        rawText: normalizedTranscript,
        cleanedText: normalizedTranscript,
        preferredDateTime:
          transcriptDateTime.preferredDateTime ?? nextParsedRequest.preferredDateTime ?? null,
      });
      setErrorMessage(null);
      setStage('review');
    } catch (processingError) {
      setStage('error');
      setParsedRequest(null);
      setTranscript('');
      setErrorMessage(
        processingError instanceof Error
          ? processingError.message
          : 'We could not process the recording. Please try again.'
      );
    }
  }, [
    requestParserService,
    speechRecognition,
    stage,
    transcriptionService,
    voiceRecorder,
  ]);

  const confirmReview = useCallback(() => {
    if (!parsedRequest) {
      return;
    }

    onConfirm?.(parsedRequest);
    setStage('confirmed');
    setErrorMessage(null);
  }, [onConfirm, parsedRequest]);

  const retry = useCallback(() => {
    resetState(support.isVoiceFlowAvailable ? 'idle' : 'error');
  }, [resetState, support.isVoiceFlowAvailable]);

  const cancel = useCallback(() => {
    resetState(support.isVoiceFlowAvailable ? 'idle' : 'error');
  }, [resetState, support.isVoiceFlowAvailable]);

  useEffect(() => {
    if (!support.isVoiceFlowAvailable) {
      setStage('error');
      setErrorMessage(support.unavailableReason ?? 'Voice input is not available right now.');
    } else if (stage === 'error' && errorMessage === support.unavailableReason) {
      setStage('idle');
      setErrorMessage(null);
    }
  }, [errorMessage, stage, support.isVoiceFlowAvailable, support.unavailableReason]);

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
    parsedRequest,
    errorMessage,
    transcriptionSource,
    permissionState: voiceRecorder.permissionState,
    isBusy: stage === 'processing',
    canStart: support.isVoiceFlowAvailable && stage !== 'listening' && stage !== 'processing',
    canStop: stage === 'listening',
    startListening,
    stopListening,
    confirmReview,
    retry,
    cancel,
  };
}
