import {
  VoiceConfirmationCommand,
  VoiceConfirmationIntent,
} from '../types/voice';

const CONFIRM_PHRASES = [
  'yes confirm',
  'confirm request',
  'go ahead',
  'proceed',
  'confirm',
  'yes',
] as const;

const RESTART_PHRASES = ['start over'] as const;
const REJECT_PHRASES = ['cancel', 'no'] as const;

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function includesPhrase(normalizedTranscript: string, phrase: string) {
  return (
    normalizedTranscript === phrase ||
    normalizedTranscript.startsWith(`${phrase} `) ||
    normalizedTranscript.endsWith(` ${phrase}`) ||
    normalizedTranscript.includes(` ${phrase} `)
  );
}

function hasAnyPhrase(normalizedTranscript: string, phrases: readonly string[]) {
  return phrases.some((phrase) => includesPhrase(normalizedTranscript, phrase));
}

export function normalizeConfirmationTranscript(text: string) {
  return normalizeWhitespace(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
  );
}

export function classifyConfirmationCommand(text: string): VoiceConfirmationCommand {
  const normalizedTranscript = normalizeConfirmationTranscript(text);

  if (!normalizedTranscript) {
    return {
      normalizedTranscript,
      intent: 'unknown',
    };
  }

  const hasRestart = hasAnyPhrase(normalizedTranscript, RESTART_PHRASES);
  const hasReject = hasAnyPhrase(normalizedTranscript, REJECT_PHRASES);
  const hasConfirm = hasAnyPhrase(normalizedTranscript, CONFIRM_PHRASES);

  if ((hasConfirm && hasReject) || (hasConfirm && hasRestart) || (hasReject && hasRestart)) {
    return {
      normalizedTranscript,
      intent: 'ambiguous',
    };
  }

  let intent: VoiceConfirmationIntent = 'unknown';

  if (hasRestart) {
    intent = 'restart';
  } else if (hasReject) {
    intent = 'reject';
  } else if (hasConfirm) {
    intent = 'confirm';
  }

  return {
    normalizedTranscript,
    intent,
  };
}
