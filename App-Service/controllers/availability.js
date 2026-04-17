const availabilityService = require("../services/availability");

const handleError = (res, error) => {
  console.error(error);

  if (error && error.status) {
    return res.status(error.status).json({ message: error.message });
  }

  return res.status(500).json({ message: "Server error" });
};

exports.getMe = async (req, res) => {
  try {
    const result = await availabilityService.getMyAvailability(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.toggleOnline = async (req, res) => {
  try {
    const result = await availabilityService.toggleOnline(req.user.id, req.body.isAvailable);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.syncAvailability = async (req, res) => {
  try {
    const result = await availabilityService.syncAvailability(req.user.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.deleteAvailability = async (req, res) => {
  try {
    const result = await availabilityService.deleteAvailability(req.user.id, req.params.date);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
};
