const jobService = require("../services/job");
const {
  sendJobCancelledAlert,
  sendJobCompletedAlert,
} = require("../services/notifications");

const handleError = (res, error) =>
  res.status(error.status || 500).json({ message: error.message || "Server error" });

exports.completeJob = async (req, res) => {
  try {
    const result = await jobService.completeJob(req.user.id, req.params.id);
    const { notification, ...payload } = result;

    if (notification?.clientToken) {
      try {
        await sendJobCompletedAlert(notification.clientToken, notification.jobId);
      } catch (error) {
        console.error("sendJobCompletedAlert failed:", error.message);
      }
    }

    return res.json(payload);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.rateJob = async (req, res) => {
  try {
    const result = await jobService.rateJob(
      req.user.id,
      req.params.id,
      req.body.rating,
      req.body.review
    );

    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.cancelJob = async (req, res) => {
  try {
    const result = await jobService.cancelJob(req.user.id, req.params.id);
    const { notification, ...payload } = result;

    if (notification?.otherPartyToken) {
      try {
        await sendJobCancelledAlert(
          notification.otherPartyToken,
          notification.jobId
        );
      } catch (error) {
        console.error("sendJobCancelledAlert failed:", error.message);
      }
    }

    return res.json(payload);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await jobService.getMyJobs(req.user.id, req.user.role);
    return res.json(jobs);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await jobService.getAllJobs();
    return res.json(jobs);
  } catch (error) {
    return handleError(res, error);
  }
};
