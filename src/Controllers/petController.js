const User = require("../Models/User");
const Pet = require("../Models/Pet");
const Record = require("../Models/Record");
const Product = require("../Models/Product");

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

    res.render("Dashboard/dashboard", {
      userName: user ? user.fullName : "Pet Parent",
      currentUser: user,
      pets: pets || [],
      products: products || [],
      userProductRequests: userProductRequests || [],
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.render("Dashboard/dashboard", {
      userName: "Pet Parent",
      currentUser: null,
      pets: [],
      products: [],
      userProductRequests: [],
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
    res.render("Profile-Creation/create-profile", { ownerName: "" });
  }
};

/**
 * POST: Create New Pet Profile (with Photo and Gallery Uploads)
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
    } = req.body;

    if (!petName || petName.trim() === "") {
      req.flash("error", "Pet name is required.");
      return res.redirect("/api/create-pet-profile");
    }

    let parsedAge = age ? parseFloat(age) : 0;
    const petDob = dob && dob.trim() !== "" ? new Date(dob) : null;
    if ((!age || isNaN(parsedAge)) && petDob && !isNaN(petDob.getTime())) {
      const diffMs = Date.now() - petDob.getTime();
      parsedAge = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)));
    }

    let mainPhoto = "";
    if (
      req.files &&
      req.files["petImage"] &&
      req.files["petImage"].length > 0
    ) {
      const file = req.files["petImage"][0];
      mainPhoto =
        file.path && file.path.startsWith("http")
          ? file.path
          : "/uploads/pets/" + file.filename;
    } else if (photoUrl && photoUrl.trim() !== "") {
      mainPhoto = photoUrl.trim();
    }

    let galleryPhotos = [];
    if (
      req.files &&
      req.files["galleryImages"] &&
      req.files["galleryImages"].length > 0
    ) {
      galleryPhotos = req.files["galleryImages"].map((file) =>
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
    });

    req.flash(
      "success",
      `Pet profile for "${newPet.petName}" created successfully!`,
    );
    res.redirect("/api/pet-profiles");
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
    res.render("My-Pets/my-pets", { pets: pets || [] });
  } catch (err) {
    console.error("Fetch pets error:", err);
    req.flash("error", "Error loading your pets.");
    res.render("My-Pets/my-pets", { pets: [] });
  }
};

/**
 * GET: View Single Pet Profile
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

    res.render("Pet-Profile/profile", { pet });
  } catch (err) {
    console.error("View pet profile error:", err);
    req.flash("error", "Unable to load pet profile.");
    res.redirect("/api/pet-profiles");
  }
};

/**
 * GET: Render Edit Pet Profile Form
 */
const getEditPetPage = async (req, res) => {
  try {
    const { petId } = req.params;
    const pet = await Pet.findOne({ _id: petId, user: req.session.userId });

    if (!pet) {
      req.flash("error", "Pet profile not found.");
      return res.redirect("/api/pet-profiles");
    }

    res.render("Profile-Creation/edit-profile", { pet });
  } catch (err) {
    console.error("Edit pet view error:", err);
    req.flash("error", "Error loading edit page.");
    res.redirect("/api/pet-profiles");
  }
};

/**
 * POST: Update Pet Profile
 */
const postEditPet = async (req, res) => {
  try {
    const { petId } = req.params;
    const pet = await Pet.findOne({ _id: petId, user: req.session.userId });

    if (!pet) {
      req.flash("error", "Pet profile not found.");
      return res.redirect("/api/pet-profiles");
    }

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
    } = req.body;

    if (!petName || petName.trim() === "") {
      req.flash("error", "Pet name is required.");
      return res.redirect(`/api/pet-profile/edit/${pet._id}`);
    }

    pet.petName = petName.trim();
    pet.ownerName = ownerName ? ownerName.trim() : "";
    pet.species = species || "Dog";
    pet.breed = breed ? breed.trim() : "Unknown";
    if (dob !== undefined) {
      pet.dob = dob && dob.trim() !== "" ? new Date(dob) : null;
    }
    if (age !== undefined && age !== "") {
      pet.age = parseFloat(age);
    } else if (pet.dob && !isNaN(pet.dob.getTime())) {
      const diffMs = Date.now() - pet.dob.getTime();
      pet.age = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)));
    }
    pet.weight =
      weight !== undefined && weight !== "" ? parseFloat(weight) : pet.weight;
    pet.gender = gender || "Male";
    pet.vaccinated = vaccinated || "Yes";
    if (notes !== undefined) pet.notes = notes.trim();

    // Check if new primary photo was uploaded
    if (
      req.files &&
      req.files["petImage"] &&
      req.files["petImage"].length > 0
    ) {
      const file = req.files["petImage"][0];
      pet.photo =
        file.path && file.path.startsWith("http")
          ? file.path
          : "/uploads/pets/" + file.filename;
    } else if (photoUrl && photoUrl.trim() !== "") {
      pet.photoUrl = photoUrl.trim();
    }

    // Check if new gallery photos were added
    if (
      req.files &&
      req.files["galleryImages"] &&
      req.files["galleryImages"].length > 0
    ) {
      const newGalleryPhotos = req.files["galleryImages"].map((file) =>
        file.path && file.path.startsWith("http")
          ? file.path
          : "/uploads/gallery/" + file.filename,
      );
      pet.gallery = (pet.gallery || []).concat(newGalleryPhotos);
    }

    await pet.save();

    req.flash(
      "success",
      `Pet profile for "${pet.petName}" updated successfully!`,
    );
    res.redirect(`/api/pet-profile/${pet._id}`);
  } catch (err) {
    console.error("Update pet error:", err);
    req.flash(
      "error",
      "Failed to update pet profile. " + (err.message || ""),
    );
    res.redirect(`/api/pet-profile/edit/${req.params.petId}`);
  }
};

/**
 * POST: Delete Pet Profile & Cascade Associated Records
 */
const deletePet = async (req, res) => {
  try {
    const { petId } = req.params;
    await Pet.findOneAndDelete({ _id: petId, user: req.session.userId });
    await Record.deleteMany({ pet: petId, user: req.session.userId });
    req.flash("success", "Pet profile and all associated logs were deleted.");
    res.redirect("/api/pet-profiles");
  } catch (err) {
    console.error("Delete pet error:", err);
    req.flash("error", "Failed to delete pet profile.");
    res.redirect("/api/pet-profiles");
  }
};

/**
 * POST: User Submit Product Listing Request (Pending Admin Approval)
 */
const postRequestProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      brandName,
      price,
      originalPrice,
      description,
      buyUrl,
      submitterPhone,
      photoUrl,
      tags,
    } = req.body;

    if (!name || !price) {
      req.flash("error", "Product name and price are required.");
      return res.redirect("/api/dashboard");
    }

    const user = await User.findById(req.session.userId);

    let photoPath = "";
    if (req.file) {
      photoPath =
        req.file.path && req.file.path.startsWith("http")
          ? req.file.path
          : "/uploads/products/" + req.file.filename;
    } else if (photoUrl && photoUrl.trim() !== "") {
      photoPath = photoUrl.trim();
    } else {
      photoPath =
        "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80";
    }

    const priceNum = parseFloat(price);
    const originalPriceNum = originalPrice ? parseFloat(originalPrice) : null;
    let discountPercent = 0;
    if (originalPriceNum && originalPriceNum > priceNum) {
      discountPercent = Math.round(
        ((originalPriceNum - priceNum) / originalPriceNum) * 100,
      );
    }

    let tagsList = ["Dog Care"];
    if (tags && tags.trim() !== "") {
      tagsList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const productRequest = await Product.create({
      name: name.trim(),
      category: category || "Food",
      brandName: brandName ? brandName.trim() : "",
      price: priceNum,
      originalPrice: originalPriceNum,
      discountPercent,
      description: description ? description.trim() : "",
      image: photoPath,
      buyUrl: buyUrl ? buyUrl.trim() : "",
      tags: tagsList,
      rating: 4.8,
      inStock: true,
      isFeatured: false,
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
  deletePet,
  getListingRequestPage,
  postRequestProduct,
};


