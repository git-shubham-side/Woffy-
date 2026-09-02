const RescueService = require("../Models/RescueService");
const Product = require("../Models/Product");

/**
 * GET: Render Landing Page
 */
const getLandingPage = (req, res) => {
  if (req.query && req.query.accountDeleted === "true") {
    req.flash(
      "success",
      "Your account and all associated pet records have been permanently deleted. We are sorry to see you go!",
    );
  }
  res.render("Landing/index");
};

/**
 * GET: Health check endpoint
 */
const getHealthCheck = (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
};

/**
 * GET: Public Animal Rescue Services & Helplines Directory
 */
const getRescueServicesPage = async (req, res) => {
  try {
    const { city, search, orgType } = req.query;

    const query = { isVerified: true };

    if (city && city.trim() !== "" && city !== "All") {
      query.city = new RegExp(`^${city.trim()}$`, "i");
    }

    if (orgType && orgType.trim() !== "" && orgType !== "All") {
      query.orgType = orgType.trim();
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { address: searchRegex },
        { city: searchRegex },
        { services: searchRegex },
      ];
    }

    const rescueServices = await RescueService.find(query).sort({
      createdAt: -1,
    });
    const distinctCities = await RescueService.distinct("city", {
      isVerified: true,
    });
    const defaultCities = ["Mumbai", "Pune", "Bengaluru", "Delhi", "Thane"];
    const allCities = Array.from(
      new Set([...distinctCities, ...defaultCities]),
    ).sort();

    res.render("Rescue/rescue", {
      rescueServices,
      cities: allCities,
      selectedCity: city || "All",
      selectedType: orgType || "All",
      searchQuery: search || "",
    });
  } catch (err) {
    console.error("Rescue services directory error:", err);
    res.render("Rescue/rescue", {
      rescueServices: [],
      cities: ["Mumbai", "Pune", "Bengaluru", "Delhi"],
      selectedCity: "All",
      selectedType: "All",
      searchQuery: "",
    });
  }
};

/**
 * GET: Public Pet Products Shop Catalog
 */
const getShopPage = async (req, res) => {
  try {
    const { category, search } = req.query;

    const query = { inStock: true, status: { $ne: "pending" } };

    if (category && category.trim() !== "" && category !== "All") {
      query.category = category.trim();
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    const products = await Product.find(query).sort({
      isFeatured: -1,
      createdAt: -1,
    });

    res.render("Shop/shop", {
      products,
      selectedCategory: category || "All",
      searchQuery: search || "",
    });
  } catch (err) {
    console.error("Shop catalog error:", err);
    res.render("Shop/shop", {
      products: [],
      selectedCategory: "All",
      searchQuery: "",
    });
  }
};

/**
 * 404 Route Not Found Middleware
 */
const notFoundHandler = (req, res) => {
  res.status(404).render("Route-Not-Found/route-not-found");
};

/**
 * Global Error Handler Middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error("Global application error:", err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
};

module.exports = {
  getLandingPage,
  getHealthCheck,
  getRescueServicesPage,
  getShopPage,
  notFoundHandler,
  globalErrorHandler,
};
