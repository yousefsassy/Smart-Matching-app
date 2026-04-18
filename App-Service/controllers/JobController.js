// controllers/jobController.js
const jobService = require("../services/job");

const handle = (res, fn) =>
  fn.then((data) => res.json(data)).catch((err) =>
    res.status(err.status || 500).json({ message: err.message })
  );

exports.acceptMatch = (req, res) =>
  handle(res, jobService.acceptMatch(req.user.id, req.params.matchId));

exports.startJob = (req, res) =>
  handle(res, jobService.startJob(req.user.id, req.params.jobId));

exports.completeJob = (req, res) =>
  handle(res, jobService.completeJob(req.user.id, req.params.jobId));

exports.cancelJob = (req, res) =>
  handle(res, jobService.cancelJob(req.user.id, req.params.jobId));

exports.getMyJobs = (req, res) =>
  handle(res, jobService.getMyJobs(req.user.id, req.user.role));