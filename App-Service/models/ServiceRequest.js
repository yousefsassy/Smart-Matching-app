const mongoose = require("mongoose");
const locationSchema = require("./Location");

const timeWindowSchema = new mongoose.Schema(
  {
    start: { type: String, required: true, trim: true },
    end: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const budgetSchema = new mongoose.Schema(
  {
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const serviceRequestSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    serviceType: { type: String, required: true, trim: true },
    location: { type: locationSchema, required: true },
    description: { type: String, trim: true, default: "" },
    date: { type: Date, required: true },
    timeWindow: { type: timeWindowSchema, required: true },
    budget: { type: budgetSchema, required: true },
    status: {
      type: String,
      enum: ["pending", "matched", "assigned", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);

// removed chosenProvider field since we can determine it from Job once a match is accepted.