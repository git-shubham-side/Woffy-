const mongoose = require("mongoose");

const rescueServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    orgType: {
      type: String,
      enum: [
        "NGO",
        "Animal Ambulance",
        "Shelter",
        "Stray Rescue",
        "Government Helpline",
        "Wildlife Rescue",
        "Adoption Center",
        "Animal Hospital & Sanctuary",
        "Trust",
      ],
      default: "NGO",
    },
    contactPerson: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
      default: "Maharashtra",
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    emergencyHelpline: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
    },
    googleMapsUrl: {
      type: String,
      trim: true,
      default: "",
    },
    services: {
      type: [String],
      default: ["24/7 Stray Rescue", "Animal Ambulance", "Medical Care"],
    },
    is24x7: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    photo: {
      type: String,
      default: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

rescueServiceSchema.index({
  name: "text",
  city: "text",
  services: "text",
  orgType: "text",
});

const RescueService = mongoose.model("RescueService", rescueServiceSchema);

module.exports = RescueService;
