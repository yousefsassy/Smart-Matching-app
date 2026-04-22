require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3030;
const assemblyAiApiKey = (process.env.ASSEMBLYAI_API_KEY || '').trim();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);
app.use(express.json({ limit: '2mb' }));

function ensureAssemblyAiKey() {
  if (!assemblyAiApiKey) {
    const error = new Error('Missing ASSEMBLYAI_API_KEY in voice-test-backend environment.');
    error.statusCode = 500;
    throw error;
  }
}

function wait(durationMs) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

function stripCodeFences(text) {
  return String(text || '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function normalizeTranscript(text) {
  return stripCodeFences(text).trim().replace(/\s+/g, ' ');
}

function inferCategory(text) {
  const normalized = text.toLowerCase();

  if (/(sink|plumb|pipe|toilet|drain|water|leak|faucet|tap)/.test(normalized)) {
    return 'plumbing';
  }

  if (/(light|electric|power|socket|switch|wiring|lamp|outlet)/.test(normalized)) {
    return 'electrical';
  }

  if (/(clean|dirty|sweep|wash|mop|vacuum)/.test(normalized)) {
    return 'cleaning';
  }

  if (/(garden|yard|grass|tree|plant)/.test(normalized)) {
    return 'gardening';
  }

  if (/(paint|wall|ceiling|color)/.test(normalized)) {
    return 'painting';
  }

  if (/(wood|cabinet|door|table|chair|furniture|carpenter)/.test(normalized)) {
    return 'carpentry';
  }

  if (/(move|moving|boxes|transport|carry)/.test(normalized)) {
    return 'moving';
  }

  if (/(service|repair|help|fix)/.test(normalized)) {
    return 'other';
  }

  return 'unknown';
}

function inferUrgency(text) {
  const normalized = text.toLowerCase();

  if (/(urgent|asap|immediately|right away|emergency)/.test(normalized)) {
    return 'high';
  }

  if (/(soon|today|this afternoon|this evening)/.test(normalized)) {
    return 'medium';
  }

  if (text.trim()) {
    return 'low';
  }

  return null;
}

function extractPreferredDateTime(text) {
  const normalized = text.toLowerCase();
  const now = new Date();
  const target = new Date(now);
  target.setSeconds(0, 0);

  if (normalized.includes('tomorrow')) {
    target.setDate(target.getDate() + 1);
  }

  const explicitDateMatch = normalized.match(
    /\b(on\s+)?(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/
  );

  if (explicitDateMatch) {
    const month = Number(explicitDateMatch[2]) - 1;
    const day = Number(explicitDateMatch[3]);
    const rawYear = explicitDateMatch[4];
    const year = rawYear
      ? Number(rawYear.length === 2 ? `20${rawYear}` : rawYear)
      : target.getFullYear();

    target.setFullYear(year, month, day);
  }

  const timeMatch = normalized.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (!timeMatch) {
    return normalized.includes('tomorrow') || normalized.includes('today')
      ? target.toISOString()
      : null;
  }

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2] || '0');
  const meridiem = timeMatch[3];

  if (meridiem === 'pm' && hours < 12) {
    hours += 12;
  }

  if (meridiem === 'am' && hours === 12) {
    hours = 0;
  }

  if (!meridiem && hours < 7) {
    hours += 12;
  }

  target.setHours(hours, minutes, 0, 0);
  return target.toISOString();
}

function summarizeIssue(text, category) {
  const cleaned = normalizeTranscript(text);

  if (!cleaned) {
    return 'No issue was detected.';
  }

  switch (category) {
    case 'plumbing':
      return cleaned.includes('sink') ? 'Sink issue needs plumbing help.' : 'Plumbing help is needed.';
    case 'electrical':
      return cleaned.includes('light') || cleaned.includes('lamp')
        ? 'A light fixture needs electrical repair.'
        : 'Electrical help is needed.';
    case 'cleaning':
      return 'Cleaning help is needed.';
    case 'gardening':
      return 'Gardening help is needed.';
    case 'painting':
      return 'Painting help is needed.';
    case 'carpentry':
      return 'Carpentry help is needed.';
    case 'moving':
      return 'Moving help is needed.';
    case 'other':
      return 'General maintenance help is needed.';
    default:
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
}

function inferConfidence(category, preferredDateTime) {
  let confidence = category === 'unknown' ? 0.56 : 0.84;

  if (preferredDateTime) {
    confidence += 0.06;
  }

  return Math.min(0.97, Number(confidence.toFixed(2)));
}

function buildClientSafeError(error) {
  const rawMessage = String(error?.message || 'Voice request failed.');
  const normalizedMessage = rawMessage.toLowerCase();
  const statusCode = error?.statusCode || 500;

  if (
    normalizedMessage.includes('rate limit') ||
    normalizedMessage.includes('too many requests') ||
    normalizedMessage.includes('temporarily unavailable') ||
    normalizedMessage.includes('service unavailable') ||
    normalizedMessage.includes('concurrency limit') ||
    statusCode === 429
  ) {
    return {
      statusCode: 503,
      message: 'Voice transcription is temporarily busy. Please wait a moment and try again.',
      code: 'VOICE_TEMPORARILY_BUSY',
      retryable: true,
    };
  }

  if (normalizedMessage.includes('missing assemblyai_api_key')) {
    return {
      statusCode: 500,
      message: 'Voice backend is not configured yet. Please ask the developer to check the backend API key.',
      code: 'VOICE_BACKEND_NOT_CONFIGURED',
      retryable: false,
    };
  }

  if (normalizedMessage.includes('no audio file')) {
    return {
      statusCode: 400,
      message: 'No recorded audio was received. Please record again and retry.',
      code: 'VOICE_AUDIO_MISSING',
      retryable: true,
    };
  }

  if (normalizedMessage.includes('empty transcript')) {
    return {
      statusCode: 502,
      message: 'The voice service could not hear a clear request. Please try speaking again.',
      code: 'VOICE_EMPTY_TRANSCRIPT',
      retryable: true,
    };
  }

  return {
    statusCode,
    message: rawMessage,
    code: 'VOICE_REQUEST_FAILED',
    retryable: statusCode >= 500,
  };
}

async function uploadAudioToAssemblyAi(audioBuffer) {
  ensureAssemblyAiKey();

  const response = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      authorization: assemblyAiApiKey,
      'content-type': 'application/octet-stream',
    },
    body: audioBuffer,
  });

  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(payload?.error || 'AssemblyAI upload failed.');
    error.statusCode = response.status;
    throw error;
  }

  if (!payload?.upload_url) {
    const error = new Error('AssemblyAI did not return an upload URL.');
    error.statusCode = 502;
    throw error;
  }

  return payload.upload_url;
}

async function requestAssemblyAiTranscript(uploadUrl) {
  const response = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      authorization: assemblyAiApiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: uploadUrl,
      speech_models: ['universal-3-pro', 'universal-2'],
      language_detection: true,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(payload?.error || 'AssemblyAI transcript request failed.');
    error.statusCode = response.status;
    throw error;
  }

  if (!payload?.id) {
    const error = new Error('AssemblyAI did not return a transcript ID.');
    error.statusCode = 502;
    throw error;
  }

  return payload.id;
}

async function pollAssemblyAiTranscript(transcriptId) {
  for (let attempt = 0; attempt < 45; attempt += 1) {
    const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: {
        authorization: assemblyAiApiKey,
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      const error = new Error(payload?.error || 'AssemblyAI transcript polling failed.');
      error.statusCode = response.status;
      throw error;
    }

    if (payload?.status === 'completed') {
      return payload?.text || '';
    }

    if (payload?.status === 'error') {
      const error = new Error(payload?.error || 'AssemblyAI transcription failed.');
      error.statusCode = 502;
      throw error;
    }

    await wait(2000);
  }

  const error = new Error('AssemblyAI transcription timed out.');
  error.statusCode = 504;
  throw error;
}

async function transcribeAudio({ audioBuffer, transcriptFallback }) {
  if (!audioBuffer?.length) {
    if (transcriptFallback?.trim()) {
      return {
        transcript: normalizeTranscript(transcriptFallback),
        transcriptionSource: 'fallback-transcript',
      };
    }

    const error = new Error('No audio file or fallback transcript was provided.');
    error.statusCode = 400;
    throw error;
  }

  const uploadUrl = await uploadAudioToAssemblyAi(audioBuffer);
  const transcriptId = await requestAssemblyAiTranscript(uploadUrl);
  const transcript = normalizeTranscript(await pollAssemblyAiTranscript(transcriptId));

  if (!transcript) {
    const error = new Error('AssemblyAI returned an empty transcript.');
    error.statusCode = 502;
    throw error;
  }

  return {
    transcript,
    transcriptionSource: 'assemblyai',
  };
}

async function analyzeTranscript(transcript) {
  const cleanedText = normalizeTranscript(transcript);

  if (!cleanedText) {
    const error = new Error('Transcript is required for analysis.');
    error.statusCode = 400;
    throw error;
  }

  const category = inferCategory(cleanedText);
  const preferredDateTime = extractPreferredDateTime(cleanedText);
  const urgency = inferUrgency(cleanedText);

  return {
    rawText: transcript,
    cleanedText,
    category,
    issueSummary: summarizeIssue(cleanedText, category),
    preferredDateTime,
    urgency,
    notes: null,
    confidence: inferConfidence(category, preferredDateTime),
    analysisSource: 'backend-parser',
  };
}

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'voice-test-backend',
    provider: 'assemblyai',
    assemblyAiConfigured: Boolean(assemblyAiApiKey),
  });
});

app.post('/voice/analyze', upload.single('audio'), async (req, res) => {
  try {
    const { transcript: transcriptFallback } = req.body;
    const transcriptionResult = await transcribeAudio({
      audioBuffer: req.file?.buffer,
      transcriptFallback,
    });

    const parsedRequest = await analyzeTranscript(transcriptionResult.transcript);

    res.json({
      transcript: transcriptionResult.transcript,
      transcriptionSource: transcriptionResult.transcriptionSource,
      parsedRequest,
    });
  } catch (error) {
    const clientSafeError = buildClientSafeError(error);
    res.status(clientSafeError.statusCode).json(clientSafeError);
  }
});

app.post('/voice/parse', async (req, res) => {
  try {
    const parsedRequest = await analyzeTranscript(req.body?.transcript);
    res.json({ parsedRequest });
  } catch (error) {
    const clientSafeError = buildClientSafeError(error);
    res.status(clientSafeError.statusCode).json(clientSafeError);
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.listen(port, () => {
  console.log(`voice-test-backend listening on port ${port}`);
});
