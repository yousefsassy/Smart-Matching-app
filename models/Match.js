const mongoose = require("mongoose");
const { Schema } = mongoose;

const matchSchema = new Schema(
  {
    serviceRequest: { type: Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
    provider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    rank: { type: Number, required: true, min: 1 },
    selected: { type: Boolean, default: false },
    notified: { type: Boolean, default: false },
    skillOverlapSnapshot: { type: Number, default: 0 },   // ADDED
    distanceKmSnapshot: { type: Number, default: null },  // ADDED
  },
  { timestamps: true }
);

// matchSchema.index({ serviceRequest: 1, provider: 1 }, { unique: true });  

// Optional: prevent duplicate matches for same provider and request
// Commented for now for testing purposes, will be enabled later  .


matchSchema.index({ serviceRequest: 1, rank: 1 });

module.exports = mongoose.model("Match", matchSchema);

// Match is the result of result returned by the ranking/AI system (top-k providers ). It links a ServiceRequest to a potential provider (User) and includes the computed score and rank.
// It is needed for model improvement .