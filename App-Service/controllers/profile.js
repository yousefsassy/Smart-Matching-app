const profileService = require("../services/profile");

const handleError = (res, error) => {
  console.error(error);

  if (error && error.status) {
    return res.status(error.status).json({ message: error.message });
  }

  return res.status(500).json({ message: "Server error" });
};

exports.updateProfilePhoto = async (req, res) => {
  try {
    const result = await profileService.updateProfilePhoto(req);
    return res.status(result.status).json(result.data);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const result = await profileService.updateProfile(req);
    return res.status(result.status).json(result.data);
  } catch (error) {
    return handleError(res, error);
  }
};
