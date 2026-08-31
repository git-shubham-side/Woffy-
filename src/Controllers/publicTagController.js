const mongoose = require("mongoose");
const Pet = require("../Models/Pet");
const User = require("../Models/User");

/**
 * GET: Public Emergency Pet Tag View (No Authentication Required)
 * Route: /pet/tag/:id or /pet/scan/:collarId
 */
const getPublicPetTag = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === "") {
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
      return res.status(404).render("Pet-Tag/tag-not-found", {
        tagId: id,
      });
    }

    // Prepare safe emergency contact payload (Sensitive credentials excluded)
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

    res.render("Pet-Tag/public-pet-tag", {
      tag: emergencyInfo,
    });
  } catch (error) {
    console.error("Public pet tag scan error:", error);
    res.status(500).render("Pet-Tag/tag-not-found", {
      tagId: req.params.id || "",
    });
  }
};

module.exports = {
  getPublicPetTag,
};
