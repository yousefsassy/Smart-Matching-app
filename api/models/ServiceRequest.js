const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    serviceType: { type: String, required: true }, // plumbing, cleaning, etc.
    location: { type: String, trim: true }, // optional: can be added at request time
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g., "09:00-11:00"
    budget: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "assigned", "completed", "cancelled"],
      default: "pending",
    },

    topMatchedProviders: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" } // stores top N matches from AI/ranking
    ],

    chosenProvider: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // assigned provider
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
