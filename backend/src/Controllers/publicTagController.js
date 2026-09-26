const mongoose = require("mongoose");
const Pet = require("../Models/Pet");
const User = require("../Models/User");

const isApiRequest = (req) => {
  return (
    req.xhr ||
    (req.headers.accept && req.headers.accept.includes("application/json")) ||
    (req.headers["content-type"] && req.headers["content-type"].includes("application/json")) ||
    Boolean(req.headers.authorization) ||
    req.originalUrl.includes("/api/")
  );
};

/**
 * GET: Public Emergency Pet Tag View (No Authentication Required)
 * Route: /pet/tag/:id or /pet/scan/:collarId or /api/pet/tag/:id
 */
const getPublicPetTag = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === "") {
      if (isApiRequest(req)) {
        return res.status(404).json({ success: false, message: "Tag ID is required." });
      }
      return res.status(404).render("Pet-Tag/tag-not-found", {
        tagId: id || "Unknown",
      });
    }

    let query = { collarId: id.trim() };

    if (mongoose.Types.ObjectId.isValid(id)) {
      query = {
        $or: [{ collarId: id.trim() }, { _id: id }],
      };
    }

    const pet = await Pet.findOne(query).populate("user", "fullName email");

    if (!pet) {
      if (isApiRequest(req)) {
        return res.status(404).json({ success: false, message: "Emergency pet tag not found." });
      }
      return res.status(404).render("Pet-Tag/tag-not-found", {
        tagId: id,
      });
    }

    const emergencyInfo = {
      petId: pet._id,
      collarId: pet.collarId || "WF-PET",
      petName: pet.petName,
      species: pet.species || "Dog",
      breed: pet.breed || "Pet",
      gender: pet.gender || "Male",
      age: pet.age || 0,
      weight: pet.weight || 0,
      photo: pet.photo || pet.photoUrl || "/uploads/pets/default-pet.png",
      ownerName: pet.ownerName || (pet.user ? pet.user.fullName : "Pet Parent"),
      emergencyPhone: pet.emergencyPhone || "",
      secondaryPhone: pet.secondaryPhone || "",
      allergies: pet.allergies || "",
      medicalAlerts: pet.medicalAlerts || "",
      homeCity: pet.homeCity || "",
      isLost: pet.isLost || false,
      lostMessage: pet.lostMessage || "",
      rewardAmount: pet.rewardAmount || "",
      vaccinated: pet.vaccinated || "Yes",
      notes: pet.notes || "",
    };

    if (isApiRequest(req)) {
      return res.status(200).json({ success: true, tag: emergencyInfo });
    }

    res.render("Pet-Tag/public-pet-tag", {
      tag: emergencyInfo,
    });
  } catch (error) {
    console.error("Public pet tag scan error:", error);
    if (isApiRequest(req)) {
      return res.status(500).json({ success: false, message: "Error retrieving emergency tag." });
    }
    res.status(500).render("Pet-Tag/tag-not-found", {
      tagId: req.params.id || "",
    });
  }
};

module.exports = {
  getPublicPetTag,
};
