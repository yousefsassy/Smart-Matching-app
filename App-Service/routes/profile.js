const express = require("express");
const multer = require("multer");

const isAuth = require("../middlewares/isAuth");
const isAutho = require("../middlewares/isAutho");
const {
  updateProfilePhoto,
  updateProfile,
} = require("../controllers/profile");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.patch(
  "/photo",
  isAuth,
  isAutho(["client", "provider"]),
  upload.single("photo"),
  updateProfilePhoto
);

router.patch("/", isAuth, isAutho(["client", "provider"]), updateProfile);

module.exports = router;
