const ServiceRequest = require("../models/ServiceRequest");
const Match = require("../models/Match");
const matchService = require("../services/match");

// Create a new service request (clients only)
exports.createServiceRequest = async (req, res) => {
  try {
    const {
      serviceType,
      location,
      description = "",
      date,
      timeWindow,
      budget,
    } = req.body;

    const clientId = req.user.id;

    // =========================
    // VALIDATIONS
    // =========================
    if (!serviceType) {
      return res.status(400).json({ message: "Service type is required" });
    }

    if (!location || !location.regionText) {
      return res.status(400).json({ message: "Location regionText is required" });
    }

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    if (!timeWindow?.start || !timeWindow?.end) {
      return res.status(400).json({ message: "Time window is required" });
    }

    if (budget?.min == null || budget?.max == null) {
      return res.status(400).json({ message: "Budget range is required" });
    }

    if (budget.min > budget.max) {
      return res.status(400).json({
        message: "Budget min cannot be greater than max",
      });
    }

    // =========================
    // GEO NORMALIZATION (IMPORTANT FIX)
    // =========================
    let geo = null;

    if (
      location.geo &&
      Array.isArray(location.geo.coordinates) &&
      location.geo.coordinates.length === 2 &&
      location.geo.coordinates.every((n) => typeof n === "number")
    ) {
      geo = {
        type: "Point",
        coordinates: location.geo.coordinates, // [lng, lat]
      };
    }

    // =========================
    // CREATE REQUEST
    // =========================
    const newRequest = new ServiceRequest({
      client: clientId,
      serviceType,
      location: {
        regionText: location.regionText,
        geo: geo, // can be null safely
      },
      description,
      date,
      timeWindow,
      budget,
      status: "pending",
    });

    const savedRequest = await newRequest.save();
    let matching = null;

    try {
      matching = await matchService.generateMatches(savedRequest._id);
    } catch (error) {
      console.error("Initial match generation failed:", error.message);
      matching = {
        message:
          "Service request created, but match generation failed. The request remains pending.",
        matches: [],
        usedFallback: true,
      };
    }

    return res.status(201).json({
      message:
        matching?.message === "No providers available"
          ? "Service request created successfully, but no providers are available right now"
          : "Service request created successfully",
      request: savedRequest,
      matches: matching?.matches || [],
      matching,
    });
  } catch (error) {
    console.error("Create request error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find().populate("client", "name email");
    return res.json(requests);
  } catch (error) {
    console.error("Get all requests error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Client: Get my requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ client: req.user.id })
      .sort({ createdAt: -1 })
      .populate("client", "name email");
    return res.json(requests);
  } catch (error) {
    console.error("Get my requests error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get a single request by ID (admin or owner client)
exports.getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id).populate("client", "name email");
    if (!request) return res.status(404).json({ message: "Service request not found" });

    // client can access only their own request
    if (req.user.role === "client" && request.client._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json(request);
  } catch (error) {
    console.error("Get request by ID error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Client: Cancel request (soft cancel)
exports.cancelRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Service request not found" });

    // Ownership check
    if (request.client.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Only allow cancel before job exists
    if (!["pending", "matched"].includes(request.status)) {
      return res.status(400).json({
        message: "Request cannot be cancelled at this stage. Cancel the job instead.",
      });
    }

    request.status = "cancelled";
    await request.save();

    await Match.updateMany(
      {
        serviceRequest: request._id,
        status: { $in: ["pending", "selected"] },
      },
      { status: "rejected", selected: false }
    );

    return res.json({ message: "Service request cancelled", request });
  } catch (error) {
    console.error("Cancel request error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update request status (admin only)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Service request not found" });

    request.status = status;
    await request.save();

    return res.json({ message: "Status updated", request });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete request (admin only)
exports.deleteRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Service request not found" });

    await request.deleteOne();
    return res.json({ message: "Service request deleted" });
  } catch (error) {
    console.error("Delete request error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
