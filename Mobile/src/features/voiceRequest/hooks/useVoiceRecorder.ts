import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { VoicePermissionState } from '../types/voice';

export interface RecordedAudio {
  blob?: Blob | null;
  fileUri?: string | null;
  mimeType: string | null;
  durationMs: number | null;
}

interface UseVoiceRecorderResult {
  isSupported: boolean;
  isRecording: boolean;
  permissionState: VoicePermissionState;
  recordedBlob: Blob | null;
  mimeType: string | null;
  durationMs: number | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<RecordedAudio | null>;
  reset: () => void;
}

const WEB_STOP_TIMEOUT_MS = 4000;

function getRecorderSupport() {
  if (Platform.OS === 'web') {
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof globalThis.MediaRecorder !== 'undefined'
    );
  }

  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function useVoiceRecorder(): UseVoiceRecorderResult {
  const isSupported = useMemo(() => getRecorderSupport(), []);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionState, setPermissionState] = useState<VoicePermissionState>(
    isSupported ? 'idle' : 'unsupported'
  );
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunkBufferRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const nativeRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const reset = useCallback(() => {
    chunkBufferRef.current = [];
    setRecordedBlob(null);
    setMimeType(null);
    setDurationMs(null);
    setError(null);

    if (!isSupported) {
      setPermissionState('unsupported');
    }
  }, [isSupported]);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setPermissionState('unsupported');
      setError('Voice recording is not supported on this device.');
      throw new Error('Voice recording is not supported on this device.');
    }

    if (isRecording) {
      return;
    }

    reset();

    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);

        mediaStreamRef.current = stream;
        mediaRecorderRef.current = recorder;
        chunkBufferRef.current = [];
        startedAtRef.current = Date.now();
        setPermissionState('granted');

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunkBufferRef.current.push(event.data);
          }
        };

        recorder.onerror = () => {
          setError('We could not keep recording. Please try again.');
        };

        recorder.start();
        setIsRecording(true);
      } catch (recordingError) {
        setPermissionState('denied');
        setError('Microphone access was denied. Please allow microphone access and try again.');
        throw recordingError;
      }

      return;
    }

    try {
      const currentPermission = await getRecordingPermissionsAsync();
      if (!currentPermission.granted) {
        const requestedPermission = await requestRecordingPermissionsAsync();
        if (!requestedPermission.granted) {
          setPermissionState('denied');
          setError('Microphone access was denied. Please allow microphone access and try again.');
          throw new Error('Microphone permission denied.');
        }
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });

      await nativeRecorder.prepareToRecordAsync();
      nativeRecorder.record();
      startedAtRef.current = Date.now();
      setPermissionState('granted');
      setIsRecording(true);
    } catch (recordingError) {
      setPermissionState('denied');
      setError('Microphone access was denied. Please allow microphone access and try again.');
      throw recordingError;
    }
  }, [isRecording, isSupported, nativeRecorder, reset]);

  const stopRecording = useCallback(async () => {
    if (Platform.OS !== 'web') {
      if (!nativeRecorder) {
        return null;
      }

      await nativeRecorder.stop();

      const nextUri = nativeRecorder.uri ?? nativeRecorder.getStatus().url;
      const elapsedDuration = startedAtRef.current ? Date.now() - startedAtRef.current : null;

      startedAtRef.current = null;
      setIsRecording(false);

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });

      if (!nextUri) {
        setError('We could not access the recorded audio file.');
        return null;
      }

      const guessedMimeType =
        Platform.OS === 'ios'
          ? 'audio/mp4'
          : 'audio/mp4';

      const result = {
        fileUri: nextUri,
        blob: null,
        mimeType: guessedMimeType,
        durationMs: elapsedDuration,
      };

      setRecordedBlob(result?.blob ?? null);
      setMimeType(result?.mimeType ?? null);
      setDurationMs(result?.durationMs ?? null);
      return result;
    }

    if (!mediaRecorderRef.current) {
      return null;
    }

    const recorder = mediaRecorderRef.current;

    if (recorder.state === 'inactive') {
      stopStream(mediaStreamRef.current);
      mediaRecorderRef.current = null;
      mediaStreamRef.current = null;
      setIsRecording(false);
      return null;
    }

    return new Promise<RecordedAudio | null>((resolve) => {
      const timeoutId = setTimeout(() => {
        setError('We could not finish saving the recording. We will use what we heard instead.');
        setIsRecording(false);
        stopStream(mediaStreamRef.current);
        mediaRecorderRef.current = null;
        mediaStreamRef.current = null;
        chunkBufferRef.current = [];
        startedAtRef.current = null;
        resolve(null);
      }, WEB_STOP_TIMEOUT_MS);

      recorder.onstop = () => {
        clearTimeout(timeoutId);
        const completedBlob = new Blob(chunkBufferRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        const elapsedDuration = startedAtRef.current ? Date.now() - startedAtRef.current : null;
        const nextMimeType = recorder.mimeType || null;
        const result =
          completedBlob.size > 0
            ? {
                blob: completedBlob,
                mimeType: nextMimeType,
                durationMs: elapsedDuration,
              }
            : null;

        setRecordedBlob(result?.blob ?? null);
        setMimeType(result?.mimeType ?? null);
        setDurationMs(result?.durationMs ?? null);
        setIsRecording(false);
        stopStream(mediaStreamRef.current);
        mediaRecorderRef.current = null;
        mediaStreamRef.current = null;
        chunkBufferRef.current = [];
        startedAtRef.current = null;
        resolve(result);
      };

      recorder.stop();
    });
  }, [nativeRecorder]);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      if (Platform.OS === 'web') {
        stopStream(mediaStreamRef.current);
      }
    };
  }, []);

  return {
    isSupported,
    isRecording,
    permissionState,
    recordedBlob,
    mimeType,
    durationMs,
    error,
    startRecording,
    stopRecording,
    reset,
  };
}
