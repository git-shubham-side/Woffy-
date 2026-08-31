const express = require("express");
const router = express.Router();
const adminController = require("../Controllers/adminController");
const isAdmin = require("../Middlewares/isAdmin");
const upload = require("../Middlewares/upload");

// Protect all admin routes
router.use(isAdmin);

// Unified Admin Dashboard (Overview, Hospitals, Rescue Services, Products)
router.get(["/", "/dashboard", "/hospitals", "/rescue", "/products"], (req, res, next) => {
  if (req.path.startsWith("/hospitals")) {
    req.query.section = "hospitals";
  } else if (req.path.startsWith("/rescue")) {
    req.query.section = "rescue";
  } else if (req.path.startsWith("/products")) {
    req.query.section = "products";
  }
  adminController.getAdminDashboard(req, res, next);
});

/* ==========================================================================
   HOSPITALS ROUTES
   ========================================================================== */
router.post(
  "/hospitals/approve/:hospitalId",
  adminController.postApproveHospital,
);
router.post("/hospitals/reject/:hospitalId", adminController.postRejectHospital);
router.post("/hospitals/delete/:hospitalId", adminController.postDeleteHospital);
router.post(
  "/hospitals/add",
  upload.single("hospitalImage"),
  adminController.postAdminDirectAddHospital,
);

/* ==========================================================================
   RESCUE SERVICES ROUTES
   ========================================================================== */
router.post(
  "/rescue/add",
  upload.single("rescueImage"),
  adminController.postAddRescueService,
);
router.post("/rescue/delete/:id", adminController.postDeleteRescueService);

/* ==========================================================================
   PRODUCTS CATALOG ROUTES
   ========================================================================== */
router.get("/products/edit/:id", adminController.getEditProductPage);
router.post(
  "/products/edit/:id",
  upload.single("productImage"),
  adminController.postEditProduct,
);
router.post(
  "/products/add",
  upload.single("productImage"),
  adminController.postAddProduct,
);
router.post(
  "/products/toggle-stock/:id",
  adminController.postToggleProductStock,
);
router.post("/products/approve/:id", adminController.postApproveProduct);
router.post("/products/reject/:id", adminController.postRejectProduct);
router.post("/products/delete/:id", adminController.postDeleteProduct);

module.exports = router;

