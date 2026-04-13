const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser
} = require("../controllers/userController");

const isAuth = require("../middlewares/isAuth");
const isAutho = require("../middlewares/isAutho");

// ===== Public routes =====
router.post("/register", registerUser);
router.post("/login", loginUser);

// ===== Protected routes =====
router.post("/logout", isAuth, logoutUser);

module.exports = router;