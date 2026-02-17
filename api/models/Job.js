const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Job status: starts with accepted, then can be completed or cancelled
    status: {
      type: String,
      enum: ["accepted", "completed", "cancelled"],
      default: "accepted",
    },

    // Optional: scheduled date/time for job
    scheduledAt: { type: Date, required: true },

    // Optional: any additional info about the job
    notes: { type: String, trim: true },

    // Rating and review given by client after job completion
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
