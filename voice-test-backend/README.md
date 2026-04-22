# Voice Test Backend

Tiny standalone backend used only for mobile voice-request testing.

## What it does

- accepts uploaded audio
- sends audio to AssemblyAI for transcription
- analyzes the transcript locally into structured request fields
- returns frontend-friendly JSON

## Setup

1. Create `.env` from `.env.example`
2. Add your `ASSEMBLYAI_API_KEY`
3. Install dependencies

```bash
cd voice-test-backend
npm install
```

4. Start the server

```bash
npm run dev
```

## Endpoints

### `GET /health`

Health check.

### `POST /voice/analyze`

Multipart form-data:

- `audio`: uploaded audio file
- `transcript`: optional transcript fallback text

Returns:

```json
{
  "transcript": "The lamp in my kitchen is not working",
  "transcriptionSource": "assemblyai",
  "parsedRequest": {
    "rawText": "The lamp in my kitchen is not working",
    "cleanedText": "The lamp in my kitchen is not working",
    "category": "electrical",
    "issueSummary": "Kitchen lamp is not working",
    "preferredDateTime": null,
    "urgency": "low",
    "notes": null,
    "confidence": 0.89,
    "analysisSource": "backend-parser"
  }
}
```

### `POST /voice/parse`

JSON body:

```json
{
  "transcript": "I need an electrician tomorrow at 9 AM"
}
```

Useful for debugging parsing separately from audio upload.

## Health Response

`GET /health` now returns:

```json
{
  "ok": true,
  "service": "voice-test-backend",
  "provider": "assemblyai",
  "assemblyAiConfigured": true
}
```
