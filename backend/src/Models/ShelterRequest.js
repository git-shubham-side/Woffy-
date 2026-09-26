const mongoose = require("mongoose");

const shelterRequestSchema = new mongoose.Schema(
  {
    orgName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    animalCount: {
      type: String,
      trim: true,
      default: "50-100",
    },
    neededFeatures: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    submitterName: {
      type: String,
      trim: true,
      default: "",
    },
    submitterEmail: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

shelterRequestSchema.index({
  orgName: "text",
  email: "text",
  city: "text",
});

const ShelterRequest = mongoose.model("ShelterRequest", shelterRequestSchema);

module.exports = ShelterRequest;
