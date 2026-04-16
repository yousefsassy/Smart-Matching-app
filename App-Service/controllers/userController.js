const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ===== Register User =====
// ===== Register User =====
const registerUser = async (req, res) => {
  try {
    const { email, password, role, phone, providerDetails, clientDetails, name } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "email, password, and role are required" });
    }

    if (role === "admin") {
      console.log("⚠️ Admin account is being registered via API");
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    // Base user payload
    let newUserData = {
      email,
      passwordHash,
      role,
      phone: phone || "",
      name: name || "",
    };

    let resMessage = "User registered successfully";

    // ===== Client =====
    if (role === "client") {
      // schema requires clientDetails for client
      newUserData.clientDetails = {
        regionText: clientDetails?.regionText || "",
        addressText: clientDetails?.addressText || "",
      };
      resMessage = "Client registered successfully";
    }

    // ===== Provider =====
    if (role === "provider") {
      if (!providerDetails?.location || !providerDetails?.fieldOfService) {
        return res
          .status(400)
          .json({ message: "Provider must provide location and fieldOfService" });
      }

      newUserData.providerDetails = {
        location: providerDetails.location, // must include valid geo if your schema/index requires it
        fieldOfService: providerDetails.fieldOfService,
        skills: providerDetails.skills || [],
        experienceYears: providerDetails.experienceYears || 0,

        // default metrics
        trustScore: 0,
        ratingCount: 0,
        completedJobs: 0,

        // availability
        availability: providerDetails.availability || [],
        isAvailable: true,

        // admin must approve
        isVerified: false,
      };

      resMessage = "Provider registered successfully, pending admin approval";
    }

    const newUser = new User(newUserData);
    await newUser.save();

    return res.status(201).json({ message: resMessage, user: newUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};