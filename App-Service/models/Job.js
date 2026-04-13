const mongoose = require("mongoose");

const timeWindowSchema = new mongoose.Schema(
  {
    start: { type: String, required: true, trim: true },
    end: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    notes: { type: String, trim: true, default: "" },
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, trim: true, default: "" },
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

// Job is created when a provider accepts a match for a service request.
// ADDED: when a job is rated and completed, update provider trustScore + completedJobs
// Removed provider and client references since we can get them from the Match .