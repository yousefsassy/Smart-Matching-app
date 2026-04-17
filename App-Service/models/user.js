const mongoose = require("mongoose");
const locationSchema = require("./Location");

// ===== Time window schema (from-to) =====
const timeWindowSchema = new mongoose.Schema(
  {
    start: { type: String, required: true, trim: true },
    end: { type: String, required: true, trim: true },
  },
  { _id: false }
);

// ===== Provider availability per date (calendar) =====
const providerAvailabilitySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    slot1: { type: timeWindowSchema, required: true },
    slot2: { type: timeWindowSchema, required: true },
  },
  { _id: false }
);

// ✅ Client details: text only (no geo)
const clientDetailsSchema = new mongoose.Schema(
  {
    regionText: { type: String, trim: true, default: "" },   // optional
  },
  { _id: false }
);

// ===== Provider details =====
const providerDetailsSchema = new mongoose.Schema(
  {
    location: { type: locationSchema, required: true }, // includes geo
    fieldOfService: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0, min: 0 },

    availability: { type: [providerAvailabilitySchema], default: [] },

    // Optional quick toggle
    isAvailable: { type: Boolean, default: true },

    trustScore: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    completedJobs: { type: Number, default: 0, min: 0 },

    isVerified: { type: Boolean, default: false },
  },
  { _id: false }
);

// ===== User schema =====
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,})$/,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["client", "provider", "admin"], required: true },

    name: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    photoUrl: { type: String, default: "" },
    expoPushToken: { type: String, default: null }, // Simple and accessible

    clientDetails: {
      type: clientDetailsSchema,
      required: function () {
        return this.role === "client";
      },
    },

    providerDetails: {
      type: providerDetailsSchema,
      required: function () {
        return this.role === "provider";
      },
    },
  },
  { timestamps: true }
);

// Geo index (providers only)
userSchema.index({ "providerDetails.location.geo": "2dsphere" });

module.exports = mongoose.model("User", userSchema);