// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     passwordHash: { type: String, required: true },

//     role: { type: String, enum: ["client", "provider", "admin"], required: true },

//     phone: { type: String, required: true, trim: true },
//     photoUrl: { type: String, default: "" }, // store cloudinary URL

//     isVerified: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ===== Auth / identity =====
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,})$/,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["client", "provider", "admin"],
      required: true,
    },

    phone: { type: String, required: true, trim: true },
    photoUrl: { type: String, default: "" }, // cloundinary url

    isVerified: { type: Boolean, default: false },

    // ===== Role-specific details =====
    clientDetails: {
      location: { type: String, trim: true },
    },

    providerDetails: {
      location: { type: String, trim: true },   // may be coordinates later 
      fieldOfService: { type: String, trim: true },
      skills: [{ type: String, trim: true }],
      cv: { type: String, trim: true }, // cloudinary URL
      experienceYears: { type: Number, default: 0, min: 0 },
      trustScore: { type: Number, default: 0, min: 0, max: 5 },
      completedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest" }],
      isAvailable: { type: Boolean, default: true },
    },

    adminDetails: {
      permissions: [
        {
          type: String,
          enum: [
            "MANAGE_USERS",
            "MANAGE_PROVIDERS",
            "VIEW_LOGS",
            "VIEW_ANALYTICS",
            "MANAGE_SETTINGS",
          ],
        },
      ],
      lastLoginAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// ===== Role validations (to enforce required fields depending on role) ===== 

userSchema.pre("validate", function (next) {
  if (this.role === "client") {
    if (!this.clientDetails?.location) {
      return next(new Error("clientDetails.location is required for client role"));
    }
  }

  if (this.role === "provider") {
    if (!this.providerDetails?.location) {
      return next(new Error("providerDetails.location is required for provider role"));
    }
    // if (!this.providerDetails?.fieldOfService) {
    //   return next(new Error("providerDetails.fieldOfService is required for provider role"));
    // }
  }

  // admin can be created with empty permissions.
  next();
});

// ===== Index to replace Provider index({ fieldOfService, location }) ===== : useful later 

userSchema.index(
  { "providerDetails.fieldOfService": 1, "providerDetails.location": 1 },
  { partialFilterExpression: { role: "provider" } }  
);

module.exports = mongoose.model("User", userSchema);
