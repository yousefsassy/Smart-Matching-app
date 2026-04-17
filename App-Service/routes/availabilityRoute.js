const express = require("express");

const isAuth = require("../middlewares/isAuth");
const isAutho = require("../middlewares/isAutho");
const {
  getMe,
  toggleOnline,
  syncAvailability,
  deleteAvailability,
} = require("../controllers/availability");

const router = express.Router();

router.get("/me", isAuth, isAutho(["provider"]), getMe);
router.patch("/toggle-online", isAuth, isAutho(["provider"]), toggleOnline);
router.post("/sync", isAuth, isAutho(["provider"]), syncAvailability);
router.delete("/:date", isAuth, isAutho(["provider"]), deleteAvailability);

module.exports = router;
