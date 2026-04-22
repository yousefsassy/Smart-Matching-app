const Job = require("../models/Job");
const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/user");
const { restoreProviderAvailability } = require("./providerAvailability");

const createError = (status, message) => ({ status, message });

const getJobWithRequest = async (jobId) => {
  const job = await Job.findById(jobId);

  if (!job) throw createError(404, "Job not found");

  const request = await ServiceRequest.findById(job.serviceRequest);
  if (!request) throw createError(404, "Service request not found");

  return { job, request };
};

exports.completeJob = async (providerId, jobId) => {
  const { job, request } = await getJobWithRequest(jobId);

  if (job.provider.toString() !== providerId) {
    throw createError(403, "Unauthorized");
  }

  if (job.status !== "active") {
    throw createError(400, "Only active jobs can be completed");
  }

  job.status = "completed";
  await job.save();

  request.status = "completed";
  await request.save();

  const client = await User.findById(job.client).select("expoPushToken");

  return {
    message: "Job completed successfully",
    job,
    request,
    notification: {
      clientToken: client?.expoPushToken || null,
      jobId: job._id,
    },
  };
};

exports.rateJob = async (clientId, jobId, rating, review = "") => {
  const { job } = await getJobWithRequest(jobId);

  if (job.client.toString() !== clientId) {
    throw createError(403, "Unauthorized");
  }

  if (job.status !== "completed") {
    throw createError(400, "Only completed jobs can be rated");
  }

  const numericRating = Number(rating);
  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    throw createError(400, "Rating must be a number between 1 and 5");
  }

  if (job.rating != null) {
    throw createError(400, "This job has already been rated");
  }

  job.rating = numericRating;
  job.review = typeof review === "string" ? review.trim() : "";
  await job.save();

  const provider = await User.findById(job.provider);
  if (!provider?.providerDetails) {
    throw createError(404, "Provider not found");
  }

  return {
    message: "Job rated successfully",
    job,
    provider: {
      id: provider._id,
      trustScore: provider.providerDetails.trustScore,
      ratingCount: provider.providerDetails.ratingCount,
    },
  };
};

exports.cancelJob = async (userId, jobId) => {
  const { job, request } = await getJobWithRequest(jobId);

  const isClient = job.client.toString() === userId;
  const isProvider = job.provider.toString() === userId;

  if (!isClient && !isProvider) {
    throw createError(403, "Unauthorized");
  }

  if (job.status !== "active") {
    throw createError(400, "Only active jobs can be cancelled");
  }

  job.status = "cancelled";
  await job.save();

  await restoreProviderAvailability(job.provider, job.availabilitySnapshot);

  request.status = "cancelled";
  await request.save();

  const otherPartyId = isClient ? job.provider : job.client;
  const otherParty = await User.findById(otherPartyId).select("expoPushToken");

  return {
    message: "Job cancelled successfully",
    job,
    request,
    notification: {
      otherPartyToken: otherParty?.expoPushToken || null,
      jobId: job._id,
    },
  };
};

exports.getMyJobs = async (userId, role) => {
  const filter = role === "provider" ? { provider: userId } : { client: userId };

  return Job.find(filter)
    .populate("serviceRequest")
    .populate("provider", "name email photoUrl")
    .populate("client", "name email photoUrl")
    .populate("match")
    .sort({ createdAt: -1 });
};

exports.getAllJobs = async () =>
  Job.find()
    .populate("serviceRequest")
    .populate("provider", "name email photoUrl")
    .populate("client", "name email photoUrl")
    .populate("match")
    .sort({ createdAt: -1 });
