const express = require("express");
const router = express.Router();

const {
  getUsers,
  getProviders,
  getClients,
  getOneUser,
  approveProvider,
  rejectProvider,
  deleteProvider, 
} = require("../controllers/adminController");

const isAuth = require("../middlewares/isAuth");
const isAutho = require("../middlewares/isAutho");

// ===== Admin-only routes =====
router.get("/", isAuth, isAutho(["admin"]), getUsers);
router.get("/providers", isAuth, isAutho(["admin"]), getProviders);
router.get("/clients", isAuth, isAutho(["admin"]), getClients);

// Keep this LAST (dynamic route)
router.get("/:id", isAuth, getOneUser);

// ===== Admin provider approval/rejection =====
router.patch("/provider/:id/approve", isAuth, isAutho(["admin"]), approveProvider);
router.patch("/provider/:id/reject", isAuth, isAutho(["admin"]), rejectProvider);
// ===== Delete provider =====
router.delete(
  "/provider/:id",
  isAuth,
  isAutho(["admin"]),
  deleteProvider
);

module.exports = router;