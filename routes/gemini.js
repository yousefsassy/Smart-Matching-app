const express = require("express");
const router = express.Router();
const computeFeatures = require("../middlewares/computeFeatures");
const geminiController = require("../controllers/gemini");

router.post("/match", geminiController.matchProviders); //for testing without service request
router.post("/:id/match", computeFeatures, geminiController.matchProviders); // main endpoint for matching providers to a service request, with feature computation middleware

module.exports = router;
