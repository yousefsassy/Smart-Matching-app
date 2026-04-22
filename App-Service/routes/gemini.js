const express = require("express");
const router = express.Router();
const computeFeatures = require("../middlewares/computeFeatures");
const geminiController = require("../controllers/gemini");
const isAuth = require("../middlewares/isAuth");
const isAutho = require("../middlewares/isAutho");

router.post("/match", isAuth, isAutho(["admin"]), geminiController.matchProviders);
router.post(
  "/:id/match",
  isAuth,
  isAutho(["admin"]),
  computeFeatures,
  geminiController.matchProviders
);

module.exports = router;
