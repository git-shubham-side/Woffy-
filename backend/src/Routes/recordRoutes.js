const express = require("express");
const router = express.Router();
const recordController = require("../Controllers/recordController");
const isAuthenticated = require("../Middlewares/isAuthenticated");
const upload = require("../Middlewares/upload");

// Select Pet For Tracking
router.get(
  "/api/select-pet-for-tracking",
  isAuthenticated,
  recordController.getSelectPetForTracking,
);

// Track Activity Page (Form & Recent Logs)
router.get(
  ["/api/track/:petId", "/api/petId"],
  isAuthenticated,
  recordController.getTrackPage,
);

// Create Tracking Log
router.post(
  ["/api/track/create", "/api/records/create"],
  isAuthenticated,
  upload.single("recordImage"),
  recordController.postCreateRecord,
);

// Select Pet to Show Complete Records
router.get(
  "/api/select-pet-to-show-record",
  isAuthenticated,
  recordController.getSelectPetForRecords,
);

// View Complete History for Pet
router.get(
  ["/api/show-records/:petId", "/api/show-records/petID"],
  isAuthenticated,
  recordController.getViewRecordsPage,
);

// Delete Record Log
router.post(
  "/api/records/delete/:recordId",
  isAuthenticated,
  recordController.deleteRecord,
);

module.exports = router;
