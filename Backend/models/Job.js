// models/Job.js
const mongoose = require("mongoose");

const timeWindowSchema = new mongoose.Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const availabilitySnapshotSchema = new mongoose.Schema(
  {
    date: { type: Date },
    slot1: { type: timeWindowSchema, default: null },
    slot2: { type: timeWindowSchema, default: null },
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
    availabilitySnapshot: { type: availabilitySnapshotSchema, default: null },
  },
  { timestamps: true }
);

jobSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      this.$locals.completedTransition = false;
      this.$locals.ratingAdded = false;
      return next();
    }

    const previous = await this.constructor.findById(this._id).select("status rating");

    this.$locals.completedTransition =
      previous?.status !== "completed" && this.status === "completed";
    this.$locals.ratingAdded = previous?.rating == null && this.rating != null;

    return next();
  } catch (error) {
    return next(error);
  }
});

jobSchema.post("save", async function (doc) {
  if (!doc.$locals.completedTransition && !doc.$locals.ratingAdded) return;

  try {
    const User = mongoose.model("User");
    const provider = await User.findById(doc.provider);
    if (!provider || !provider.providerDetails) return;

    const pd = provider.providerDetails;

    if (doc.$locals.completedTransition) {
      pd.completedJobs += 1;
    }

    if (doc.$locals.ratingAdded) {
      const newCount = pd.ratingCount + 1;
      pd.trustScore = parseFloat(
        ((pd.trustScore * pd.ratingCount + doc.rating) / newCount).toFixed(2)
      );
      pd.ratingCount = newCount;
    }

    await provider.save();
  } catch (error) {
    console.error("Job provider stats update failed:", error.message);
  }
});


module.exports = mongoose.model("Job", jobSchema);
