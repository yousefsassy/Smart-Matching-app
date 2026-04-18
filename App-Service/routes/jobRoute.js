// routes/jobRoute.js
const express = require("express");
const router = express.Router();

const isAuth = require("../middlewares/isAuth");
const isAutho = require("../middlewares/isAutho");

const {
  acceptMatch,
  startJob,
  completeJob,
  cancelJob,
  getMyJobs,
} = require("../controllers/JobController");

// Provider accepts match
router.post(
  "/match/:matchId/accept",
  isAuth,
  isAutho(["provider"]),
  acceptMatch
);

// Job lifecycle
router.patch("/:jobId/start", isAuth, isAutho(["provider"]), startJob);

router.patch("/:jobId/complete", isAuth, isAutho(["provider"]), completeJob);

router.patch(
  "/:jobId/cancel",
  isAuth,
  isAutho(["client", "provider"]),
  cancelJob
);

// Get jobs
router.get(
  "/me",
  isAuth,
  isAutho(["client", "provider"]),
  getMyJobs
);

module.exports = router;