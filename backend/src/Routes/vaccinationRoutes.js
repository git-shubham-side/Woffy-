const express = require("express");
const router = express.Router();
const vaccinationController = require("../Controllers/vaccinationController");
const isAuthenticated = require("../Middlewares/isAuthenticated");
const upload = require("../Middlewares/upload");

// View Vaccination Hub for a pet (or all user's pets)
router.get(
  ["/api/vaccinations", "/api/vaccinations/:petId", "/vaccinations", "/vaccinations/:petId"],
  isAuthenticated,
  vaccinationController.getVaccinationsPage,
);

// Auto-Regenerate / Populate WSAVA schedule on demand
router.post(
  ["/api/vaccinations/:petId/generate", "/vaccinations/:petId/generate"],
  isAuthenticated,
  vaccinationController.postGenerateSchedule,
);

// Clear All Vaccination Entries for a pet
router.post(
  ["/api/vaccinations/:petId/clear-all", "/vaccinations/:petId/clear-all"],
  isAuthenticated,
  vaccinationController.postClearAllVaccinations,
);

// Add custom vaccine entry
router.post(
  ["/api/vaccinations/:petId/add", "/vaccinations/:petId/add"],
  isAuthenticated,
  upload.single("vaccineImage"),
  vaccinationController.postAddVaccine,
);

// Mark vaccine as completed (with optional certificate photo upload)
router.post(
  ["/api/vaccinations/complete/:vaccinationId", "/vaccinations/complete/:vaccinationId"],
  isAuthenticated,
  upload.single("vaccineImage"),
  vaccinationController.postCompleteVaccine,
);

// Update vaccine entry
router.post(
  ["/api/vaccinations/update/:vaccinationId", "/vaccinations/update/:vaccinationId"],
  isAuthenticated,
  upload.single("vaccineImage"),
  vaccinationController.postUpdateVaccine,
);

// Delete vaccine entry
router.post(
  ["/api/vaccinations/delete/:vaccinationId", "/vaccinations/delete/:vaccinationId"],
  isAuthenticated,
  vaccinationController.postDeleteVaccine,
);

// Trigger on-demand email reminder
router.post(
  ["/api/vaccinations/:petId/send-reminder", "/vaccinations/:petId/send-reminder"],
  isAuthenticated,
  vaccinationController.postSendReminderEmail,
);

// Printable Digital Vaccination Passport
router.get(
  ["/api/vaccinations/print/:petId", "/vaccinations/print/:petId"],
  isAuthenticated,
  vaccinationController.getVaccinePassportPrint,
);

module.exports = router;
