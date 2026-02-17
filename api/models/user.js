const mongoose = require("mongoose");

// ===== Location schema =====
const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
  addressText: { type: String, trim: true }, // optional textual address
});

// ===== User schema =====
const userSchema = new mongoose.Schema(
  {
    // ===== Auth / Identity =====
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,})$/,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["client", "provider", "admin"],
      required: true,
    },
    phone: { type: String, trim: true },
    photoUrl: { type: String, default: "" }, // Cloudinary URL

    // ===== Role-specific details =====
    clientDetails: {
      // Optional: client can enter one location or use current location
      location: locationSchema,
    },

    providerDetails: {
      location: { type: locationSchema, required: true }, // mandatory for provider
      fieldOfService: { type: String, trim: true },
      skills: [{ type: String, trim: true }], // tags in frontend
      cvUrl: { type: String, trim: true }, // Cloudinary URL
      trustScore: { type: Number, default: 0, min: 0, max: 5 },
      isAvailable: { type: Boolean, default: true },
      isVerified: { type: Boolean, default: false }, // only for providers
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
