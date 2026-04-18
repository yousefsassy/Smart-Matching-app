const matchService = require("../services/match");

// helper wrapper
const handle = (res, fn) =>
  fn
    .then((data) => res.json(data))
    .catch((err) =>
      res.status(500).json({ message: err.message })
    );

// -----------------------------
// Generate matches (ADMIN/system)
// -----------------------------
exports.generateMatches = (req, res) =>
  handle(res, matchService.generateMatches(req.params.requestId));

// -----------------------------
// Client selects match
// -----------------------------
exports.selectMatch = (req, res) =>
  handle(
    res,
    matchService.selectMatch(req.params.matchId, req.user.id)
  );

// -----------------------------
// Get matches for request
// -----------------------------
exports.getMatchesByRequest = (req, res) =>
  handle(res, matchService.getMatchesByRequest(req.params.requestId));