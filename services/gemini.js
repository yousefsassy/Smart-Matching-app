const axios = require("axios");
const mongoose = require("mongoose");
const Match = require("../models/Match");
const ServiceRequest = require("../models/ServiceRequest");
const systemPrompt = require("../utils/systemPrompt");
require("dotenv").config();

const GEMINI_API_URL = process.env.GEMINI_API_URL ;
const DEFAULT_MODEL = process.env.GEMINI_MODEL ;

//*********************** PARSE AND NORMALIZE GEMINI RESPONSE *************************

function parseGeminiJson(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Gemini returned an empty response");
  }

  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Gemini returned invalid JSON: ${cleaned}`);
  }
}

//*********************Normalize HTTP Response****************

function normalizeTopProviders(result) {
  if (!result || !Array.isArray(result.top_providers)) {
    throw new Error("Gemini response must include top_providers array");
  }

  return {
    top_providers: result.top_providers.map((provider, index) => ({
      ...provider,
      rank: Number(provider.rank) || index + 1,
      predicted_score: Number(provider.predicted_score),
    })),
  };
}

//*********************SAVE MATCHES TO DB****************

async function saveMatches(serviceRequestId, topProviders) {
  if (!serviceRequestId || !mongoose.Types.ObjectId.isValid(serviceRequestId)) {
    throw new Error("A valid serviceRequestId is required to save matches");
  }

  const invalidProvider = topProviders.find(
    (provider) => !mongoose.Types.ObjectId.isValid(provider.provider_id)
  );

  if (invalidProvider) {
    throw new Error(`Invalid provider_id returned by Gemini: ${invalidProvider.provider_id}`);
  }

  const matchDocs = topProviders.map((provider) => ({
    serviceRequest: serviceRequestId,
    provider: provider.provider_id,
    score: provider.predicted_score,
    rank: provider.rank,
    selected: false,
    notified: false,
    skillOverlapSnapshot: provider.skill_overlap || 0,
    distanceKmSnapshot:
      provider.distance_km === undefined || provider.distance_km === null
        ? null
        : provider.distance_km,
  }));

  const matches = await Match.insertMany(matchDocs);
  await ServiceRequest.findByIdAndUpdate(serviceRequestId, { status: "matched" });
  return matches;
}

//*********************MAIN FUNCTION TO MATCH PROVIDERS WITH GEMINI****************

async function matchProvidersWithGemini({
  candidates,
  serviceRequest = null,
  serviceRequestId,
  saveMatchesToDb = false,
  topK = 3,
}) {
  if (!Array.isArray(candidates)) {
    throw new Error("candidates must be an array");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = DEFAULT_MODEL;
  const url = `${GEMINI_API_URL}/models/${model}:generateContent`;
  const input = {
    top_k: Number(topK) || 3,
    service_request: serviceRequest,
    candidates,
  };

  const response = await axios.post(
    url,
    {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: JSON.stringify(input),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        topP: 1,
        responseMimeType: "application/json",
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
    }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = parseGeminiJson(text);
  const result = normalizeTopProviders(parsed);

  if (!saveMatchesToDb) {
    return {
      ...result,
      matchesCreated: 0,
      saved: false,
    };
  }

  const matches = await saveMatches(serviceRequestId, result.top_providers);

  return {
    ...result,
    matchesCreated: matches.length,
    saved: true,
  };
}

module.exports = { matchProvidersWithGemini };
