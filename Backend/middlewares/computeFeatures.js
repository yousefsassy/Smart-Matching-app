const User = require("../models/user");
const ServiceRequest = require("../models/ServiceRequest");

function toMinutes(time) {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
}

function toDateKey(value) {
  return new Date(value).toISOString().split("T")[0];
}

function normalizeServiceType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "electrical") return "electricity";
  return normalized;
}

function isOverlapping(requestedWindow, providerWindow) {
  if (!requestedWindow?.start || !requestedWindow?.end) return false;
  if (!providerWindow?.start || !providerWindow?.end) return false;

  return (
    toMinutes(requestedWindow.start) < toMinutes(providerWindow.end) &&
    toMinutes(providerWindow.start) < toMinutes(requestedWindow.end)
  );
}

function isAvailableForRequest(provider, serviceRequest) {
  const availability = provider.providerDetails?.availability || [];
  if (availability.length === 0) return true;

  const requestDateKey = toDateKey(serviceRequest.date);

  return availability.some((entry) => {
    if (toDateKey(entry.date) !== requestDateKey) return false;

    if (!entry.slot1 && !entry.slot2) return true;

    return (
      isOverlapping(serviceRequest.timeWindow, entry.slot1) ||
      isOverlapping(serviceRequest.timeWindow, entry.slot2)
    );
  });
}

function haversineKm(coord1, coord2) {
  if (!Array.isArray(coord1) || !Array.isArray(coord2)) {
    return Number.POSITIVE_INFINITY;
  }

  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  if (
    [lng1, lat1, lng2, lat2].some(
      (value) => typeof value !== "number" || Number.isNaN(value)
    )
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function computeSkillOverlap(providerSkills, serviceType) {
  if (!providerSkills || providerSkills.length === 0 || !serviceType) return 0;
  const target = serviceType.toLowerCase();
  const matches = providerSkills.filter((skill) => {
    const normalizedSkill = String(skill).toLowerCase();
    return normalizedSkill.includes(target) || target.includes(normalizedSkill);
  });
  return parseFloat((matches.length / providerSkills.length).toFixed(2));
}

function sanitizeServiceRequest(serviceRequest) {
  return {
    _id: serviceRequest._id?.toString(),
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

async function computeFeatures(req, res, next) {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id).lean();

    if (!serviceRequest) {
      return res.status(404).json({ error: "Service request not found" });
    }

    const requestCoords = serviceRequest.location?.geo?.coordinates;
    const normalizedServiceType = normalizeServiceType(serviceRequest.serviceType);

    const providers = await User.find({
      role: "provider",
      "providerDetails.isVerified": true,
      "providerDetails.isAvailable": true,
      "providerDetails.fieldOfService": normalizedServiceType,
    }).lean();

    const eligibleProviders = providers.filter((provider) =>
      isAvailableForRequest(provider, serviceRequest)
    );

    req.serviceRequest = sanitizeServiceRequest(serviceRequest);
    req.candidates = eligibleProviders.map((provider) => {
      const pd = provider.providerDetails || {};
      const providerCoords = pd.location?.geo?.coordinates;
      const distanceKm = haversineKm(requestCoords, providerCoords);

      return {
        provider_id: provider._id.toString(),
        name: provider.name,
        distance_km: Number.isFinite(distanceKm)
          ? parseFloat(distanceKm.toFixed(2))
          : null,
        field_match: 1,
        skill_overlap: computeSkillOverlap(pd.skills, serviceRequest.serviceType),
        trust_score: pd.trustScore || 0,
        completed_jobs: pd.completedJobs || 0,
        experience_years: pd.experienceYears || 0,
        is_available: 1,
      };
    });

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = computeFeatures;
