const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");

// Signup
router.get(["/signup", "/api/signup"], authController.getSignupPage);
router.post(["/signup", "/api/signup"], authController.postSignup);

// Login
router.get(["/login", "/api/login"], authController.getLoginPage);
router.post(["/login", "/api/login"], authController.postLogin);

// Logout
router.get(["/logout", "/api/logout"], authController.logout);

// Forgot Password & Terms
router.get(
  ["/forget-pass", "/api/forget-pass"],
  authController.getForgotPassword,
);
router.get(["/terms", "/api/terms"], authController.getTermsPage);

module.exports = router;
