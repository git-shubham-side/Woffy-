const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  petName: {
    type: String,
    required: true,
    trim: true,
  },
  ownerName: {
    type: String,
    trim: true,
    default: "",
  },
  species: {
    type: String,
    enum: ["Dog", "Cat", "Other"],
    default: "Dog",
  },
  breed: {
    type: String,
    trim: true,
    default: "Unknown",
  },
  dob: {
    type: Date,
    default: null,
  },
  age: {
    type: Number,
    default: 0,
  },
  weight: {
    type: Number,
    default: 0,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    default: "Male",
  },
  vaccinated: {
    type: String,
    enum: ["Yes", "No"],
    default: "Yes",
  },
  photo: {
    type: String,
    default: "",
  },
  photoUrl: {
    type: String,
    default: "",
  },
  gallery: {
    type: [String],
    default: [],
  },
  notes: {
    type: String,
    default: "",
  },

  /* ==========================================================================
     SMART QR COLLAR TAG & EMERGENCY "LOST & FOUND" LIFESAVER FIELDS
     ========================================================================== */
  collarId: {
    type: String,
    trim: true,
    default: null,
    index: true,
  },
  emergencyPhone: {
    type: String,
    trim: true,
    default: "",
  },
  secondaryPhone: {
    type: String,
    trim: true,
    default: "",
  },
  allergies: {
    type: String,
    trim: true,
    default: "",
  },
  medicalAlerts: {
    type: String,
    trim: true,
    default: "",
  },
  homeCity: {
    type: String,
    trim: true,
    default: "",
  },
  isLost: {
    type: Boolean,
    default: false,
  },
  lostMessage: {
    type: String,
    trim: true,
    default: "",
  },
  rewardAmount: {
    type: String,
    trim: true,
    default: "",
  },
  qrCodeDataUrl: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Pet = mongoose.model("Pet", petSchema);

module.exports = Pet;
