require("dotenv").config();

const fs = require("fs");
const validator = require("validator");

const cloudinary = require("../config/cloudinary");
const User = require("../models/user");

const CLOUDINARY_ERROR_MESSAGE =
  "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_SECRET_KEY in .env";

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_SECRET_KEY
  );
};

const removeTempFile = (filePath) => {
  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Failed to remove temp file:", error);
  }
};

const sanitizeUser = (user) => {
  return {
    _id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone,
    photoUrl: user.photoUrl,
    expoPushToken: user.expoPushToken || null, 
    clientDetails: user.clientDetails,
    providerDetails: user.providerDetails,
  };
};

const normalizeOptionalString = (value) => {
  if (typeof value !== "string") return null;
  return value.trim();
};

const extractRegionText = (body, role) => {
  if (Object.prototype.hasOwnProperty.call(body, "regionText")) {
    if (typeof body.regionText !== "string") {
      throw { status: 400, message: "Invalid payload shape for regionText" };
    }

    return body.regionText.trim();
  }

  if (role === "client" && body.clientDetails !== undefined) {
    if (
      !body.clientDetails ||
      typeof body.clientDetails !== "object" ||
      Array.isArray(body.clientDetails)
    ) {
      throw { status: 400, message: "Invalid payload shape for regionText" };
    }

    if (Object.prototype.hasOwnProperty.call(body.clientDetails, "regionText")) {
      if (typeof body.clientDetails.regionText !== "string") {
        throw { status: 400, message: "Invalid payload shape for regionText" };
      }

      return body.clientDetails.regionText.trim();
    }
  }

  if (role === "provider" && body.providerDetails !== undefined) {
    if (
      !body.providerDetails ||
      typeof body.providerDetails !== "object" ||
      Array.isArray(body.providerDetails)
    ) {
      throw { status: 400, message: "Invalid payload shape for regionText" };
    }

    if (
      body.providerDetails.location !== undefined &&
      (!body.providerDetails.location ||
        typeof body.providerDetails.location !== "object" ||
        Array.isArray(body.providerDetails.location))
    ) {
      throw { status: 400, message: "Invalid payload shape for regionText" };
    }

    if (
      body.providerDetails.location &&
      Object.prototype.hasOwnProperty.call(body.providerDetails.location, "regionText")
    ) {
      if (typeof body.providerDetails.location.regionText !== "string") {
        throw { status: 400, message: "Invalid payload shape for regionText" };
      }

      return body.providerDetails.location.regionText.trim();
    }
  }

  return null;
};

exports.updateProfilePhoto = async (req) => {
  if (!req.file) {
    throw { status: 400, message: "No file uploaded" };
  }

  if (!isCloudinaryConfigured()) {
    removeTempFile(req.file.path);
    throw { status: 500, message: CLOUDINARY_ERROR_MESSAGE };
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    removeTempFile(req.file.path);
    throw { status: 404, message: "User not found" };
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile-photos",
      resource_type: "image",
    });

    user.photoUrl = result.secure_url;
    await user.save();

    return {
      status: 200,
      data: {
        message: "Profile photo updated successfully",
        photoUrl: user.photoUrl,
        user: sanitizeUser(user),
      },
    };
  } catch (error) {
    throw { status: 500, message: "Cloudinary upload failed" };
  } finally {
    removeTempFile(req.file.path);
  }
};

exports.updateProfile = async (req) => {
  // Finding the user based on the ID injected by isAuth middleware
  const user = await User.findById(req.user.id);

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  let hasSupportedField = false;

  // 1. Handle Standard Profile Fields
  if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
    const name = normalizeOptionalString(req.body.name);
    if (name !== null) {
      user.name = name;
      hasSupportedField = true;
    }
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "phone")) {
    const phone = normalizeOptionalString(req.body.phone);
    if (phone !== null) {
      user.phone = phone;
      hasSupportedField = true;
    }
  }

  // 2. Handle Push Notification Token
  if (Object.prototype.hasOwnProperty.call(req.body, "expoPushToken")) {
    const token = req.body.expoPushToken;
    
    // Accept string for valid tokens or null for logouts
    if (typeof token === "string" || token === null) {
      user.expoPushToken = token;
      hasSupportedField = true;
    } else {
      throw { status: 400, message: "Invalid expoPushToken format" };
    }
  }

  // 3. Handle Email Updates (with duplicate check)
  if (Object.prototype.hasOwnProperty.call(req.body, "email")) {
    if (typeof req.body.email !== "string") {
      throw { status: 400, message: "Invalid email format" };
    }

    const email = req.body.email.trim().toLowerCase();
    if (!validator.isEmail(email)) {
      throw { status: 400, message: "Invalid email format" };
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      throw { status: 400, message: "Email already used" };
    }

    user.email = email;
    hasSupportedField = true;
  }

  // 4. Handle Region Updates
  const regionText = extractRegionText(req.body, user.role);
  if (regionText !== null) {
    if (user.role === "client") {
      if (!user.clientDetails) user.clientDetails = {};
      user.clientDetails.regionText = regionText;
    }

    if (user.role === "provider") {
      if (!user.providerDetails || !user.providerDetails.location) {
        throw { status: 400, message: "Provider location is missing" };
      }
      user.providerDetails.location.regionText = regionText;
    }
    hasSupportedField = true;
  }

  // Final validation and save
  if (!hasSupportedField) {
    throw {
      status: 400,
      message: "Request body contains no supported updatable fields",
    };
  }

  await user.save();

  return {
    status: 200,
    data: {
      message: "Profile updated successfully",
      user: sanitizeUser(user),
    },
  };
};
exports.getMyProfile = async (req) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  return {
    status: 200,
    data: {
      user: sanitizeUser(user),
    },
  };
};
// ... existing code ...

exports.getProfileById = async (req) => {
  const { id } = req.params;

  // Basic validation for the ID
  if (!id) {
    throw { status: 400, message: "User ID is required" };
  }

  const user = await User.findById(id);

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  return {
    status: 200,
    data: {
      user: sanitizeUser(user),
    },
  };
};