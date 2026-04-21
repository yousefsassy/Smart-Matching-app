const express = require("express");
const router = express.Router();
const clientController = require("../controllers/client");

router.post("/", clientController.createClient); // Just for testing, will be handled by admin later

module.exports = router;