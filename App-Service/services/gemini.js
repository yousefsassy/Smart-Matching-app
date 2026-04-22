const axios = require("axios");
const systemPrompt = require("../utils/systemPrompt");
require("dotenv").config();

const MAX_TOP_PROVIDERS = 3;
const DEFAULT_GEMINI_TIMEOUT_MS = 15000;

function getGeminiTimeoutMs() {
  const configuredTimeout = Number(process.env.GEMINI_TIMEOUT_MS);
  return Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_GEMINI_TIMEOUT_MS;
}

function requireGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY;
  const baseUrl = process.env.GEMINI_BASE_URL;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  if (!baseUrl) throw new Error("GEMINI_BASE_URL is not configured");
  if (!model) throw new Error("GEMINI_MODEL is not configured");

  return {
    apiKey,
    url: `${baseUrl.replace(/\/$/, "")}/models/${model}:generateContent`,
  };
}

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

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sanitizeServiceRequest(serviceRequest) {
  if (!serviceRequest) return null;

  return {
    id: String(serviceRequest._id || serviceRequest.id || ""),
    serviceType: serviceRequest.serviceType,
    description: serviceRequest.description || "",
    date: serviceRequest.date,
    timeWindow: serviceRequest.timeWindow,
    budget: serviceRequest.budget,
    location: {
      regionText: serviceRequest.location?.regionText || "",
    },
  };
}

function getCandidateId(candidate) {
  return String(
    candidate.provider_id ||
      candidate.providerId ||
      candidate.provider?._id ||
      candidate._id ||
      ""
  );
}

function sanitizeCandidate(candidate) {
  const provider = candidate.provider || {};
  const providerDetails = provider.providerDetails || {};
  const providerId = getCandidateId(candidate);
  const distanceKm =
    candidate.distance_km !== undefined ? candidate.distance_km : candidate.distanceKm;
  const skillOverlap =
    candidate.skill_overlap !== undefined ? candidate.skill_overlap : candidate.skillOverlap;
  const trustScore =
    candidate.trust_score !== undefined ? candidate.trust_score : candidate.trustScore;
  const completedJobs =
    candidate.completed_jobs !== undefined
      ? candidate.completed_jobs
      : providerDetails.completedJobs;
  const experienceYears =
    candidate.experience_years !== undefined
      ? candidate.experience_years
      : candidate.experienceYears;
  const isAvailable =
    candidate.is_available !== undefined
      ? candidate.is_available
      : providerDetails.isAvailable === false
        ? 0
        : 1;

  return {
    provider_id: providerId,
    name: String(candidate.name || provider.name || ""),
    distance_km: Number.isFinite(Number(distanceKm)) ? Number(distanceKm) : null,
    field_match: Number(candidate.field_match ?? 1),
    skill_overlap: clamp(toNumber(skillOverlap, 0), 0, 1),
    trust_score: clamp(toNumber(trustScore, 0), 0, 5),
    completed_jobs: Math.max(0, Math.trunc(toNumber(completedJobs, 0))),
    experience_years: Math.max(0, Math.trunc(toNumber(experienceYears, 0))),
    is_available: Number(isAvailable) === 1 ? 1 : 0,
  };
}

function scoreToInternalScore(value) {
  const score = toNumber(value, 0);
  return Number((score <= 1 ? score * 100 : score).toFixed(2));
}

function normalizeTopProviders(result, sanitizedCandidates, topK) {
  if (!result || !Array.isArray(result.top_providers)) {
    throw new Error("Gemini response must include top_providers array");
  }

  const candidateById = new Map(
    sanitizedCandidates.map((candidate) => [candidate.provider_id, candidate])
  );
  const seen = new Set();
  const maxItems = Math.min(MAX_TOP_PROVIDERS, Number(topK) || MAX_TOP_PROVIDERS);
  const ranked = [];

  for (const provider of result.top_providers) {
    const providerId = String(provider?.provider_id || provider?.providerId || "");

    if (!candidateById.has(providerId)) continue;
    if (seen.has(providerId)) continue;

    const predictedScore = Number(provider.predicted_score ?? provider.score);
    if (!Number.isFinite(predictedScore)) {
      throw new Error(`Gemini returned nonnumeric score for provider ${providerId}`);
    }

    const original = candidateById.get(providerId);
    ranked.push({
      providerId,
      score: scoreToInternalScore(predictedScore),
      reasoning:
        typeof provider.match_reason === "string" && provider.match_reason.trim()
          ? provider.match_reason.trim()
          : "Ranked by Gemini using trust, skills, distance, and experience.",
      geminiProvider: {
        ...original,
        predicted_score: Number(predictedScore.toFixed(4)),
        rank: ranked.length + 1,
        match_reason:
          typeof provider.match_reason === "string"
            ? provider.match_reason.trim()
            : "",
      },
    });
    seen.add(providerId);

    if (ranked.length >= maxItems) break;
  }

  return ranked;
}

async function rankProvidersWithGemini({
  serviceRequest = null,
  candidates,
  topK = MAX_TOP_PROVIDERS,
}) {
  if (!Array.isArray(candidates)) {
    throw new Error("candidates must be an array");
  }

  const sanitizedCandidates = candidates
    .map(sanitizeCandidate)
    .filter((candidate) => candidate.provider_id);

  if (sanitizedCandidates.length === 0) {
    return [];
  }

  const { apiKey, url } = requireGeminiConfig();
  const requestedTopK = Math.min(
    MAX_TOP_PROVIDERS,
    Math.max(1, Number(topK) || MAX_TOP_PROVIDERS),
    sanitizedCandidates.length
  );

  const input = {
    top_k: requestedTopK,
    service_request: sanitizeServiceRequest(serviceRequest),
    candidates: sanitizedCandidates,
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
          parts: [{ text: JSON.stringify(input) }],
        },
      ],
      generationConfig: {
        temperature: 0,
        topP: 1,
        responseMimeType: "application/json",
      },
    },
    {
      timeout: getGeminiTimeoutMs(),
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
    }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = parseGeminiJson(text);
  return normalizeTopProviders(parsed, sanitizedCandidates, requestedTopK);
}

async function matchProvidersWithGemini({
  candidates,
  serviceRequest = null,
  topK = MAX_TOP_PROVIDERS,
}) {
  const ranked = await rankProvidersWithGemini({
    serviceRequest,
    candidates,
    topK,
  });

  return {
    top_providers: ranked.map((provider, index) => ({
      ...provider.geminiProvider,
      rank: index + 1,
    })),
    message: ranked.length ? "Providers ranked successfully" : "No providers available",
    matchesCreated: 0,
    saved: false,
  };
}

module.exports = {
  rankProvidersWithGemini,
  matchProvidersWithGemini,
};
