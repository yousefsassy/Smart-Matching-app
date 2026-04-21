const express = require("express");
const router = express.Router();
const computeFeatures = require("../middlewares/computeFeatures");
const matchController = require("../controllers/match");

router.post("/:id/match", computeFeatures, matchController.match);
router.po

module.exports = router;