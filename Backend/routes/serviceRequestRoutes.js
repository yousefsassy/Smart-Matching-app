const express = require("express");
const router = express.Router();

const {
  createServiceRequest,
  getAllRequests,
  getMyRequests,
  getRequestById,
  cancelRequest,
  updateRequestStatus,
  deleteRequest,
} = require("../controllers/serviceRequestController");

const isAuth = require("../middlewares/isAuth");
const isAutho = require("../middlewares/isAutho");

// Create a service request (client only)
router.post("/", isAuth, isAutho(["client"]), createServiceRequest);

// Admin: get all requests
router.get("/", isAuth, isAutho(["admin"]), getAllRequests);

// Client: get my requests (must be BEFORE /:id)
router.get("/my", isAuth, isAutho(["client"]), getMyRequests);

// Get single request by ID (admin or owner client)
router.get("/:id", isAuth, isAutho(["admin", "client"]), getRequestById);

// Client: cancel request (soft cancel)
router.patch("/:id/cancel", isAuth, isAutho(["client"]), cancelRequest);

// Admin: update request status
router.put("/:id/status", isAuth, isAutho(["admin"]), updateRequestStatus);

// Admin: delete request (hard delete, optional)
router.delete("/:id", isAuth, isAutho(["admin"]), deleteRequest);

module.exports = router;