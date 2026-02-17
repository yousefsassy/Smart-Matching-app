const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ===== Auth / identity =====
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,})$/,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["client", "provider", "admin"],
      required: true,
    },

    phone: { type: String, trim: true },
    photoUrl: { type: String, default: "" }, // cloudinary URL
    isVerified: { type: Boolean, default: false },

    // ===== Role-specific details =====
    clientDetails: {
      location: { type: String, trim: true }, // optional at first
    },

    providerDetails: {
      location: { type: String, trim: true },   // optional at first
      fieldOfService: { type: String, trim: true },
      skills: [{ type: String, trim: true }],
      cv: { type: String, trim: true }, // cloudinary URL
      experienceYears: { type: Number, default: 0, min: 0 },
      trustScore: { type: Number, default: 0, min: 0, max: 5 },
      completedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest" }],
      isAvailable: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// ===== Index for searching providers efficiently =====
userSchema.index(
  { "providerDetails.fieldOfService": 1, "providerDetails.location": 1 },
  { partialFilterExpression: { role: "provider" } }
);

module.exports = mongoose.model("User", userSchema);
