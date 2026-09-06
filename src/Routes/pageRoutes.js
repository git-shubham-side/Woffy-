const express = require("express");
const path = require("node:path");
const router = express.Router();
const pageController = require("../Controllers/pageController");

// Landing Page
router.get("/", pageController.getLandingPage);

// Search Engine Crawlers & SEO Assets
router.get("/sitemap.xml", (req, res) => {
  res.type("application/xml; charset=utf-8");
  res.sendFile(path.join(__dirname, "../public/sitemap.xml"));
});

router.get("/robots.txt", (req, res) => {
  res.type("text/plain; charset=utf-8");
  res.sendFile(path.join(__dirname, "../public/robots.txt"));
});

router.get("/site.webmanifest", (req, res) => {
  res.type("application/manifest+json");
  res.sendFile(path.join(__dirname, "../public/site.webmanifest"));
});

router.get("/favicon.ico", (req, res) => {
  res.type("image/x-icon");
  res.sendFile(path.join(__dirname, "../public/favicon.ico"));
});

router.get("/favicon.svg", (req, res) => {
  res.type("image/svg+xml");
  res.sendFile(path.join(__dirname, "../public/favicon.svg"));
});

// Health Check
router.get("/api/health", pageController.getHealthCheck);

// Live Animal Rescue Services Directory
router.get("/services/rescue", pageController.getRescueServicesPage);

// Live Pet Products Shop
router.get("/shop", pageController.getShopPage);

module.exports = router;

