const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { sendProviderApprovedEmail } = require("../utils/mailer");

// ===== Register User =====
const registerUser = async (req, res) => {
  try {
    const { email, password, role, phone, providerDetails } = req.body;

    if (role === "admin") {
  console.log("⚠️ Admin account is being registered via API");
}

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    let newUserData = { email, passwordHash, role, phone };
    let resMessage = "User registered successfully";

    if (role === "provider") {
      if (!providerDetails?.location || !providerDetails?.fieldOfService)
        return res.status(400).json({ message: "Provider must provide location and fieldOfService" });

      newUserData.providerDetails = {
        location: providerDetails.location,
        fieldOfService: providerDetails.fieldOfService,
        trustScore: 0,
        isAvailable: true,
        isVerified: false, // admin must approve
      };

      resMessage = "Provider registered successfully, pending admin approval";
    }

    const newUser = new User(newUserData);
    await newUser.save();

    res.status(201).json({ message: resMessage, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Login User =====
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Block login if provider not verified
    if (user.role === "provider" && !user.providerDetails.isVerified) {
      return res
        .status(403)
        .json({ message: "Provider account pending admin approval" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Logout User =====
const logoutUser = (req, res) => {
  res.json({ message: "Logout successful - remove token from localStorage on frontend" });
};

// ===== Get all users (Admin only) =====
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Get one user by ID (Admin or self) =====
const getOneUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role !== "admin" && req.user.id !== id)
      return res.status(403).json({ message: "Access forbidden" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Admin Approve Provider =====
const approveProvider = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "provider")
      return res.status(404).json({ message: "Provider not found" });

    user.providerDetails.isVerified = true;
    await user.save();

    // Send email (do not block approval if email fails)
    try {
      await sendProviderApprovedEmail(user.email);
    } catch (emailErr) {
      console.error("Approval email failed:", emailErr.message);
    }

    return res.json({ message: "Provider approved successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===== Admin Reject Provider =====
// userController.js
const rejectProvider = async (req, res) => {
  try {
    console.log("📝 rejectProvider called with ID:", req.params.id);

    const user = await User.findById(req.params.id);
    console.log("🔹 Fetched user:", user);

    if (!user || user.role !== "provider") {
      console.log("⚠️ Provider not found or role is not 'provider'");
      return res.status(404).json({ message: "Provider not found" });
    }

    // Ensure providerDetails exists
    if (!user.providerDetails) {
      user.providerDetails = {};
      console.log("⚠️ providerDetails was missing, initialized a new object");
    }

    // Update fields safely
    user.providerDetails.isVerified = false;
    user.providerDetails.isAvailable = false;

    await user.save();
    console.log("✅ Provider rejected successfully:", user);

    res.json({ message: "Provider rejected successfully", user });
  } catch (error) {
    console.error("❌ Error in rejectProvider:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUsers,
  getOneUser,
  approveProvider,
  rejectProvider,
};