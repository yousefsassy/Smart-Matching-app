const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUsers,
  getOneUser,
  approveProvider,
  rejectProvider,
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

// ===== Admin provider approval/rejection =====
router.patch("/provider/:id/approve", isAuth, isAutho(["admin"]), approveProvider);
router.patch("/provider/:id/reject", isAuth, isAutho(["admin"]), rejectProvider);

module.exports = router;