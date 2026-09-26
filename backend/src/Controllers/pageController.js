const RescueService = require("../Models/RescueService");
const Product = require("../Models/Product");

const isApiRequest = (req) => {
  return (
    req.xhr ||
    (req.headers.accept && req.headers.accept.includes("application/json")) ||
    (req.headers["content-type"] && req.headers["content-type"].includes("application/json")) ||
    Boolean(req.headers.authorization) ||
    req.originalUrl.includes("/api/")
  );
};

/**
 * GET: Render Landing Page
 */
const getLandingPage = (req, res) => {
  if (req.query && req.query.accountDeleted === "true") {
    if (req.flash) {
      req.flash(
        "success",
        "Your account and all associated pet records have been permanently deleted.",
      );
    }
  }
  if (isApiRequest(req)) {
    return res.status(200).json({ success: true, message: "Woffy Pet Care Platform API active." });
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

    const categories = [
      "All",
      "NGO",
      "Animal Ambulance",
      "Shelter",
      "Stray Rescue",
      "Government Helpline",
      "Wildlife Rescue",
      "Adoption Center",
      "Animal Hospital & Sanctuary",
      "Trust",
    ];

    if (isApiRequest(req)) {
      return res.status(200).json({
        success: true,
        rescueServices: rescueServices || [],
        cities: allCities,
        categories,
        selectedCity: city || "All",
        selectedType: orgType || "All",
        searchQuery: search || "",
      });
    }

    res.render("Rescue/rescue", {
      rescueServices,
      cities: allCities,
      selectedCity: city || "All",
      selectedType: orgType || "All",
      searchQuery: search || "",
    });
  } catch (err) {
    console.error("Rescue services directory error:", err);
    if (isApiRequest(req)) {
      return res.status(500).json({ success: false, message: "Error loading rescue services." });
    }
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

    const categories = [
      "All",
      "Food",
      "Grooming",
      "Toys",
      "Healthcare",
      "Accessories",
      "Bedding & Bowls",
    ];

    if (isApiRequest(req)) {
      return res.status(200).json({
        success: true,
        products: products || [],
        categories,
        selectedCategory: category || "All",
        searchQuery: search || "",
      });
    }

    res.render("Shop/shop", {
      products,
      selectedCategory: category || "All",
      searchQuery: search || "",
    });
  } catch (err) {
    console.error("Shop catalog error:", err);
    if (isApiRequest(req)) {
      return res.status(500).json({ success: false, message: "Error loading shop products." });
    }
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
  if (isApiRequest(req)) {
    return res.status(404).json({ success: false, message: "Route not found" });
  }
  res.status(404).render("Route-Not-Found/route-not-found");
};

/**
 * Global Error Handler Middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error("Global application error:", err.stack || err);
  res.status(err.status || 500).json({
    success: false,
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
