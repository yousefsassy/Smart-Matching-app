const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ===== Register User =====
const registerUser = async (req, res) => {
  try {
    const { email, password, role, phone, providerDetails } = req.body;

    if (role === "admin")
      return res.status(403).json({ message: "Admin accounts cannot register via API" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    let newUserData = { email, passwordHash, role, phone };

    if (role === "provider") {
      if (!providerDetails?.location || !providerDetails?.fieldOfService)
        return res.status(400).json({ message: "Provider must provide location and fieldOfService" });

      newUserData.providerDetails = {
        location: providerDetails.location,
        fieldOfService: providerDetails.fieldOfService,
        skills: providerDetails.skills || [],
        cvUrl: providerDetails.cvUrl || "",
        trustScore: 0,
        isAvailable: true,
        isVerified: false,
      };
    }

    const newUser = new User(newUserData);
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
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

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Return token in JSON, frontend stores in localStorage
    res.json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Logout User =====
// With localStorage, logout is frontend-only: delete token from localStorage
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

module.exports = { registerUser, loginUser, logoutUser, getUsers, getOneUser };
