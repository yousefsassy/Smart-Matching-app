const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    regionText: { type: String, required: true, trim: true },

    // Optional geo coordinates for distance-based matching
    geo: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  { _id: false }
);

// Optional helper: index (only needed on the parent schema, example below)
// made geo required for user since we need it in the prediction model.
// parentSchema.index({ "providerDetails.location.geo": "2dsphere" });

module.exports = locationSchema;