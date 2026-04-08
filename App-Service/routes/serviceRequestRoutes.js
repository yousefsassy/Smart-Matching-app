const express = require("express");
const router = express.Router();

const {
  createServiceRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
} = require("../controllers/serviceRequestController");

const isAuth = require("../middlewares/isAuth");
const isAutho = require("../middlewares/isAutho");

// Create a service request (clients only)
router.post("/", isAuth, isAutho(["client"]), createServiceRequest);

// Get all requests (admin sees all, client sees own)
router.get("/", isAuth, isAutho(["admin", "client"]), getAllRequests);

// Get single request by ID
router.get("/:id", isAuth, isAutho(["admin", "client"]), getRequestById);

// Update request status (admin only)
router.put("/:id/status", isAuth, isAutho(["admin"]), updateRequestStatus);

// Delete request (admin only)
router.delete("/:id", isAuth, isAutho(["admin"]), deleteRequest);

module.exports = router;