import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
  length: number;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionLike;
}

interface UseSpeechRecognitionResult {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  finalTranscript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructorLike | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  const availableConstructor =
    (window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructorLike;
      webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
    }).SpeechRecognition ??
    (window as Window & {
      webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
    }).webkitSpeechRecognition;

  return availableConstructor ?? null;
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const recognitionConstructor = useMemo(() => getSpeechRecognitionConstructor(), []);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const reset = useCallback(() => {
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
  }, []);

  const start = useCallback(() => {
    if (!recognitionConstructor) {
      return;
    }

    reset();

    const recognition = new recognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let nextInterimTranscript = '';
      let nextFinalTranscript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcriptSegment = result[0]?.transcript ?? '';

        if (result.isFinal) {
          nextFinalTranscript += transcriptSegment;
        } else {
          nextInterimTranscript += transcriptSegment;
        }
      }

      setInterimTranscript(nextInterimTranscript.trim());
      setFinalTranscript((current) =>
        `${current} ${nextFinalTranscript}`.trim()
      );
    };

    recognition.onerror = (event) => {
      const nextError =
        event.error === 'not-allowed'
          ? 'Live speech recognition was blocked. You can still use the recorded audio path.'
          : 'Live speech recognition could not understand the request clearly.';
      setError(nextError);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [recognitionConstructor, reset]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    isSupported: !!recognitionConstructor,
    isListening,
    interimTranscript,
    finalTranscript,
    error,
    start,
    stop,
    reset,
  };
}
