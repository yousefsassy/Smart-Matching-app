// routes/jobRoute.js
const express = require("express");
const router = express.Router();

const isAuth = require("../middlewares/isAuth");
const isAutho = require("../middlewares/isAutho");

const {
  completeJob,
  rateJob,
  cancelJob,
  getMyJobs,
  getAllJobs,
} = require("../controllers/JobController");

router.patch("/:id/complete", isAuth, isAutho(["provider"]), completeJob);

router.post("/:id/rate", isAuth, isAutho(["client"]), rateJob);

router.post(
  "/:id/cancel",
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

router.get("/", isAuth, isAutho(["admin"]), getAllJobs);

module.exports = router;
