const ServiceRequest = require("../models/ServiceRequest");

// Create a new service request (clients only)
exports.createServiceRequest = async (req, res) => {
  try {
    const { serviceType, location, description = "", date, timeWindow, budget } = req.body;
    const clientId = req.user.id;

    // --- Validations ---
    if (!serviceType) return res.status(400).json({ message: "Service type is required" });
    if (!location || !location.regionText) return res.status(400).json({ message: "Location is required" });
    if (!date) return res.status(400).json({ message: "Date is required" });
    if (!timeWindow || !timeWindow.start || !timeWindow.end)
      return res.status(400).json({ message: "Time window is required" });
    if (!budget || budget.min == null || budget.max == null)
      return res.status(400).json({ message: "Budget range is required" });
    if (budget.min > budget.max)
      return res.status(400).json({ message: "Budget min cannot be greater than max" });

    const newRequest = new ServiceRequest({
      client: clientId,
      serviceType,
      location,
      description,
      date,
      timeWindow,
      budget,
    });

    const savedRequest = await newRequest.save();

    // TODO: Trigger matching service here
    // 1) Filter providers in DB (serviceType, distance, availability, isVerified)
    // 2) Call AI/LLM ranking to return Top 3
    // 3) Create 3 Match records: { serviceRequest, provider, rank, score, reasoning, status="pending" }

    return res.status(201).json({
      message: "Service request created successfully",
      request: savedRequest,
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