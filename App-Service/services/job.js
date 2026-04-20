// services/jobService.js
const Job = require("../models/Job");
const Match = require("../models/Match");
const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/user");

// ------------------ HELPERS ------------------

const toMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const isOverlapping = (a, b) => {
  return toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end);
};

// ------------------ ACCEPT MATCH ------------------

exports.acceptMatch = async (providerId, matchId) => {
  const match = await Match.findById(matchId).populate("serviceRequest");

  if (!match) throw { status: 404, message: "Match not found" };
  if (match.provider.toString() !== providerId)
    throw { status: 403, message: "Unauthorized" };

  if (match.status !== "pending")
    throw { status: 400, message: "Match already processed" };

  const request = match.serviceRequest;

  // 🔴 CHECK DOUBLE BOOKING
  const existingJobs = await Job.find({
    provider: providerId,
    date: request.date,
    status: { $in: ["pending", "in_progress"] },
  });

  for (const job of existingJobs) {
    if (isOverlapping(job.timeWindow, request.timeWindow)) {
      throw { status: 400, message: "Time slot already booked" };
    }
  }

  // 🔵 ATOMIC MATCH ACCEPT
  const updatedMatch = await Match.findOneAndUpdate(
    { _id: matchId, status: "pending" },
    { status: "accepted" },
    { new: true }
  );

  if (!updatedMatch)
    throw { status: 400, message: "Match already taken" };

  // 🟢 CREATE JOB
  const job = await Job.create({
    serviceRequest: request._id,
    match: matchId,
    client: request.client,
    provider: providerId,
    date: request.date,
    timeWindow: request.timeWindow,
  });

  // 🟡 UPDATE REQUEST
  request.status = "assigned";
  await request.save();

  // 🔴 REJECT OTHER MATCHES
  await Match.updateMany(
    { serviceRequest: request._id, _id: { $ne: matchId } },
    { status: "rejected" }
  );

  // 🔴 REMOVE SLOT FROM AVAILABILITY
  const provider = await User.findById(providerId);

  provider.providerDetails.availability =
    provider.providerDetails.availability.filter(
      (slot) =>
        new Date(slot.date).getTime() !== new Date(request.date).getTime()
    );

  await provider.save();

  return { message: "Job created successfully", job };
};

// ------------------ START JOB ------------------

exports.startJob = async (providerId, jobId) => {
  const job = await Job.findById(jobId);

  if (!job) throw { status: 404, message: "Job not found" };
  if (job.provider.toString() !== providerId)
    throw { status: 403, message: "Unauthorized" };

  if (job.status !== "pending")
    throw { status: 400, message: "Job cannot be started" };

  job.status = "in_progress";
  await job.save();

  await ServiceRequest.findByIdAndUpdate(job.serviceRequest, {
    status: "in_progress",
  });

  return { message: "Job started", job };
};

// ------------------ COMPLETE JOB ------------------

exports.completeJob = async (providerId, jobId) => {
  const job = await Job.findById(jobId);

  if (!job) throw { status: 404, message: "Job not found" };
  if (job.provider.toString() !== providerId)
    throw { status: 403, message: "Unauthorized" };

  job.status = "completed";
  await job.save();

  // 🟢 RESTORE SLOT
  const provider = await User.findById(providerId);

  provider.providerDetails.availability.push({
    date: job.date,
    slot1: job.timeWindow,
    slot2: null,
  });

  await provider.save();

  await ServiceRequest.findByIdAndUpdate(job.serviceRequest, {
    status: "completed",
  });

  return { message: "Job completed", job };
};

// ------------------ CANCEL JOB ------------------

exports.cancelJob = async (userId, jobId) => {
  const job = await Job.findById(jobId);

  if (!job) throw { status: 404, message: "Job not found" };

  if (
    job.provider.toString() !== userId &&
    job.client.toString() !== userId
  ) {
    throw { status: 403, message: "Unauthorized" };
  }

  job.status = "cancelled";
  await job.save();

  // 🔵 RESTORE SLOT
  const provider = await User.findById(job.provider);

  provider.providerDetails.availability.push({
    date: job.date,
    slot1: job.timeWindow,
    slot2: null,
  });

  await provider.save();

  await ServiceRequest.findByIdAndUpdate(job.serviceRequest, {
    status: "cancelled",
  });

  return { message: "Job cancelled", job };
};

// ------------------ GET JOBS ------------------

exports.getMyJobs = async (userId, role) => {
  const filter =
    role === "provider"
      ? { provider: userId }
      : { client: userId };

  return await Job.find(filter)
    .populate("serviceRequest")
    .populate("provider", "name email")
    .populate("client", "name email")
    .sort({ createdAt: -1 });
};