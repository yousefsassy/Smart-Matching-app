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
      location: locationSchema, // optional
    },

    providerDetails: {
      type: new mongoose.Schema({
        location: {
          type: locationSchema,
          required: function () {
            return this.parent().role === "provider"; // only required for providers
          },
        },
        fieldOfService: { type: String, trim: true },
        skills: [{ type: String, trim: true }],
        cvUrl: { type: String, trim: true },
        trustScore: { type: Number, default: 0, min: 0, max: 5 },
        isAvailable: { type: Boolean, default: true },
        isVerified: { type: Boolean, default: false },
      }),
      required: function () {
        return this.role === "provider"; // providerDetails object required only for providers
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
