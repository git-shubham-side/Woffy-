const Hospital = require("../Models/Hospital");
const RescueService = require("../Models/RescueService");
const Product = require("../Models/Product");
const User = require("../Models/User");

/**
 * GET: Admin Dashboard (Unified Platform Management Portal)
 */
const getAdminDashboard = async (req, res) => {
  try {
    const { section = "overview", tab = "pending", search } = req.query;

    const [
      pendingApplications,
      approvedHospitals,
      rejectedApplications,
      rescueServices,
      products,
    ] = await Promise.all([
      Hospital.find({ status: "pending" }).sort({ createdAt: -1 }),
      Hospital.find({ status: "approved" }).sort({ updatedAt: -1 }),
      Hospital.find({ status: "rejected" }).sort({ updatedAt: -1 }),
      RescueService.find().sort({ createdAt: -1 }),
      Product.find().sort({ createdAt: -1 }),
    ]);

    const stats = {
      hospitalsTotal:
        pendingApplications.length +
        approvedHospitals.length +
        rejectedApplications.length,
      pendingHospitals: pendingApplications.length,
      approvedHospitals: approvedHospitals.length,
      rejectedHospitals: rejectedApplications.length,
      rescueTotal: rescueServices.length,
      productsTotal: products.length,
      inStockProducts: products.filter((p) => p.inStock).length,
    };

    res.render("Admin/admin-dashboard", {
      section,
      activeTab: tab,
      searchQuery: search || "",
      stats,
      pendingApplications,
      approvedHospitals,
      rejectedApplications,
      rescueServices,
      products,
      currentUser: req.user,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    req.flash("error", "Failed to load Admin Portal.");
    res.redirect("/api/dashboard");
  }
};

/* ==========================================================================
   HOSPITALS MANAGEMENT ACTIONS
   ========================================================================== */

/**
 * POST: Approve & Publish Hospital Listing (Verification Successful)
 */
const postApproveHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      {
        isVerified: true,
        status: "approved",
        rejectionReason: "",
      },
      { new: true },
    );

    if (!hospital) {
      req.flash("error", "Hospital record not found.");
      return res.redirect("/admin?section=hospitals&tab=pending");
    }

    req.flash(
      "success",
      `Hospital "${hospital.name}" (${hospital.city}) verified and published live!`,
    );
    res.redirect("/admin?section=hospitals&tab=approved");
  } catch (err) {
    console.error("Approve hospital error:", err);
    req.flash("error", "Failed to approve hospital.");
    res.redirect("/admin?section=hospitals");
  }
};

/**
 * POST: Reject Hospital Application
 */
const postRejectHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { reason } = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      {
        isVerified: false,
        status: "rejected",
        rejectionReason: reason ? reason.trim() : "Verification criteria not met.",
      },
      { new: true },
    );

    if (!hospital) {
      req.flash("error", "Hospital record not found.");
      return res.redirect("/admin?section=hospitals&tab=pending");
    }

    req.flash(
      "success",
      `Application for "${hospital.name}" marked as rejected.`,
    );
    res.redirect("/admin?section=hospitals&tab=rejected");
  } catch (err) {
    console.error("Reject hospital error:", err);
    req.flash("error", "Failed to reject application.");
    res.redirect("/admin?section=hospitals");
  }
};

/**
 * POST: Delete Hospital Listing
 */
const postDeleteHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const hospital = await Hospital.findByIdAndDelete(hospitalId);

    if (!hospital) {
      req.flash("error", "Hospital record not found.");
      return res.redirect("/admin?section=hospitals");
    }

    req.flash(
      "success",
      `Hospital "${hospital.name}" deleted permanently.`,
    );
    res.redirect("/admin?section=hospitals");
  } catch (err) {
    console.error("Delete hospital error:", err);
    req.flash("error", "Failed to delete hospital record.");
    res.redirect("/admin?section=hospitals");
  }
};

/**
 * POST: Direct Add Pre-Verified Hospital by Admin
 */
const postAdminDirectAddHospital = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      address,
      city,
      state,
      pincode,
      phone,
      emergencyPhone,
      email,
      website,
      is24x7,
      services,
      customServices,
      lat,
      lng,
      rating,
    } = req.body;

    if (!name || !address || !city || !phone) {
      req.flash("error", "Name, address, city, and phone are required.");
      return res.redirect("/admin?section=hospitals&tab=add");
    }

    let servicesList = [];
    if (Array.isArray(services)) {
      servicesList = services;
    } else if (typeof services === "string" && services.trim() !== "") {
      servicesList = [services.trim()];
    }

    if (customServices && customServices.trim() !== "") {
      const additional = customServices
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      servicesList = Array.from(new Set([...servicesList, ...additional]));
    }

    let photoPath = "";
    if (req.file) {
      photoPath = "/uploads/hospitals/" + req.file.filename;
    } else if (req.body.photoUrl && req.body.photoUrl.trim() !== "") {
      photoPath = req.body.photoUrl.trim();
    } else {
      photoPath =
        "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80";
    }

    const hospital = await Hospital.create({
      name: name.trim(),
      contactPerson: contactPerson ? contactPerson.trim() : "Admin Verified",
      address: address.trim(),
      city: city.trim(),
      state: state ? state.trim() : "Maharashtra",
      pincode: pincode ? pincode.trim() : "",
      phone: phone.trim(),
      emergencyPhone: emergencyPhone ? emergencyPhone.trim() : phone.trim(),
      email: email ? email.toLowerCase().trim() : "",
      website: website ? website.trim() : "",
      is24x7: is24x7 === "on" || is24x7 === "true" || is24x7 === true,
      services: servicesList.length > 0 ? servicesList : ["OPD", "Surgery", "Vaccination"],
      photo: photoPath,
      rating: rating ? parseFloat(rating) : 4.8,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      isVerified: true,
      status: "approved",
      user: req.session.userId,
    });

    req.flash(
      "success",
      `Verified hospital "${hospital.name}" created and published directly!`,
    );
    res.redirect("/admin?section=hospitals&tab=approved");
  } catch (err) {
    console.error("Direct add hospital error:", err);
    req.flash("error", "Failed to add hospital: " + err.message);
    res.redirect("/admin?section=hospitals&tab=add");
  }
};

/* ==========================================================================
   RESCUE SERVICES MANAGEMENT ACTIONS
   ========================================================================== */

/**
 * POST: Add Rescue Service / Animal NGO / Shelter
 */
const postAddRescueService = async (req, res) => {
  try {
    const {
      name,
      orgType,
      city,
      state,
      address,
      phone,
      emergencyHelpline,
      email,
      website,
      services,
      customServices,
      is24x7,
      notes,
    } = req.body;

    if (!name || !city || !address || !phone) {
      req.flash("error", "Organization name, city, address, and phone number are required.");
      return res.redirect("/admin?section=rescue");
    }

    let servicesList = [];
    if (Array.isArray(services)) {
      servicesList = services;
    } else if (typeof services === "string" && services.trim() !== "") {
      servicesList = [services.trim()];
    }

    if (customServices && customServices.trim() !== "") {
      const extra = customServices
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      servicesList = Array.from(new Set([...servicesList, ...extra]));
    }

    let photoPath = "";
    if (req.file) {
      photoPath = "/uploads/rescue/" + req.file.filename;
    } else if (req.body.photoUrl && req.body.photoUrl.trim() !== "") {
      photoPath = req.body.photoUrl.trim();
    } else {
      photoPath =
        "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80";
    }

    const rescue = await RescueService.create({
      name: name.trim(),
      orgType: orgType || "NGO",
      city: city.trim(),
      state: state ? state.trim() : "Maharashtra",
      address: address.trim(),
      phone: phone.trim(),
      emergencyHelpline: emergencyHelpline ? emergencyHelpline.trim() : phone.trim(),
      email: email ? email.toLowerCase().trim() : "",
      website: website ? website.trim() : "",
      services: servicesList.length > 0 ? servicesList : ["Stray Rescue", "Medical Care"],
      is24x7: is24x7 === "on" || is24x7 === "true" || is24x7 === true,
      isVerified: true,
      photo: photoPath,
      notes: notes ? notes.trim() : "",
    });

    req.flash(
      "success",
      `Rescue Service "${rescue.name}" (${rescue.city}) added successfully!`,
    );
    res.redirect("/admin?section=rescue");
  } catch (err) {
    console.error("Add rescue service error:", err);
    req.flash("error", "Failed to add rescue service: " + err.message);
    res.redirect("/admin?section=rescue");
  }
};

/**
 * POST: Delete Rescue Service
 */
const postDeleteRescueService = async (req, res) => {
  try {
    const { id } = req.params;
    const rescue = await RescueService.findByIdAndDelete(id);

    if (!rescue) {
      req.flash("error", "Rescue service not found.");
      return res.redirect("/admin?section=rescue");
    }

    req.flash("success", `Rescue service "${rescue.name}" deleted successfully.`);
    res.redirect("/admin?section=rescue");
  } catch (err) {
    console.error("Delete rescue service error:", err);
    req.flash("error", "Failed to delete rescue service.");
    res.redirect("/admin?section=rescue");
  }
};

/* ==========================================================================
   PRODUCTS / SHOP MANAGEMENT ACTIONS
   ========================================================================== */

/**
 * POST: Add Product to Shop Catalog
 */
const postAddProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      originalPrice,
      rating,
      description,
      buyUrl,
      isFeatured,
      tags,
    } = req.body;

    if (!name || !price) {
      req.flash("error", "Product name and price are required.");
      return res.redirect("/admin?section=products");
    }

    let photoPath = "";
    if (req.file) {
      photoPath = "/uploads/products/" + req.file.filename;
    } else if (req.body.photoUrl && req.body.photoUrl.trim() !== "") {
      photoPath = req.body.photoUrl.trim();
    } else {
      photoPath =
        "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80";
    }

    const priceNum = parseFloat(price);
    const originalPriceNum = originalPrice ? parseFloat(originalPrice) : null;
    let discountPercent = 0;
    if (originalPriceNum && originalPriceNum > priceNum) {
      discountPercent = Math.round(
        ((originalPriceNum - priceNum) / originalPriceNum) * 100,
      );
    }

    let tagsList = ["Dog Care"];
    if (tags && tags.trim() !== "") {
      tagsList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const product = await Product.create({
      name: name.trim(),
      category: category || "Food",
      price: priceNum,
      originalPrice: originalPriceNum,
      discountPercent,
      rating: rating ? parseFloat(rating) : 4.8,
      description: description ? description.trim() : "",
      image: photoPath,
      buyUrl: buyUrl ? buyUrl.trim() : "",
      isFeatured: isFeatured === "on" || isFeatured === "true",
      inStock: true,
      tags: tagsList,
    });

    req.flash("success", `Product "${product.name}" added to catalog successfully!`);
    res.redirect("/admin?section=products");
  } catch (err) {
    console.error("Add product error:", err);
    req.flash("error", "Failed to add product: " + err.message);
    res.redirect("/admin?section=products");
  }
};

/**
 * POST: Toggle Product In-Stock Status
 */
const postToggleProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      req.flash("error", "Product not found.");
      return res.redirect("/admin?section=products");
    }

    product.inStock = !product.inStock;
    await product.save();

    req.flash(
      "success",
      `Product "${product.name}" marked as ${product.inStock ? "In Stock" : "Out of Stock"}.`,
    );
    res.redirect("/admin?section=products");
  } catch (err) {
    console.error("Toggle stock error:", err);
    req.flash("error", "Failed to update stock status.");
    res.redirect("/admin?section=products");
  }
};

/**
 * POST: Delete Product from Catalog
 */
const postDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      req.flash("error", "Product not found.");
      return res.redirect("/admin?section=products");
    }

    req.flash("success", `Product "${product.name}" removed from catalog.`);
    res.redirect("/admin?section=products");
  } catch (err) {
    console.error("Delete product error:", err);
    req.flash("error", "Failed to delete product.");
    res.redirect("/admin?section=products");
  }
};

module.exports = {
  getAdminDashboard,
  postApproveHospital,
  postRejectHospital,
  postDeleteHospital,
  postAdminDirectAddHospital,
  postAddRescueService,
  postDeleteRescueService,
  postAddProduct,
  postToggleProductStock,
  postDeleteProduct,
};
