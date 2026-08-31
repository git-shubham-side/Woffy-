const express = require("express");
const router = express.Router();
const petController = require("../Controllers/petController");
const publicTagController = require("../Controllers/publicTagController");
const isAuthenticated = require("../Middlewares/isAuthenticated");
const upload = require("../Middlewares/upload");

// Public Emergency Pet Tag Route (No Auth Required for Finders/Scanners)
router.get(
  ["/pet/tag/:id", "/pet/scan/:id", "/api/pet/tag/:id"],
  publicTagController.getPublicPetTag,
);

// Dashboard
router.get(
  ["/dashboard", "/api/dashboard"],
  isAuthenticated,
  petController.getDashboard,
);

// Pet Profile Creation
router.get(
  "/api/create-pet-profile",
  isAuthenticated,
  petController.getCreatePetPage,
);
router.post(
  "/api/create-pet-profile",
  isAuthenticated,
  upload.fields([
    { name: "petImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  petController.postCreatePet,
);

// View All Pets
router.get("/api/pet-profiles", isAuthenticated, petController.getAllPets);

// Single Pet Profile
router.get(
  [
    "/api/pet-profile/:petId",
    "/api/pet-profile",
    "/api/profile/:petId",
    "/profile/:petId",
  ],
  isAuthenticated,
  petController.getPetProfile,
);

// Edit Pet Profile
router.get(
  "/api/pet-profile/edit/:petId",
  isAuthenticated,
  petController.getEditPetPage,
);
router.post(
  "/api/pet-profile/edit/:petId",
  isAuthenticated,
  upload.fields([
    { name: "petImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  petController.postEditPet,
);

// Toggle Lost Pet Alert (1-Click Emergency Switch)
router.post(
  "/api/pet-profile/:petId/toggle-lost",
  isAuthenticated,
  petController.postToggleLostStatus,
);

// Update Emergency Contact & Medical Tag Info
router.post(
  "/api/pet-profile/:petId/update-tag",
  isAuthenticated,
  petController.postUpdateEmergencyInfo,
);

// Printable Collar Tag & Wallet Card Sheet
router.get(
  "/api/pet-profile/:petId/print-tag",
  isAuthenticated,
  petController.getPrintableTag,
);

// Delete Pet Profile
router.post(
  "/api/pet-profile/delete/:petId",
  isAuthenticated,
  petController.deletePet,
);

// Product Listing Request Page (User initiated)
router.get(
  ["/products/list-product", "/shop/list-product", "/api/products/request"],
  isAuthenticated,
  petController.getListingRequestPage,
);

// Submit Product Listing Request (User initiated)
router.post(
  "/api/products/request",
  isAuthenticated,
  upload.single("productImage"),
  petController.postRequestProduct,
);

module.exports = router;
