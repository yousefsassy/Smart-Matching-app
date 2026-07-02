const Match = require("../models/Match");
const Job = require("../models/Job");
const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/user");
const { rankProvidersWithGemini } = require("./gemini");
const {
  bookProviderAvailability,
  restoreProviderAvailability,
} = require("./providerAvailability");

const createError = (status, message) => ({ status, message });
const DEFAULT_MATCH_RESPONSE_TTL_MINUTES = 30;

const getMatchResponseTtlMs = () => {
  const configuredMinutes = Number(process.env.MATCH_RESPONSE_TTL_MINUTES);
  const ttlMinutes =
    Number.isFinite(configuredMinutes) && configuredMinutes > 0
      ? configuredMinutes
      : DEFAULT_MATCH_RESPONSE_TTL_MINUTES;

  return ttlMinutes * 60 * 1000;
};

const toMinutes = (time) => {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
};

const isOverlapping = (requestedWindow, providerWindow) => {
  if (!providerWindow?.start || !providerWindow?.end) return false;

  return (
    toMinutes(requestedWindow.start) < toMinutes(providerWindow.end) &&
    toMinutes(providerWindow.start) < toMinutes(requestedWindow.end)
  );
};

const toDateKey = (value) => new Date(value).toISOString().split("T")[0];

const normalizeServiceType = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "electrical") return "electricity";
  return normalized;
};

const haversineKm = (fromCoordinates, toCoordinates) => {
  if (!Array.isArray(fromCoordinates) || !Array.isArray(toCoordinates)) {
    return Number.POSITIVE_INFINITY;
  }

  const [fromLng, fromLat] = fromCoordinates;
  const [toLng, toLat] = toCoordinates;

  if (
    [fromLng, fromLat, toLng, toLat].some(
      (value) => typeof value !== "number" || Number.isNaN(value)
    )
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) ** 2;

  return Number((2 * earthRadiusKm * Math.asin(Math.sqrt(a))).toFixed(2));
};

const computeSkillOverlap = (providerSkills, serviceType) => {
  if (!Array.isArray(providerSkills) || providerSkills.length === 0 || !serviceType) {
    return 0;
  }

  const target = String(serviceType).toLowerCase();
  const matches = providerSkills.filter((skill) => {
    const normalizedSkill = String(skill).toLowerCase();
    return normalizedSkill.includes(target) || target.includes(normalizedSkill);
  });

  return Number((matches.length / providerSkills.length).toFixed(2));
};

const buildFallbackReasoning = (candidate) => {
  const parts = [
    `trustScore=${candidate.trustScore.toFixed(2)}`,
    `experience=${candidate.experienceYears}y`,
  ];

  if (Number.isFinite(candidate.distanceKm)) {
    parts.push(`distance=${candidate.distanceKm.toFixed(2)}km`);
  } else {
    parts.push("distance=unknown");
  }

  return `Fallback ranking prioritized ${parts.join(", ")}.`;
};

const getDeterministicRanking = (candidates) =>
  [...candidates]
    .sort((left, right) => {
      if (right.trustScore !== left.trustScore) {
        return right.trustScore - left.trustScore;
      }

      if (left.distanceKm !== right.distanceKm) {
        return left.distanceKm - right.distanceKm;
      }

      if (right.experienceYears !== left.experienceYears) {
        return right.experienceYears - left.experienceYears;
      }

      return String(left.provider._id).localeCompare(String(right.provider._id));
    })
    .map((candidate, index) => ({
      providerId: String(candidate.provider._id),
      score: Number(
        Math.max(
          1,
          100 -
            (Number.isFinite(candidate.distanceKm) ? candidate.distanceKm : 50) -
            index
        ).toFixed(2)
      ),
      reasoning: buildFallbackReasoning(candidate),
    }));

const finalizeTopThree = (rankedProviders, candidates) => {
  const fallback = getDeterministicRanking(candidates);
  const maxItems = Math.min(3, candidates.length);
  const results = [];
  const seen = new Set();

  for (const item of rankedProviders || []) {
    if (results.length >= maxItems) break;
    if (seen.has(item.providerId)) continue;
    results.push(item);
    seen.add(item.providerId);
  }

  for (const item of fallback) {
    if (results.length >= maxItems) break;
    if (seen.has(item.providerId)) continue;
    results.push(item);
    seen.add(item.providerId);
  }

  return results.slice(0, maxItems);
};

const getEligibleCandidates = async (request) => {
  const normalizedServiceType = normalizeServiceType(request.serviceType);
  const providers = await User.find({
    role: "provider",
    "providerDetails.isVerified": true,
    "providerDetails.isAvailable": true,
    "providerDetails.fieldOfService": normalizedServiceType,
  });

  const requestDateKey = toDateKey(request.date);

  return providers
    .filter((provider) => {
      const availability = provider.providerDetails?.availability || [];
      if (availability.length === 0) return true;

      return availability.some((entry) => {
        if (toDateKey(entry.date) !== requestDateKey) return false;

        if (!entry.slot1 && !entry.slot2) {
          return true;
        }

        return (
          isOverlapping(request.timeWindow, entry.slot1) ||
          isOverlapping(request.timeWindow, entry.slot2)
        );
      });
    })
    .map((provider) => ({
      provider,
      trustScore: provider.providerDetails?.trustScore || 0,
      skillOverlap: computeSkillOverlap(
        provider.providerDetails?.skills,
        request.serviceType
      ),
      completedJobs: provider.providerDetails?.completedJobs || 0,
      experienceYears: provider.providerDetails?.experienceYears || 0,
      distanceKm: haversineKm(
        request.location?.geo?.coordinates,
        provider.providerDetails?.location?.geo?.coordinates
      ),
    }));
};

const getRequestOwner = async (requestId) => {
  const request = await ServiceRequest.findById(requestId);

  if (!request) throw createError(404, "Service request not found");

  return request;
};

const setPostSelectionStatus = async (serviceRequestId) => {
  const matches = await Match.find({ serviceRequest: serviceRequestId });
  const hasPending = matches.some((match) => match.status === "pending");
  const hasSelected = matches.some((match) => match.status === "selected");
  const nextStatus = hasPending || hasSelected ? "matched" : "pending";

  return ServiceRequest.findByIdAndUpdate(
    serviceRequestId,
    { status: nextStatus },
    { new: true }
  );
};

const isMatchPastResponseTtl = (match, now = new Date()) => {
  if (match.status !== "selected" || !match.notifiedAt) return false;
  return now.getTime() > new Date(match.notifiedAt).getTime() + getMatchResponseTtlMs();
};

const expireMatchDocument = async (match) => {
  match.status = "expired";
  match.selected = false;
  await match.save();

  const serviceRequest = match.serviceRequest?._id
    ? match.serviceRequest
    : await ServiceRequest.findById(match.serviceRequest);
  const updatedRequest = await setPostSelectionStatus(serviceRequest._id);
  const client = await User.findById(serviceRequest.client).select("expoPushToken");

  return {
    message: "Match expired successfully",
    match,
    request: updatedRequest,
    notification: {
      clientToken: client?.expoPushToken || null,
      requestId: serviceRequest._id,
    },
  };
};

const hasActiveOverlappingJob = async (providerId, request) => {
  const activeJobs = await Job.find({
    provider: providerId,
    status: "active",
  });

  return activeJobs.some(
    (job) =>
      toDateKey(job.date) === toDateKey(request.date) &&
      isOverlapping(job.timeWindow, request.timeWindow)
  );
};

exports.generateMatches = async (requestId) => {
  const request = await getRequestOwner(requestId);

  if (request.status !== "pending") {
    throw createError(
      400,
      "Matches can only be generated for pending requests"
    );
  }

  const existingJob = await Job.findOne({ serviceRequest: requestId });
  if (existingJob) {
    throw createError(400, "Cannot generate matches for a request with a job");
  }

  const candidates = await getEligibleCandidates(request);

  if (candidates.length === 0) {
    return {
      message: "No providers available",
      request,
      matches: [],
      usedFallback: false,
    };
  }

  let rankedProviders = [];
  let usedFallback = false;

  try {
    rankedProviders = await rankProvidersWithGemini({
      serviceRequest: request,
      candidates,
      topK: 3,
    });
    if (!rankedProviders?.length) {
      usedFallback = true;
      rankedProviders = [];
    }
  } catch (error) {
    console.error("Gemini ranking failed, using fallback:", error.message);
    usedFallback = true;
    rankedProviders = [];
  }

  const topProviders = finalizeTopThree(rankedProviders, candidates);
  const candidateById = new Map(
    candidates.map((candidate) => [String(candidate.provider._id), candidate])
  );

  await Match.deleteMany({ serviceRequest: requestId });

  const matches = [];
  for (let index = 0; index < topProviders.length; index += 1) {
    const rankedProvider = topProviders[index];
    const candidate = candidateById.get(rankedProvider.providerId);

    matches.push(
      await Match.create({
        serviceRequest: requestId,
        provider: rankedProvider.providerId,
        score: rankedProvider.score,
        rank: index + 1,
        status: "pending",
        selected: false,
        reasoning: rankedProvider.reasoning,
        distanceKmSnapshot: Number.isFinite(candidate.distanceKm)
          ? candidate.distanceKm
          : null,
      })
    );
  }

  return {
    message:
      matches.length > 0
        ? "Matches generated successfully"
        : "No providers available",
    request,
    matches,
    usedFallback,
  };
};

exports.selectMatch = async (matchId, clientId) => {
  const match = await Match.findById(matchId).populate("serviceRequest");

  if (!match) throw createError(404, "Match not found");

  const request = match.serviceRequest;
  if (request.client.toString() !== clientId) {
    throw createError(403, "Unauthorized");
  }

  if (["assigned", "completed", "cancelled"].includes(request.status)) {
    throw createError(400, "This request can no longer accept selections");
  }

  if (match.status !== "pending") {
    throw createError(400, "Only pending matches can be selected");
  }

  const alreadySelected = await Match.findOne({
    serviceRequest: request._id,
    status: "selected",
    _id: { $ne: matchId },
  });

  if (alreadySelected) {
    throw createError(
      400,
      "Another provider is already awaiting a response for this request"
    );
  }

  match.status = "selected";
  match.selected = true;
  match.notified = true;
  match.notifiedAt = new Date();
  await match.save();

  request.status = "matched";
  await request.save();

  const provider = await User.findById(match.provider).select("expoPushToken");

  return {
    message: "Match selected successfully",
    match,
    request,
    notification: {
      providerToken: provider?.expoPushToken || null,
      requestId: request._id,
    },
  };
};

exports.respondToMatch = async (matchId, providerId, action) => {
  if (!["accept", "reject"].includes(action)) {
    throw createError(400, "Action must be accept or reject");
  }

  const match = await Match.findById(matchId).populate("serviceRequest");

  if (!match) throw createError(404, "Match not found");
  if (match.provider.toString() !== providerId) {
    throw createError(403, "Unauthorized");
  }
  if (match.status !== "selected") {
    throw createError(400, "Only selected matches can be answered");
  }

  const request = match.serviceRequest;
  if (["completed", "cancelled"].includes(request.status)) {
    throw createError(400, "This request is no longer active");
  }

  const client = await User.findById(request.client).select("expoPushToken");

  if (action === "reject") {
    match.status = "rejected";
    match.selected = false;
    await match.save();

    const updatedRequest = await setPostSelectionStatus(request._id);

    return {
      message: "Match rejected successfully",
      match,
      request: updatedRequest,
      notification: {
        clientToken: client?.expoPushToken || null,
        requestId: request._id,
      },
    };
  }

  if (await hasActiveOverlappingJob(providerId, request)) {
    throw createError(400, "Provider already has an active job on this date");
  }

  let availabilitySnapshot = null;
  let job = null;

  try {
    availabilitySnapshot = await bookProviderAvailability(
      providerId,
      request.date,
      request.timeWindow
    );

    match.status = "accepted";
    await match.save();

    job = await Job.create({
      serviceRequest: request._id,
      match: match._id,
      client: request.client,
      provider: providerId,
      date: request.date,
      timeWindow: request.timeWindow,
      availabilitySnapshot,
    });
  } catch (error) {
    if (availabilitySnapshot) {
      await restoreProviderAvailability(providerId, availabilitySnapshot);
    }
    if (!job && match.status === "accepted") {
      match.status = "selected";
      match.selected = true;
      await match.save();
    }
    throw error;
  }

  await Match.updateMany(
    {
      serviceRequest: request._id,
      _id: { $ne: match._id },
      status: { $in: ["pending", "selected"] },
    },
    { status: "rejected", selected: false }
  );

  request.status = "assigned";
  await request.save();

  return {
    message: "Match accepted successfully",
    match,
    request,
    job,
    notification: {
      clientToken: client?.expoPushToken || null,
      requestId: request._id,
    },
  };
};

exports.expireMatch = async (matchId) => {
  const match = await Match.findById(matchId).populate("serviceRequest");

  if (!match) throw createError(404, "Match not found");
  if (!["selected", "pending"].includes(match.status)) {
    throw createError(400, "Only pending or selected matches can expire");
  }

  return expireMatchDocument(match);
};

exports.getInvitations = async (providerId) => {
  const selectedMatches = await Match.find({
    provider: providerId,
    status: "selected",
  })
    .sort({ notifiedAt: 1, createdAt: 1 })
    .populate("serviceRequest");

  const now = new Date();
  const invitations = [];
  const expired = [];
  const notifications = [];

  for (const match of selectedMatches) {
    if (isMatchPastResponseTtl(match, now)) {
      const result = await expireMatchDocument(match);
      expired.push(result.match);
      notifications.push(result.notification);
    } else {
      invitations.push(match);
    }
  }

  return {
    invitations,
    expired,
    notifications,
    ttlMinutes: getMatchResponseTtlMs() / 60000,
  };
};

exports.getMatchesByRequest = async (requestId, user) => {
  const request = await getRequestOwner(requestId);

  if (
    user.role === "client" &&
    request.client.toString() !== user.id &&
    request.client.toString() !== user._id?.toString()
  ) {
    throw createError(403, "Unauthorized");
  }

  const matches = await Match.find({ serviceRequest: requestId })
    .sort({ rank: 1 })
    .populate(
      "provider",
      "name email photoUrl providerDetails.fieldOfService providerDetails.trustScore providerDetails.experienceYears providerDetails.location"
    );

  return { request, matches };
};
