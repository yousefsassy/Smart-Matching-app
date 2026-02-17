const mongoose = require("mongoose");

const { Schema } = mongoose;

const matchSchema = new Schema({
  serviceRequest: { type: Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
  provider: { type: Schema.Types.ObjectId, ref: "User", required: true },
  score: { type: Number, required: true }, // computed from matching AI algorithm
  selected: { type: Boolean, default: false }, // true if client chose this provider
  notified: { type: Boolean, default: false } // whether provider was notified
}, { timestamps: true });

module.exports = mongoose.model("Match", matchSchema);
