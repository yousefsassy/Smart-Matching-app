const ServiceRequest = require("../models/ServiceRequest");
const { match} = require("../services/match");


exports.match = async (req, res, next) => {
    try {
    const serviceRequest = await ServiceRequest.findById(req.params.id).lean();

    if (!serviceRequest) {
      return res.status(404).json({ error: "Service request not found" });
    }

    if (serviceRequest.status !== "pending") {
      return res.status(400).json({
        error: `Cannot match a request with status: ${serviceRequest.status}`,
      });
    }

    req.serviceRequest = serviceRequest;

    const topProviders = await match(
      serviceRequest._id,
      req.candidates
    );

    res.status(200).json({
      success: true,
      topProviders,
    });
  } catch (err) {
    next(err);
  }
}

