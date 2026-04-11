const User = require("../models/user");
require("dotenv").config();
const { sendProviderApprovedEmail } = require("../utils/mailer");
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
   

    await user.save();
    console.log("✅ Provider rejected successfully:", user);

    res.json({ message: "Provider rejected successfully", user });
  } catch (error) {
    console.error("❌ Error in rejectProvider:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
module.exports = {
  getUsers,
  getOneUser,
  approveProvider,
  rejectProvider,
};