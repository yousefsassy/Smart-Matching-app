const mongoose = require("mongoose");
const locationSchema = require("./Location");

const providerDetailsSchema = new mongoose.Schema(
  {
    location: { type: locationSchema, required: true },
    fieldOfService: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true },
    trustScore: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    completedJobs: { type: Number, default: 0, min: 0 },
    isVerified: { type: Boolean, default: false },
  },
  { _id: false }
);

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
    providerDetails: {
      type: providerDetailsSchema,
      required: function () {
        return this.role === "provider";
      },
    },
  },
  { timestamps: true }
);

userSchema.index({ "providerDetails.location.geo": "2dsphere" });

module.exports = mongoose.model("User", userSchema);

// Removed timeslot and availability fields from providerDetails



// zedna 