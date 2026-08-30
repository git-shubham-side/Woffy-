const express = require("express");
const router = express.Router();
const pageController = require("../Controllers/pageController");

// Landing Page
router.get("/", pageController.getLandingPage);

// Health Check
router.get("/api/health", pageController.getHealthCheck);

// Live Animal Rescue Services Directory
router.get("/services/rescue", pageController.getRescueServicesPage);

// Live Pet Products Shop
router.get("/shop", pageController.getShopPage);

module.exports = router;
