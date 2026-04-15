const mongoose = require("mongoose");
const { Schema } = mongoose;

const matchSchema = new Schema(
  {
    serviceRequest: { type: Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
    provider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    rank: { type: Number, required: true, min: 1 },
    
    // Status management
    status: { 
      type: String, 
      enum: ["pending", "selected", "rejected", "expired"], 
      default: "pending" 
    },
    selected: { type: Boolean, default: false }, // Kept as requested
    
    // Metadata for Admin/AI
    reasoning: { type: String, trim: true }, // ADDED: LLM justification
    
    // Timing logic for "Expired" status
    notified: { type: Boolean, default: false },
    notifiedAt: { type: Date }, // ADDED: timestamp to calculate if the time window has passed

    // Snapshots for model improvement
    skillOverlapSnapshot: { type: Number, default: 0 },
    distanceKmSnapshot: { type: Number, default: null },
  },
  { timestamps: true }
);

matchSchema.index({ serviceRequest: 1, provider: 1 }, { unique: true });
matchSchema.index({ serviceRequest: 1, rank: 1 });

module.exports = mongoose.model("Match", matchSchema);

// Match is the result of result returned by the ranking/AI system (top-k providers ). It links a ServiceRequest to a potential provider (User) and includes the computed score and rank.
// It is needed for model improvement .