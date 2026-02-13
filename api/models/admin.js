// const mongoose = require("mongoose");

// const adminSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       unique: true,
//     },

//     permissions: [
//       {
//         type: String,
//         enum: [
//           "MANAGE_USERS",
//           "MANAGE_PROVIDERS",
//           "VIEW_LOGS",
//           "VIEW_ANALYTICS",
//           "MANAGE_SETTINGS",
//         ],
//       },
//     ],

//     lastLoginAt: {
//       type: Date,
//       default: null,
//     },

//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Admin", adminSchema);
