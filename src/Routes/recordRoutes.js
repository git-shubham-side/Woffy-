const express = require("express");
const router = express.Router();
const recordController = require("../Controllers/recordController");
const isAuthenticated = require("../Middlewares/isAuthenticated");
const upload = require("../Middlewares/upload");

// Select Pet For Tracking
router.get(
  ["/api/select-pet-for-tracking", "/select-pet-for-tracking"],
  isAuthenticated,
  recordController.getSelectPetForTracking,
);

// Track Activity Page / API records endpoint (GET)
router.get(
  [
    "/",
    "/api/records",
    "/api/records/:petId",
    "/api/track",
    "/api/track/:petId",
    "/api/petId",
    "/records",
    "/records/:petId",
    "/track",
    "/track/:petId",
    "/:petId",
  ],
  isAuthenticated,
  recordController.getTrackPage,
);

// Create Tracking Log (POST)
router.post(
  [
    "/",
    "/create",
    "/api/records",
    "/api/records/create",
    "/api/track",
    "/api/track/create",
    "/records",
    "/records/create",
    "/track",
    "/track/create",
  ],
  isAuthenticated,
  upload.single("recordImage"),
  recordController.postCreateRecord,
);

// Select Pet to Show Complete Records
router.get(
  ["/api/select-pet-to-show-record", "/select-pet-to-show-record"],
  isAuthenticated,
  recordController.getSelectPetForRecords,
);

// View Complete History for Pet
router.get(
  [
    "/api/show-records/:petId",
    "/api/show-records/petID",
    "/show-records/:petId",
  ],
  isAuthenticated,
  recordController.getViewRecordsPage,
);

// Delete Record Log (POST & DELETE)
router.post(
  [
    "/delete/:recordId",
    "/:recordId/delete",
    "/api/records/delete/:recordId",
    "/api/records/:recordId/delete",
    "/records/delete/:recordId",
    "/records/:recordId/delete",
  ],
  isAuthenticated,
  recordController.deleteRecord,
);

router.delete(
  [
    "/:recordId",
    "/api/records/:recordId",
    "/records/:recordId",
  ],
  isAuthenticated,
  recordController.deleteRecord,
);

module.exports = router;
