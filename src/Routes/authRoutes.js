const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");

// Signup
router.get(["/signup", "/api/signup"], authController.getSignupPage);
router.post(["/signup", "/api/signup"], authController.postSignup);

// Login
router.get(["/login", "/api/login"], authController.getLoginPage);
router.post(["/login", "/api/login"], authController.postLogin);

// Google OAuth 2.0 Flow
router.get(["/auth/google", "/api/auth/google"], authController.getGoogleAuthRedirect);
router.get(
  ["/auth/google/callback", "/api/auth/google/callback"],
  authController.handleGoogleCallback,
);

// Logout
router.get(["/logout", "/api/logout"], authController.logout);

// Forgot Password Request
router.get(
  ["/forget-pass", "/api/forget-pass", "/forgot-password", "/api/forgot-password"],
  authController.getForgotPasswordPage,
);
router.post(
  ["/forget-pass", "/api/forget-pass", "/forgot-password", "/api/forgot-password"],
  authController.postForgotPassword,
);

// Reset Password via 1-Click Secure Token Link
router.get(
  ["/reset-password/:token", "/api/reset-password/:token"],
  authController.getResetPasswordWithTokenPage,
);
router.post(
  ["/reset-password/:token", "/api/reset-password/:token"],
  authController.postResetPasswordWithToken,
);

// Verify OTP & Reset Password
router.get(
  ["/verify-reset-otp", "/api/verify-reset-otp"],
  authController.getVerifyOtpPage,
);
router.post(
  ["/verify-reset-otp", "/api/verify-reset-otp"],
  authController.postVerifyOtpAndReset,
);

// Terms & Conditions
router.get(["/terms", "/api/terms"], authController.getTermsPage);

module.exports = router;
