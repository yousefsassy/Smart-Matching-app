const axios = require("axios");
const User = require("../models/User");
const Match = require("../models/Match");
const ServiceRequest = require("../models/ServiceRequest");

const FLASK_URL = process.env.FLASK_URL || "http://localhost:5001";

async function callFlask(candidates) {
  const response = await axios.post(`${FLASK_URL}/match`, { candidates });
  return response.data.top_providers;
}

async function saveMatches(serviceRequestId, topProviders) {
  const matchDocs = topProviders.map((p, index) => ({
    serviceRequest: serviceRequestId,
    provider: p.provider_id,
    score: p.predicted_score,
    rank: index + 1,
    skillOverlapSnapshot: p.skill_overlap,
    distanceKmSnapshot: p.distance_km,
    selected: false,
    notified: false,
  }));

  await Match.insertMany(matchDocs);
}

async function match(serviceRequestId, candidates) {
  const topProviders = await callFlask(candidates);
  await saveMatches(serviceRequestId, topProviders);
  await ServiceRequest.findByIdAndUpdate(serviceRequestId, { status: "matched" });
  return topProviders;
}

module.exports = { match };