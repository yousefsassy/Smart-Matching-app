// models/Job.js
const mongoose = require("mongoose");

const timeWindowSchema = new mongoose.Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
    },

    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      unique: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: { type: Date, required: true },

    timeWindow: {
      type: timeWindowSchema,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },

    notes: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: "" },
  },
  { timestamps: true }
);



jobSchema.post("save", async function (doc) {
  if (doc.status === "completed") {
    const Match = mongoose.model("Match");
    const User = mongoose.model("User");

    const match = await Match.findById(doc.match);      // step 1: get the match
    if (!match) return;

    const provider = await User.findById(match.provider); // step 2: get provider from match
    if (!provider || !provider.providerDetails) return;

    const pd = provider.providerDetails;
    pd.completedJobs += 1;

    if (doc.rating != null) {
      const newCount = pd.ratingCount + 1;
      pd.trustScore = parseFloat(
        ((pd.trustScore * pd.ratingCount + doc.rating) / newCount).toFixed(2) // compute new running average.
      );
      pd.ratingCount = newCount;
    }

    await provider.save();
  }
});


module.exports = mongoose.model("Job", jobSchema);
