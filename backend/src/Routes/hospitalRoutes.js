const express = require("express");
const router = express.Router();
const hospitalController = require("../Controllers/hospitalController");
const upload = require("../Middlewares/upload");

// Public & Authenticated Hospitals Directory
router.get(
  ["/services/hospitals", "/api/hospitals"],
  hospitalController.getHospitalsPage,
);

// Nearby hospitals JSON API
router.get("/api/hospitals/nearby", hospitalController.getNearbyHospitalsApi);

// Add Hospital Form
router.get(
  ["/services/hospitals/add", "/api/hospitals/add"],
  hospitalController.getAddHospitalPage,
);

// Process Hospital Creation
router.post(
  ["/services/hospitals/add", "/api/hospitals/add"],
  upload.single("hospitalImage"),
  hospitalController.postAddHospital,
);

module.exports = router;
