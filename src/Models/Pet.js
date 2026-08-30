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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Pet = mongoose.model("Pet", petSchema);

module.exports = Pet;
