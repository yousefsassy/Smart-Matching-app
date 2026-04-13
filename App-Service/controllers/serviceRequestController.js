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
    if (!timeWindow || !timeWindow.start || !timeWindow.end) return res.status(400).json({ message: "Time window is required" });
    if (!budget || budget.min == null || budget.max == null) return res.status(400).json({ message: "Budget range is required" });
    if (budget.min > budget.max) return res.status(400).json({ message: "Budget min cannot be greater than max" });

    const newRequest = new ServiceRequest({ client: clientId, serviceType, location, description, date, timeWindow, budget });
    const savedRequest = await newRequest.save();

    res.status(201).json({ message: "Service request created successfully", request: savedRequest });

  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get service requests
exports.getAllRequests = async (req, res) => {
  try {
    let requests;

    if (req.user.role === "admin") {
      requests = await ServiceRequest.find().populate("client", "name email");
    } else {
      // client sees only their own requests
      requests = await ServiceRequest.find({ client: req.user.id }).populate("client", "name email");
    }

    res.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id).populate("client", "name email");
    if (!request) return res.status(404).json({ message: "Service request not found" });

    // client can access only their own request
    if (req.user.role === "client" && request.client._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(request);
  } catch (error) {
    console.error("Get request by ID error:", error);
    res.status(500).json({ message: "Server error" });
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

    res.json({ message: "Status updated", request });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete request (admin only)
exports.deleteRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Service request not found" });

    await request.remove();
    res.json({ message: "Service request deleted" });
  } catch (error) {
    console.error("Delete request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};