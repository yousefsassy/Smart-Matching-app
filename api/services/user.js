require("dotenv").config();
const bcrypt = require("bcryptjs");
const userModel = require("../models/user");
const { signAccessToken } = require("../config/jwt");



// might need those later on :

// const validator = require("validator");
// const crypto = require("crypto");
//const cloudinary = require("cloudinary").v2;
//const accountveriftokenModel = require("../models/accountveriftoken");
//const resetpasswordtokenModel = require("../models/resetpasswordtoken");
//const uploadPdfToCloudinary = require("../utils/uploadPdfCloudinary");
//const nodemailer = require("nodemailer");


class AuthError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const { error } = require("console");

exports.login = async (email, password) => {

  // we'll bypass verification for now 

  if (!email || !password) throw new AuthError("Email and password are required.", 400);

    const normalizedEmail = email.trim().toLowerCase();


  const user = await userModel
    .findOne({ email: normalizedEmail })
    
    if (!user) throw new AuthError("Invalid credentials.", 401);

  const ok = await bcrypt.compare(password, user.passwordHash);

  if (!ok) throw new AuthError("Invalid credentials.", 401);

  if (user.role === "admin") {
    await Admin.findOneAndUpdate(
      { userId: user._id },
      { lastLoginAt: new Date() },
      { upsert: true }
    );
  }

  const token = signAccessToken(user);

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isVerified: true // temporary
    },
    token,
  };
};

exports.signup=async()=>{
 
    // required fields
  if (!email || !password || !role || !phone) {
    throw new AuthError("email, password, role, and phone are required.", 400);
  }

  if (!["client", "provider", "admin"].includes(role)) {
    throw new AuthError("Invalid role.", 400);
  }

  if (["client", "provider"].includes(role) && !location) {
    throw new AuthError("location is required for client/provider.", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new AuthError("Email already in use.", 409);

  // hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // build doc based on role
  const doc = {
    email: normalizedEmail,
    passwordHash,
    role,
    phone: phone.trim(),
    isVerified: true, // temporary
  };

  if (role === "client") {
    doc.clientDetails = { location: location.trim() };
  } else if (role === "provider") {
    doc.providerDetails = { location: location.trim() };
    // fieldOfService omitted for now 
  } else if (role === "admin") {
    doc.adminDetails = { permissions: [], lastLoginAt: null };
  }

  const user = await User.create(doc);

  const token = signAccessToken(user);

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified, 
    },

    token,
  };

};


exports.forgetPassword = async (email) => {

  //TODO : later

};


exports.getUserData = async (userId) => {
  try {
    const user = await userModel.findById(userId).select("-password -__v"); // do not return pwd and __v fields from mongo 
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};
