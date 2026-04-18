const Match = require("../models/Match");
const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/user");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// -----------------------------
// TIME CHECK (FIXED)
// -----------------------------
const isTimeInsideSlot = (reqStart, reqEnd, slot) => {
  if (!slot) return false;

  return reqStart >= slot.start && reqEnd <= slot.end;
};

// -----------------------------
// GENERATE MATCHES (GEMINI)
// -----------------------------
exports.generateMatches = async (requestId) => {
  const request = await ServiceRequest.findById(requestId);
  if (!request) throw new Error("Service request not found");

  // -----------------------------
  // 1. GET VALID PROVIDERS
  // -----------------------------
  const providers = await User.find({
    role: "provider",
    "providerDetails.isVerified": true,
    "providerDetails.isAvailable": true,
    "providerDetails.fieldOfService": request.serviceType,
  });

  // -----------------------------
  // 2. FILTER BY AVAILABILITY
  // -----------------------------
  const requestDate = new Date(request.date).toISOString().split("T")[0];

  const candidates = providers.filter((p) =>
    p.providerDetails?.availability?.some((a) => {
      const providerDate = new Date(a.date).toISOString().split("T")[0];

      if (providerDate !== requestDate) return false;

      const slot = a.slot1; // using slot1 for now
      if (!slot) return false;

      return isTimeInsideSlot(
        request.timeWindow.start,
        request.timeWindow.end,
        slot
      );
    })
  );

  if (candidates.length === 0) {
    throw new Error("No available providers found");
  }

  // -----------------------------
  // 3. GEMINI PROMPT
  // -----------------------------
  const prompt = `
You are an AI ranking engine for a service marketplace.

SERVICE REQUEST:
${JSON.stringify(request, null, 2)}

AVAILABLE PROVIDERS:
${JSON.stringify(
  candidates.map((p) => ({
    id: p._id,
    name: p.name,
    rating: p.rating || 0,
    trustScore: p.providerDetails?.trustScore || 0,
    experienceYears: p.providerDetails?.experienceYears || 0,
    field: p.providerDetails?.fieldOfService,
  })),
  null,
  2
)}

TASK:
Rank the providers from best to worst match.

Return ONLY valid JSON:
[
  {
    "providerId": "string",
    "score": number,
    "reasoning": "short explanation"
  }
]

Return TOP 3 ONLY.
No markdown. No text.
`;
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  let ranked;
  try {
    ranked = JSON.parse(text);
  } catch (err) {
    console.error("❌ Gemini raw output:", text);
    throw new Error("Invalid JSON returned from Gemini");
  }

  const topK = ranked.slice(0, 3);

  // -----------------------------
  // 4. SAVE MATCHES
  // -----------------------------
  const savedMatches = [];

  for (let i = 0; i < topK.length; i++) {
    const match = await Match.create({
      serviceRequest: requestId,
      provider: topK[i].providerId,
      score: topK[i].score,
      rank: i + 1,
      reasoning: topK[i].reasoning,
    });

    savedMatches.push(match);
  }

  return savedMatches;
};