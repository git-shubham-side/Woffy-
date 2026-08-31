const User = require("../Models/User");
const Pet = require("../Models/Pet");
const Record = require("../Models/Record");
const Product = require("../Models/Product");
const Vaccination = require("../Models/Vaccination");
const {
  generateScheduleForPet,
  getUpcomingVaccinesForUser,
  syncVaccinationStatuses,
} = require("../Utils/vaccineScheduleGenerator");
const { syncPetQrCode } = require("../Utils/qrTagGenerator");

/**
 * GET: User Dashboard
 */
const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const pets = await Pet.find({ user: req.session.userId }).sort({
      createdAt: -1,
    });
    const products = await Product.find({ inStock: true, status: { $ne: "pending" } })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(6);
    const userProductRequests = await Product.find({
      submittedBy: req.session.userId,
    }).sort({ createdAt: -1 });

    // Fetch upcoming & overdue vaccines for all pets of user
    const vaccineAlerts = await getUpcomingVaccinesForUser(req.session.userId, 30);

    res.render("Dashboard/dashboard", {
      userName: user ? user.fullName : "Pet Parent",
      currentUser: user,
      pets: pets || [],
      products: products || [],
      userProductRequests: userProductRequests || [],
      vaccineAlerts: vaccineAlerts || { dueSoon: [], overdue: [], totalDueCount: 0 },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.render("Dashboard/dashboard", {
      userName: "Pet Parent",
      currentUser: null,
      pets: [],
      products: [],
      userProductRequests: [],
      vaccineAlerts: { dueSoon: [], overdue: [], totalDueCount: 0 },
    });
  }
};

/**
 * GET: Render Create Pet Profile Form
 */
const getCreatePetPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render("Profile-Creation/create-profile", {
      ownerName: user ? user.fullName : "",
    });
  } catch (err) {
    console.error("Error rendering create pet page:", err);
    res.redirect("/api/dashboard");
  }
};

/**
 * POST: Create New Pet Profile
 */
const postCreatePet = async (req, res) => {
  try {
    const {
      petName,
      ownerName,
      species,
      breed,
      dob,
      age,
      weight,
      gender,
      vaccinated,
      photoUrl,
      notes,
      emergencyPhone,
      secondaryPhone,
      allergies,
      medicalAlerts,
      homeCity,
    } = req.body;

    if (!petName || !petName.trim()) {
      req.flash("error", "Pet name is required.");
      return res.redirect("/api/create-pet-profile");
    }

    // Process DOB or Age
    let petDob = null;
    let parsedAge = parseFloat(age);

    if (dob && dob.trim() !== "") {
      petDob = new Date(dob);
      if (!isNaN(petDob.getTime())) {
        const diffMs = Date.now() - petDob.getTime();
        const calculatedAgeYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
        parsedAge = Math.max(0, parseFloat(calculatedAgeYears.toFixed(1)));
      }
    } else if (!isNaN(parsedAge) && parsedAge >= 0) {
      const approxPastDate = new Date();
      approxPastDate.setMonth(
        approxPastDate.getMonth() - Math.round(parsedAge * 12),
      );
      petDob = approxPastDate;
    }

    // Process Main Profile Photo
    let mainPhoto = "";
    if (req.files && req.files.photo && req.files.photo[0]) {
      const file = req.files.photo[0];
      mainPhoto =
        file.path && file.path.startsWith("http")
          ? file.path
          : "/uploads/pets/" + file.filename;
    }

    // Process Multi-Photo Gallery
    let galleryPhotos = [];
    if (req.files && req.files.gallery && req.files.gallery.length > 0) {
      galleryPhotos = req.files.gallery.map((file) =>
        file.path && file.path.startsWith("http")
          ? file.path
          : "/uploads/gallery/" + file.filename,
      );
    }

    const newPet = await Pet.create({
      user: req.session.userId,
      petName: petName.trim(),
      ownerName: ownerName ? ownerName.trim() : "",
      species: species || "Dog",
      breed: breed ? breed.trim() : "Unknown",
      dob: petDob,
      age: isNaN(parsedAge) ? 0 : parsedAge,
      weight: weight ? parseFloat(weight) : 0,
      gender: gender || "Male",
      vaccinated: vaccinated || "Yes",
      photo: mainPhoto,
      photoUrl: photoUrl ? photoUrl.trim() : "",
      gallery: galleryPhotos,
      notes: notes ? notes.trim() : "",
      emergencyPhone: emergencyPhone ? emergencyPhone.trim() : "",
      secondaryPhone: secondaryPhone ? secondaryPhone.trim() : "",
      allergies: allergies ? allergies.trim() : "",
      medicalAlerts: medicalAlerts ? medicalAlerts.trim() : "",
      homeCity: homeCity ? homeCity.trim() : "",
    });

    // Generate Smart QR Collar Tag
    await syncPetQrCode(newPet);

    req.flash(
      "success",
      `Pet profile for "${newPet.petName}" created with Smart QR Collar Tag!`,
    );
    res.redirect(`/api/pet-profile/${newPet._id}`);
  } catch (err) {
    console.error("Pet creation error:", err);
    req.flash(
      "error",
      "Failed to create pet profile. " + (err.message || ""),
    );
    res.redirect("/api/create-pet-profile");
  }
};

/**
 * GET: View All Registered Pets
 */
const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find({ user: req.session.userId }).sort({
      createdAt: -1,
    });

    // Ensure all pets have a QR code
    for (const p of pets) {
      if (!p.qrCodeDataUrl) {
        await syncPetQrCode(p);
      }
    }

    res.render("My-Pets/my-pets", { pets: pets || [] });
  } catch (err) {
    console.error("Fetch pets error:", err);
    req.flash("error", "Error loading your pets.");
    res.render("My-Pets/my-pets", { pets: [] });
  }
};

/**
 * GET: View Single Pet Profile with Smart QR Tag & Health Summary
 */
const getPetProfile = async (req, res) => {
  try {
    const petId = req.params.petId || req.query.id;
    let pet = null;

    if (petId && petId !== "petId") {
      pet = await Pet.findOne({ _id: petId, user: req.session.userId });
    } else {
      pet = await Pet.findOne({ user: req.session.userId }).sort({
        createdAt: -1,
      });
    }

    if (!pet) {
      req.flash("error", "Pet profile not found.");
      return res.redirect("/api/pet-profiles");
    }

    // Ensure Smart QR Code exists
    await syncPetQrCode(pet);

    // Refresh & fetch vaccination summary for this pet
    await syncVaccinationStatuses(pet._id);
    const vaccinations = await Vaccination.find({ pet: pet._id }).sort({ dueDate: 1 });
    const totalDoses = vaccinations.length;
    const completedDoses = vaccinations.filter((v) => v.status === "Completed").length;
    const nextDueVaccine = vaccinations.find((v) => v.status !== "Completed" && v.status !== "Skipped");

    const appBaseUrl = process.env.BASE_URL || "http://localhost:3000";
    const publicTagUrl = `${appBaseUrl}/pet/tag/${pet.collarId || pet._id}`;

    res.render("Pet-Profile/profile", {
      pet,
      publicTagUrl,
      vaccineSummary: {
        totalDoses,
        completedDoses,
        percent: totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 0,
        nextDue: nextDueVaccine || null,
      },
    });
  } catch (err) {
    console.error("Fetch pet profile error:", err);
    req.flash("error", "Error loading pet profile.");
    res.redirect("/api/dashboard");
  }
};

/**
 * GET: Render Edit Pet Page
 */
const getEditPetPage = async (req, res) => {
  try {
    const { petId } = req.params;
    const pet = await Pet.findOne({ _id: petId, user: req.session.userId });

    if (!pet) {
      req.flash("error", "Pet not found.");
      return res.redirect("/api/pet-profiles");
    }

    res.render("Edit-Pet/edit-pet", { pet });
  } catch (err) {
    console.error("Edit pet page error:", err);
    res.redirect("/api/pet-profiles");
  }
};

/**
 * POST: Handle Pet Profile Update
 */
const postEditPet = async (req, res) => {
  try {
    const { petId } = req.params;
    const {
      petName,
      ownerName,
      species,
      breed,
      dob,
      age,
      weight,
      gender,
      vaccinated,
      photoUrl,
      notes,
      emergencyPhone,
      secondaryPhone,
      allergies,
      medicalAlerts,
      homeCity,
      rewardAmount,
    } = req.body;

    const pet = await Pet.findOne({ _id: petId, user: req.session.userId });
    if (!pet) {
      req.flash("error", "Pet not found.");
      return res.redirect("/api/pet-profiles");
    }

    if (petName) pet.petName = petName.trim();
    if (ownerName !== undefined) pet.ownerName = ownerName.trim();
    if (species) pet.species = species;
    if (breed !== undefined) pet.breed = breed.trim();

    if (dob && dob.trim() !== "") {
      const parsedDob = new Date(dob);
      if (!isNaN(parsedDob.getTime())) {
        pet.dob = parsedDob;
        const diffMs = Date.now() - parsedDob.getTime();
        const calculatedAgeYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
        pet.age = Math.max(0, parseFloat(calculatedAgeYears.toFixed(1)));
      }
    } else if (age !== undefined) {
      pet.age = parseFloat(age) || 0;
    }

    if (weight !== undefined) pet.weight = parseFloat(weight) || 0;
    if (gender) pet.gender = gender;
    if (vaccinated) pet.vaccinated = vaccinated;
    if (photoUrl !== undefined) pet.photoUrl = photoUrl.trim();
    if (notes !== undefined) pet.notes = notes.trim();

    if (emergencyPhone !== undefined) pet.emergencyPhone = emergencyPhone.trim();
    if (secondaryPhone !== undefined) pet.secondaryPhone = secondaryPhone.trim();
    if (allergies !== undefined) pet.allergies = allergies.trim();
    if (medicalAlerts !== undefined) pet.medicalAlerts = medicalAlerts.trim();
    if (homeCity !== undefined) pet.homeCity = homeCity.trim();
    if (rewardAmount !== undefined) pet.rewardAmount = rewardAmount.trim();

    // Update main photo if uploaded
    if (req.files && req.files.photo && req.files.photo[0]) {
      const file = req.files.photo[0];
      pet.photo =
        file.path && file.path.startsWith("http")
          ? file.path
          : "/uploads/pets/" + file.filename;
    }

    // Append new gallery photos if uploaded
    if (req.files && req.files.gallery && req.files.gallery.length > 0) {
      const newGallery = req.files.gallery.map((file) =>
        file.path && file.path.startsWith("http")
          ? file.path
          : "/uploads/gallery/" + file.filename,
      );
      pet.gallery = (pet.gallery || []).concat(newGallery);
    }

    // Ensure QR Code is updated
    await syncPetQrCode(pet);
    await pet.save();

    req.flash("success", `Pet profile for "${pet.petName}" updated successfully!`);
    res.redirect(`/api/pet-profile/${pet._id}`);
  } catch (err) {
    console.error("Pet update error:", err);
    req.flash("error", "Failed to update pet profile.");
    res.redirect(`/api/pet-profile/edit/${req.params.petId}`);
  }
};

/**
 * POST: Toggle Lost Pet Alert Status (Emergency Lost & Found Switch)
 */
const postToggleLostStatus = async (req, res) => {
  try {
    const { petId } = req.params;
    const { rewardAmount, lostMessage } = req.body;
    const pet = await Pet.findOne({ _id: petId, user: req.session.userId });

    if (!pet) {
      req.flash("error", "Pet profile not found.");
      return res.redirect("/api/pet-profiles");
    }

    pet.isLost = !pet.isLost;
    if (rewardAmount !== undefined) pet.rewardAmount = rewardAmount.trim();
    if (lostMessage !== undefined) pet.lostMessage = lostMessage.trim();

    await pet.save();

    req.flash(
      "success",
      pet.isLost
        ? `🚨 Emergency LOST PET alert activated for "${pet.petName}". The public QR tag now displays high-visibility emergency rescue instructions.`
        : `🎉 Glad to hear! "${pet.petName}" is marked as safe & found.`,
    );
    res.redirect(`/api/pet-profile/${pet._id}`);
  } catch (err) {
    console.error("Toggle lost status error:", err);
    req.flash("error", "Failed to update lost status.");
    res.redirect(`/api/pet-profile/${req.params.petId}`);
  }
};

/**
 * POST: Update Emergency Tag Info (Quick Modal)
 */
const postUpdateEmergencyInfo = async (req, res) => {
  try {
    const { petId } = req.params;
    const {
      emergencyPhone,
      secondaryPhone,
      allergies,
      medicalAlerts,
      homeCity,
      rewardAmount,
      lostMessage,
    } = req.body;

    const pet = await Pet.findOne({ _id: petId, user: req.session.userId });
    if (!pet) {
      req.flash("error", "Pet profile not found.");
      return res.redirect("/api/pet-profiles");
    }

    if (emergencyPhone !== undefined) pet.emergencyPhone = emergencyPhone.trim();
    if (secondaryPhone !== undefined) pet.secondaryPhone = secondaryPhone.trim();
    if (allergies !== undefined) pet.allergies = allergies.trim();
    if (medicalAlerts !== undefined) pet.medicalAlerts = medicalAlerts.trim();
    if (homeCity !== undefined) pet.homeCity = homeCity.trim();
    if (rewardAmount !== undefined) pet.rewardAmount = rewardAmount.trim();
    if (lostMessage !== undefined) pet.lostMessage = lostMessage.trim();

    await pet.save();
    req.flash(
      "success",
      `Emergency contact & rescue tag details updated for "${pet.petName}".`,
    );
    res.redirect(`/api/pet-profile/${pet._id}`);
  } catch (err) {
    console.error("Update emergency info error:", err);
    req.flash("error", "Failed to update tag info.");
    res.redirect(`/api/pet-profile/${req.params.petId}`);
  }
};

/**
 * GET: Render Printable Smart Collar Tag & Wallet ID Card
 */
const getPrintableTag = async (req, res) => {
  try {
    const { petId } = req.params;
    const user = await User.findById(req.session.userId);
    const pet = await Pet.findOne({ _id: petId, user: req.session.userId });

    if (!pet) {
      req.flash("error", "Pet profile not found.");
      return res.redirect("/api/pet-profiles");
    }

    await syncPetQrCode(pet);
    const appBaseUrl = process.env.BASE_URL || "http://localhost:3000";
    const publicUrl = `${appBaseUrl}/pet/tag/${pet.collarId || pet._id}`;

    res.render("Pet-Tag/printable-tag", {
      pet,
      user,
      publicUrl,
    });
  } catch (err) {
    console.error("Print tag error:", err);
    req.flash("error", "Failed to generate printable collar tag.");
    res.redirect(`/api/pet-profile/${req.params.petId}`);
  }
};

/**
 * POST: Delete Pet Profile & Cascading Records
 */
const deletePet = async (req, res) => {
  try {
    const { petId } = req.params;
    const deletedPet = await Pet.findOneAndDelete({
      _id: petId,
      user: req.session.userId,
    });

    if (!deletedPet) {
      req.flash("error", "Pet profile not found or already removed.");
      return res.redirect("/api/pet-profiles");
    }

    // Cascade delete health records & vaccination records
    await Record.deleteMany({ pet: petId, user: req.session.userId });
    await Vaccination.deleteMany({ pet: petId, user: req.session.userId });

    req.flash(
      "success",
      `Pet profile "${deletedPet.petName}" and all associated records deleted successfully.`,
    );
    res.redirect("/api/pet-profiles");
  } catch (err) {
    console.error("Delete pet error:", err);
    req.flash("error", "Failed to delete pet profile.");
    res.redirect("/api/pet-profiles");
  }
};

/**
 * POST: Handle Community Product Request Submission
 */
const postRequestProduct = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const { name, category, price, description, link, submitterPhone } =
      req.body;

    if (!name || !price || !description) {
      req.flash("error", "Please fill in all required product details.");
      return res.redirect("/api/dashboard");
    }

    let productImage = "";
    if (req.file) {
      productImage =
        req.file.path && req.file.path.startsWith("http")
          ? req.file.path
          : "/uploads/products/" + req.file.filename;
    }

    const productRequest = await Product.create({
      name: name.trim(),
      category: category || "Other",
      price: parseFloat(price) || 0,
      description: description.trim(),
      image: productImage,
      link: link ? link.trim() : "",
      inStock: false,
      status: "pending",
      submittedBy: req.session.userId,
      submitterName: user ? user.fullName : "Pet Parent",
      submitterEmail: user ? user.email : "",
      submitterPhone: submitterPhone ? submitterPhone.trim() : "",
    });

    req.flash(
      "success",
      `Product request for "${productRequest.name}" submitted successfully! It will go live once reviewed and approved by our team.`,
    );
    res.redirect("/api/dashboard");
  } catch (err) {
    console.error("Product request error:", err);
    req.flash(
      "error",
      "Failed to submit product request: " + (err.message || "Unknown error"),
    );
    res.redirect("/api/dashboard");
  }
};

/**
 * GET: Render Dedicated Product Listing Request Page
 */
const getListingRequestPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render("Shop/list-product", {
      currentUser: user,
      userName: user ? user.fullName : "Pet Parent",
    });
  } catch (err) {
    console.error("Listing request page load error:", err);
    res.redirect("/api/dashboard");
  }
};

module.exports = {
  getDashboard,
  getCreatePetPage,
  postCreatePet,
  getAllPets,
  getPetProfile,
  getEditPetPage,
  postEditPet,
  postToggleLostStatus,
  postUpdateEmergencyInfo,
  getPrintableTag,
  deletePet,
  getListingRequestPage,
  postRequestProduct,
};
