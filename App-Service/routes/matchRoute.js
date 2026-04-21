const express = require("express");
const router = express.Router();

const {
  generateMatches,
  selectMatch,
  respondToMatch,
  expireMatch,
  getMatchesByRequest,
} = require("../controllers/MatchController");

const isAuth = require("../middlewares/isAuth");
const isAutho = require("../middlewares/isAutho");

// -----------------------------
// Generate matches (ADMIN ONLY)
// -----------------------------
router.post(
  "/generate/:requestId",
  isAuth,
  isAutho(["admin"]),
  generateMatches
);

// -----------------------------
// Get matches for a request
// -----------------------------
router.get(
  "/request/:requestId",
  isAuth,
  isAutho(["client", "admin"]),
  getMatchesByRequest
);

// -----------------------------
// Client selects match
// -----------------------------
router.post(
  "/:matchId/select",
  isAuth,
  isAutho(["client"]),
  selectMatch
);

router.post(
  "/:matchId/respond",
  isAuth,
  isAutho(["provider"]),
  respondToMatch
);

router.post(
  "/:matchId/expire",
  isAuth,
  isAutho(["admin"]),
  expireMatch
);

module.exports = router;
