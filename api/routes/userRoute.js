const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUsers,
  getOneUser,
} = require("../controllers/userController");

const isAuth = require("../middlewares/isAuth");
const isAutho = require("../middlewares/isAutho");

// ===== Public routes =====
router.post("/register", registerUser);
router.post("/login", loginUser);

// ===== Protected routes =====
router.post("/logout", isAuth, logoutUser);

// ===== Admin-only routes =====
router.get("/", isAuth, isAutho(["admin"]), getUsers);
router.get("/:id", isAuth, getOneUser);

module.exports = router;
