const express = require("express");
const router = express.Router();
const contactController = require("../Controllers/contactController");

// Contact Us Form Submission
router.post(["/api/contact", "/contact"], contactController.postContactForm);

module.exports = router;
