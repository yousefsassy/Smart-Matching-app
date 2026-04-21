const User = require("../models/User");
const ServiceRequest = require("../models/ServiceRequest");

function haversineKm(coord1, coord2) {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
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
  if (!providerSkills || providerSkills.length === 0) return 0;
  const target = serviceType.toLowerCase();
  const matches = providerSkills.filter(
    (s) =>
      s.toLowerCase().includes(target) ||
      target.includes(s.toLowerCase())
  );
  return parseFloat((matches.length / providerSkills.length).toFixed(2));
}

async function computeFeatures(req, res, next) {
  try {
        const serviceRequest = await ServiceRequest.findById(req.params.id).lean(); 

        if (!serviceRequest) {

          return res.status(404).json({ error: "Service request not found" });
          
            }
    const { serviceType, location } = serviceRequest;
    const requestCoords = location.geo.coordinates;

    // Fetch filtered candidates from DB
    const providers = await User.find({
      role: "provider",
      "providerDetails.fieldOfService": serviceType,
      "providerDetails.isAvailable": true,
    }).lean();

    if (!providers.length) {
      return res.status(404).json({ error: "No available providers found" });
    }

    // Build feature vectors
    req.candidates = providers.map((provider) => {
      const pd = provider.providerDetails;
      const providerCoords = pd.location.geo.coordinates;

      return {
        provider_id: provider._id.toString(),
        name: provider.name,
        distance_km: parseFloat(
          haversineKm(requestCoords, providerCoords).toFixed(2)
        ),
        field_match: 1,
        skill_overlap: computeSkillOverlap(pd.skills, serviceType),
        trust_score: pd.trustScore,
        completed_jobs: pd.completedJobs,
        experience_years: pd.experienceYears,
        is_available: 1,
      };
    });

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = computeFeatures;