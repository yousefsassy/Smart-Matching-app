const express = require("express");
const multer = require("multer");

const isAuth = require("../middlewares/isAuth");
const isAutho = require("../middlewares/isAutho");
const {
  updateProfilePhoto,
  updateProfile,
  getMyProfile,     // Added
  getProfileById,    // Added
} = require("../controllers/profile");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 1. Get my own profile
router.get(
  "/me", 
  isAuth, 
  isAutho(["client", "provider"]), 
  getMyProfile
);

// 2. Get a specific profile by ID (e.g., Client viewing a Provider)
// Note: This must come AFTER /me
router.get(
  "/:id", 
  isAuth, 
  isAutho(["client", "provider"]), 
  getProfileById
);

// 3. Update profile photo
router.patch(
  "/photo",
  isAuth,
  isAutho(["client", "provider"]),
  upload.single("photo"),
  updateProfilePhoto
);

// 4. Update profile text fields
router.patch(
  "/", 
  isAuth, 
  isAutho(["client", "provider"]), 
  updateProfile
);

module.exports = router;