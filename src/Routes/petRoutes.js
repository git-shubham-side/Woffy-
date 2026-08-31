const express = require("express");
const router = express.Router();
const petController = require("../Controllers/petController");
const isAuthenticated = require("../Middlewares/isAuthenticated");
const upload = require("../Middlewares/upload");

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

// Delete Pet Profile
router.post(
  "/api/pet-profile/delete/:petId",
  isAuthenticated,
  petController.deletePet,
);

module.exports = router;
