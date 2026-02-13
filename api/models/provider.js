// // models/Provider.js
// const mongoose = require("mongoose");

// const providerSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       unique: true,
//     },

//     location: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     fieldOfService: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     skills: [{ type: String, trim: true }],

//     cv: {
//       type: String, //cloudinary url 
//       trim: true,
//     },

//     experienceYears: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     trustScore: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 5,
//     },

//     completedJobs: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "ServiceRequest",
//       },
//     ],

//     isAvailable: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// providerSchema.index({ fieldOfService: 1, location: 1 });

// module.exports = mongoose.model("Provider", providerSchema);
