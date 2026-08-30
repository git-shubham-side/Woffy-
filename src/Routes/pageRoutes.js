const express = require("express");
const router = express.Router();
const pageController = require("../Controllers/pageController");

// Landing Page
router.get("/", pageController.getLandingPage);

// Health Check
router.get("/api/health", pageController.getHealthCheck);

// Services / Shop Redirects
router.get(
  ["/services/rescue", "/shop"],
  pageController.getServicesRedirect,
);

module.exports = router;
