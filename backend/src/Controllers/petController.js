const User = require("../Models/User");
const Pet = require("../Models/Pet");
const Record = require("../Models/Record");
const Product = require("../Models/Product");
const Vaccination = require("../Models/Vaccination");
const ShelterRequest = require("../Models/ShelterRequest");
const {
  generateScheduleForPet,
  getUpcomingVaccinesForUser,
  syncVaccinationStatuses,
} = require("../Utils/vaccineScheduleGenerator");
const { syncPetQrCode } = require("../Utils/qrTagGenerator");

const isApiRequest = (req) => {
  return (
    req.xhr ||
    (req.headers.accept && req.headers.accept.includes("application/json")) ||
    (req.headers["content-type"] && req.headers["content-type"].includes("application/json")) ||
    Boolean(req.headers.authorization) ||
    req.originalUrl.includes("/api/")
  );
};

const getUserId = (req) => req.userId || (req.session && req.session.userId);

/**
 * GET: User Dashboard
 */
const getDashboard = async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = userId ? await User.findById(userId) : null;
    const pets = userId ? await Pet.find({ user: userId }).sort({ createdAt: -1 }) : [];
    const products = await Product.find({ inStock: true, status: { $ne: "pending" } })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(6);
    const userProductRequests = userId
      ? await Product.find({ submittedBy: userId }).sort({ createdAt: -1 })
      : [];

    const vaccineAlerts = userId
      ? await getUpcomingVaccinesForUser(userId, 30)
      : { dueSoon: [], overdue: [], totalDueCount: 0 };

    if (isApiRequest(req)) {
      return res.status(200).json({
        success: true,
        userName: user ? user.fullName : "Pet Parent",
        currentUser: user,
        pets: pets || [],
        products: products || [],
        userProductRequests: userProductRequests || [],
        vaccineAlerts: vaccineAlerts || { dueSoon: [], overdue: [], totalDueCount: 0 },
      });
    }

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
    if (isApiRequest(req)) {
      return res.status(500).json({ success: false, message: "Error loading dashboard." });
    }
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
    const userId = getUserId(req);
    const user = userId ? await User.findById(userId) : null;
    if (isApiRequest(req)) {
      return res.status(200).json({ success: true, ownerName: user ? user.fullName : "" });
    }
    res.render("Profile-Creation/create-profile", {
      ownerName: user ? user.fullName : "",
    });
  } catch (err) {
    console.error("Error rendering create pet page:", err);
    if (isApiRequest(req)) {
      return res.status(500).json({ success: false, message: "Error loading form." });
    }
    res.redirect("/api/dashboard");
  }
};

/**
 * POST: Create New Pet Profile
 */
const postCreatePet = async (req, res) => {
  try {
    const userId = getUserId(req);
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
      if (isApiRequest(req)) {
        return res.status(400).json({ success: false, message: "Pet name is required." });
      }
      req.flash("error", "Pet name is required.");
      return res.redirect("/api/create-pet-profile");
    }

    let petDob = null;
    let parsedAge = parseFloat(age);

    if (dob && dob.trim() !== "") {
      petDob = new Date(dob);
      if (!isNaN(petDob.getTime())) {
        const diffMs = Date.now() - petDob.getTime();
        const calculatedAgeYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
        parsedAge = parseFloat(calculatedAgeYears.toFixed(1));
      }
    }

    const mainPhotoFile =
      req.files &&
      ((req.files.petImage && req.files.petImage[0]) ||
        (req.files.photo && req.files.photo[0]));

    let mainPhotoUrl = photoUrl ? photoUrl.trim() : "";
    if (mainPhotoFile) {
      mainPhotoUrl =
        mainPhotoFile.path && mainPhotoFile.path.startsWith("http")
          ? mainPhotoFile.path
          : "/uploads/pets/" + (mainPhotoFile.filename || "");
    }

    const galleryFiles =
      req.files &&
      ((req.files.galleryImages && req.files.galleryImages.length > 0 && req.files.galleryImages) ||
        (req.files.gallery && req.files.gallery.length > 0 && req.files.gallery));

    let galleryUrls = [];
    if (galleryFiles) {
      galleryUrls = galleryFiles.map((file) =>
        file.path && file.path.startsWith("http")
          ? file.path
          : "/uploads/gallery/" + (file.filename || ""),
      );
    }

    const newPet = await Pet.create({
      user: userId,
      petName: petName.trim(),
      ownerName: ownerName ? ownerName.trim() : "",
      species: species || "Dog",
      breed: breed ? breed.trim() : "Unknown",
      dob: petDob,
      age: !isNaN(parsedAge) && parsedAge >= 0 ? parsedAge : 0,
      weight: parseFloat(weight) || 0,
      gender: gender || "Male",
      vaccinated: vaccinated || "Yes",
      photo: mainPhotoUrl,
      photoUrl: mainPhotoUrl,
      gallery: galleryUrls,
      notes: notes ? notes.trim() : "",
      emergencyPhone: emergencyPhone ? emergencyPhone.trim() : "",
      secondaryPhone: secondaryPhone ? secondaryPhone.trim() : "",
      allergies: allergies ? allergies.trim() : "",
      medicalAlerts: medicalAlerts ? medicalAlerts.trim() : "",
      homeCity: homeCity ? homeCity.trim() : "",
    });

    // Auto-generate vaccination schedule
    try {
      await generateScheduleForPet(newPet, userId, false);
    } catch (schedErr) {
      console.warn("Vaccine schedule generation warning:", schedErr.message);
    }

    // Generate Smart QR Collar Tag
    await syncPetQrCode(newPet);

    if (isApiRequest(req)) {
      return res.status(201).json({
        success: true,
        message: `Pet profile for "${newPet.petName}" created successfully with Smart QR Tag!`,
        pet: newPet,
      });
    }

    req.flash(
      "success",
      `Pet profile for "${newPet.petName}" created with Smart QR Collar Tag!`,
    );
    res.redirect(`/api/pet-profile/${newPet._id}`);
  } catch (err) {
    console.error("Pet creation error:", err);
    if (isApiRequest(req)) {
      return res.status(500).json({ success: false, message: "Failed to create pet profile: " + (err.message || "") });
    }
    req.flash("error", "Failed to create pet profile. " + (err.message || ""));
    res.redirect("/api/create-pet-profile");
  }
};

/**
 * GET: View All Registered Pets
 */
const getAllPets = async (req, res) => {
  try {
    const userId = getUserId(req);
    const pets = await Pet.find({ user: userId }).sort({ createdAt: -1 });

    for (const p of pets) {
      if (!p.qrCodeDataUrl) {
        await syncPetQrCode(p);
      }
    }

    if (isApiRequest(req)) {
      return res.status(200).json({ success: true, pets: pets || [] });
    }

    res.render("My-Pets/my-pets", { pets: pets || [] });
  } catch (err) {
    console.error("Fetch pets error:", err);
    if (isApiRequest(req)) {
      return res.status(500).json({ success: false, message: "Error loading pets." });
    }
    req.flash("error", "Error loading your pets.");
    res.render("My-Pets/my-pets", { pets: [] });
  }
};

/**
 * GET: View Single Pet Profile with Smart QR Tag & Health Summary
 */
const getPetProfile = async (req, res) => {
  try {
    const userId = getUserId(req);
    const petId = req.params.petId || req.query.id;
    let pet = null;

    if (petId && petId !== "petId") {
      pet = await Pet.findOne({ _id: petId, user: userId });
    } else {
      pet = await Pet.findOne({ user: userId }).sort({ createdAt: -1 });
    }

    if (!pet) {
      if (isApiRequest(req)) {
        return res.status(404).json({ success: false, message: "Pet profile not found." });
      }
      req.flash("error", "Pet profile not found.");
      return res.redirect("/api/pet-profiles");
    }

    await syncPetQrCode(pet);
    await syncVaccinationStatuses(pet._id);

    const vaccinations = await Vaccination.find({ pet: pet._id }).sort({ dueDate: 1 });
    const records = await Record.find({ pet: pet._id }).sort({ date: -1 }).limit(10);
    const totalDoses = vaccinations.length;
    const completedDoses = vaccinations.filter((v) => v.status === "Completed").length;
    const nextDueVaccine = vaccinations.find((v) => v.status !== "Completed" && v.status !== "Skipped");

    const appBaseUrl = process.env.BASE_URL || "http://localhost:5173";
    const publicTagUrl = `${appBaseUrl}/pet/tag/${pet.collarId || pet._id}`;

    if (isApiRequest(req)) {
      return res.status(200).json({
        success: true,
        pet,
        publicTagUrl,
        records: records || [],
        vaccinations: vaccinations || [],
        vaccineSummary: {
          totalDoses,
          completedDoses,
          percent: totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 0,
          nextDue: nextDueVaccine || null,
        },
      });
    }

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
    if (isApiRequest(req)) {
      return res.status(500).json({ success: false, message: "Error loading pet profile." });
    }
    req.flash("error", "Error loading pet profile.");
    res.redirect("/api/dashboard");
  }
};

/**
 * GET: Render Edit Pet Page
 */
const getEditPetPage = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { petId } = req.params;
    const pet = await Pet.findOne({ _id: petId, user: userId });

    if (!pet) {
      if (isApiRequest(req)) return res.status(404).json({ success: false, message: "Pet not found." });
      req.flash("error", "Pet not found.");
      return res.redirect("/api/pet-profiles");
    }

    if (isApiRequest(req)) return res.status(200).json({ success: true, pet });
    res.render("Profile-Creation/edit-profile", { pet });
  } catch (err) {
    console.error("Edit pet page error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Error loading edit form." });
    res.redirect("/api/pet-profiles");
  }
};

/**
 * POST: Handle Pet Profile Update
 */
const postEditPet = async (req, res) => {
  try {
    const userId = getUserId(req);
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
      lostMessage,
    } = req.body;

    const pet = await Pet.findOne({ _id: petId, user: userId });

    if (!pet) {
      if (isApiRequest(req)) return res.status(404).json({ success: false, message: "Pet not found." });
      req.flash("error", "Pet not found.");
      return res.redirect("/api/pet-profiles");
    }

    if (petName) pet.petName = petName.trim();
    if (ownerName !== undefined) pet.ownerName = ownerName.trim();
    if (species) pet.species = species;
    if (breed) pet.breed = breed.trim();

    if (dob && dob.trim() !== "") {
      const parsedDob = new Date(dob);
      if (!isNaN(parsedDob.getTime())) {
        pet.dob = parsedDob;
        const diffMs = Date.now() - parsedDob.getTime();
        pet.age = parseFloat((diffMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1));
      }
    } else if (age !== undefined && !isNaN(parseFloat(age))) {
      pet.age = parseFloat(age);
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
    if (lostMessage !== undefined) pet.lostMessage = lostMessage.trim();

    const editMainPhotoFile =
      req.files &&
      ((req.files.petImage && req.files.petImage[0]) ||
        (req.files.photo && req.files.photo[0]));

    if (editMainPhotoFile) {
      pet.photo =
        editMainPhotoFile.path && editMainPhotoFile.path.startsWith("http")
          ? editMainPhotoFile.path
          : "/uploads/pets/" + (editMainPhotoFile.filename || "");
    } else if (photoUrl && photoUrl.trim() && !pet.photo) {
      pet.photo = photoUrl.trim();
    }

    const editGalleryFiles =
      req.files &&
      ((req.files.galleryImages && req.files.galleryImages.length > 0 && req.files.galleryImages) ||
        (req.files.gallery && req.files.gallery.length > 0 && req.files.gallery));

    if (editGalleryFiles) {
      const newGallery = editGalleryFiles.map((file) =>
        file.path && file.path.startsWith("http")
          ? file.path
          : "/uploads/gallery/" + (file.filename || ""),
      );
      pet.gallery = (pet.gallery || []).concat(newGallery);
    }

    await syncPetQrCode(pet);
    await pet.save();

    if (isApiRequest(req)) {
      return res.status(200).json({
        success: true,
        message: `Pet profile for "${pet.petName}" updated successfully!`,
        pet,
      });
    }

    req.flash("success", `Pet profile for "${pet.petName}" updated successfully!`);
    res.redirect(`/api/pet-profile/${pet._id}`);
  } catch (err) {
    console.error("Pet update error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Failed to update pet profile." });
    req.flash("error", "Failed to update pet profile.");
    res.redirect(`/api/pet-profile/edit/${req.params.petId}`);
  }
};

/**
 * POST: Toggle Lost Pet Alert Status
 */
const postToggleLostStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { petId } = req.params;
    const { rewardAmount, lostMessage } = req.body;
    const pet = await Pet.findOne({ _id: petId, user: userId });

    if (!pet) {
      if (isApiRequest(req)) return res.status(404).json({ success: false, message: "Pet profile not found." });
      req.flash("error", "Pet profile not found.");
      return res.redirect("/api/pet-profiles");
    }

    pet.isLost = !pet.isLost;
    if (rewardAmount !== undefined) pet.rewardAmount = rewardAmount.trim();
    if (lostMessage !== undefined) pet.lostMessage = lostMessage.trim();

    await pet.save();

    const statusMsg = pet.isLost
      ? `🚨 Emergency LOST PET alert activated for "${pet.petName}". The public QR tag now displays high-visibility emergency rescue instructions.`
      : `🎉 Glad to hear! "${pet.petName}" is marked as safe & found.`;

    if (isApiRequest(req)) {
      return res.status(200).json({
        success: true,
        isLost: pet.isLost,
        message: statusMsg,
        pet,
      });
    }

    req.flash("success", statusMsg);
    res.redirect(`/api/pet-profile/${pet._id}`);
  } catch (err) {
    console.error("Toggle lost status error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Failed to update lost status." });
    req.flash("error", "Failed to update lost status.");
    res.redirect(`/api/pet-profile/${req.params.petId}`);
  }
};

/**
 * POST: Update Emergency Tag Info
 */
const postUpdateEmergencyInfo = async (req, res) => {
  try {
    const userId = getUserId(req);
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

    const pet = await Pet.findOne({ _id: petId, user: userId });
    if (!pet) {
      if (isApiRequest(req)) return res.status(404).json({ success: false, message: "Pet profile not found." });
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

    if (isApiRequest(req)) {
      return res.status(200).json({
        success: true,
        message: "Collar tag emergency information updated successfully!",
        pet,
      });
    }

    req.flash("success", "Collar tag emergency information updated successfully!");
    res.redirect(`/api/pet-profile/${pet._id}`);
  } catch (err) {
    console.error("Update emergency info error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Failed to update collar tag info." });
    req.flash("error", "Failed to update collar tag info.");
    res.redirect(`/api/pet-profile/${req.params.petId}`);
  }
};

/**
 * GET: Render Printable Collar Tag & Wallet ID Sheet
 */
const getPrintableTag = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { petId } = req.params;
    const pet = await Pet.findOne({ _id: petId, user: userId });

    if (!pet) {
      if (isApiRequest(req)) return res.status(404).json({ success: false, message: "Pet profile not found." });
      req.flash("error", "Pet not found.");
      return res.redirect("/api/pet-profiles");
    }

    await syncPetQrCode(pet);
    const user = await User.findById(userId);

    const appBaseUrl = process.env.BASE_URL || "http://localhost:5173";
    const publicTagUrl = `${appBaseUrl}/pet/tag/${pet.collarId || pet._id}`;

    if (isApiRequest(req)) {
      return res.status(200).json({
        success: true,
        pet,
        user,
        publicTagUrl,
      });
    }

    res.render("Pet-Tag/printable-tag", {
      pet,
      owner: user,
      publicTagUrl,
    });
  } catch (err) {
    console.error("Printable tag error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Error generating printable tag." });
    res.redirect(`/api/pet-profile/${req.params.petId}`);
  }
};

/**
 * POST / DELETE: Remove Pet Profile
 */
const deletePet = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { petId } = req.params;
    const deletedPet = await Pet.findOneAndDelete({
      _id: petId,
      user: userId,
    });

    if (!deletedPet) {
      if (isApiRequest(req)) return res.status(404).json({ success: false, message: "Pet not found." });
      req.flash("error", "Pet profile not found or already removed.");
      return res.redirect("/api/pet-profiles");
    }

    await Record.deleteMany({ pet: petId, user: userId });
    await Vaccination.deleteMany({ pet: petId, user: userId });

    if (isApiRequest(req)) {
      return res.status(200).json({
        success: true,
        message: `Pet profile "${deletedPet.petName}" and all associated records deleted successfully.`,
      });
    }

    req.flash(
      "success",
      `Pet profile "${deletedPet.petName}" and all associated records deleted successfully.`,
    );
    res.redirect("/api/pet-profiles");
  } catch (err) {
    console.error("Delete pet error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Failed to delete pet profile." });
    req.flash("error", "Failed to delete pet profile.");
    res.redirect("/api/pet-profiles");
  }
};

/**
 * POST: Handle Community Product Request Submission
 */
const postRequestProduct = async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = userId ? await User.findById(userId) : null;
    const { name, category, price, description, link, submitterPhone } = req.body;

    if (!name || !price || !description) {
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: "Please fill in all required product details." });
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
      submittedBy: userId,
      submitterName: user ? user.fullName : "Pet Parent",
      submitterEmail: user ? user.email : "",
      submitterPhone: submitterPhone ? submitterPhone.trim() : "",
    });

    if (isApiRequest(req)) {
      return res.status(201).json({
        success: true,
        message: `Product request for "${productRequest.name}" submitted successfully! It will go live once reviewed.`,
        product: productRequest,
      });
    }

    req.flash(
      "success",
      `Product request for "${productRequest.name}" submitted successfully! It will go live once reviewed and approved by our team.`,
    );
    res.redirect("/api/dashboard");
  } catch (err) {
    console.error("Product request error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Failed to submit product request." });
    req.flash("error", "Failed to submit product request: " + (err.message || "Unknown error"));
    res.redirect("/api/dashboard");
  }
};

/**
 * GET: Render Dedicated Product Listing Request Page
 */
const getListingRequestPage = async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = userId ? await User.findById(userId) : null;
    if (isApiRequest(req)) return res.status(200).json({ success: true, currentUser: user });
    res.render("Shop/list-product", {
      currentUser: user,
      userName: user ? user.fullName : "Pet Parent",
    });
  } catch (err) {
    console.error("Listing request page load error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Error loading page." });
    res.redirect("/api/dashboard");
  }
};

/**
 * POST: Submit Shelter / NGO Alpha Waitlist Registration
 */
const postShelterWaitlist = async (req, res) => {
  try {
    const { orgName, email, phone, city, animalCount, neededFeatures } = req.body;

    if (!orgName || !orgName.trim() || !email || !email.trim()) {
      if (isApiRequest(req)) {
        return res.status(400).json({
          success: false,
          message: "Please provide both Organization/Shelter Name and Contact Email.",
        });
      }
      req.flash("error", "Please provide both Organization/Shelter Name and Contact Email.");
      return res.redirect("/api/dashboard#ngo-hub");
    }

    const userId = getUserId(req);
    let submittedBy = null;
    let submitterName = "";
    let submitterEmail = "";

    if (userId) {
      try {
        const user = await User.findById(userId);
        if (user) {
          submittedBy = user._id;
          submitterName = user.fullName;
          submitterEmail = user.email;
        }
      } catch (e) {
        console.warn("Could not fetch user for shelter request:", e.message);
      }
    }

    const newRequest = await ShelterRequest.create({
      orgName: orgName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      city: city ? city.trim() : "",
      animalCount: animalCount || "50-100",
      neededFeatures: neededFeatures ? neededFeatures.trim() : "",
      status: "pending",
      submittedBy,
      submitterName,
      submitterEmail,
    });

    if (isApiRequest(req)) {
      return res.status(201).json({
        success: true,
        message: "Thank you! Your shelter registration has been submitted for review.",
        data: newRequest,
      });
    }

    req.flash(
      "success",
      `Thank you! "${newRequest.orgName}" has been successfully registered. Our team will review your application soon.`,
    );
    res.redirect("/api/dashboard#ngo-hub");
  } catch (err) {
    console.error("Shelter waitlist submission error:", err);
    if (isApiRequest(req)) {
      return res.status(500).json({
        success: false,
        message: "Failed to submit shelter registration: " + (err.message || "Server error"),
      });
    }
    req.flash("error", "Failed to submit shelter registration. Please try again.");
    res.redirect("/api/dashboard#ngo-hub");
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
  postShelterWaitlist,
};
