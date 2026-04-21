const express = require("express");
const router = express.Router();
const requestController = require("../controllers/request");

router.post("/", requestController.createRequest);

module.exports = router;