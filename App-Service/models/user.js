const mongoose = require("mongoose");
const locationSchema = require("./Location");

// ===== Time window schema (from-to) =====
const timeWindowSchema = new mongoose.Schema(
  {
    start: { type: String, required: true, trim: true }, // "09:00"
    end: { type: String, required: true, trim: true },   // "11:00"
  },
  { _id: false }
);

// ===== Provider availability per date (calendar) =====
const providerAvailabilitySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true }, // specific date selected in calendar
    slot1: { type: timeWindowSchema, required: true },
    slot2: { type: timeWindowSchema, required: true },
  },
  { _id: false }
);

// ===== Client details =====
const clientDetailsSchema = new mongoose.Schema(
  {
    location: { type: locationSchema, required: false }, // optional
  },
  { _id: false }
);

// ===== Provider details =====
const providerDetailsSchema = new mongoose.Schema(
  {
    location: { type: locationSchema, required: true },
    fieldOfService: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0, min: 0 },

    // Calendar-based availability (per date, exactly 2 slots)
    availability: { type: [providerAvailabilitySchema], default: [] },

    // Optional quick toggle for “currently available”
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

// Geo index for provider location (works when providerDetails.location.geo exists)
userSchema.index({ "providerDetails.location.geo": "2dsphere" });

module.exports = mongoose.model("User", userSchema);