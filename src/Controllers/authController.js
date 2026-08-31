const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const User = require("../Models/User");
const { sendPasswordResetEmail } = require("../Utils/mailer");

/**
 * GET: Render Signup Page
 */
const getSignupPage = (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect("/api/dashboard");
  }
  res.render("Signup/signup");
};

/**
 * POST: Handle User Signup
 */
const postSignup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      req.flash("error", "Please fill in all required fields.");
      return res.redirect("/api/signup");
    }

    if (password.length < 8) {
      req.flash("error", "Password must be at least 8 characters long.");
      return res.redirect("/api/signup");
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      req.flash(
        "error",
        "An account with this email already exists. Please log in instead.",
      );
      return res.redirect("/api/signup");
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "rathodshubham7711@gmail.com").toLowerCase().trim();
    const isNewAdmin = email.toLowerCase().trim() === adminEmail;

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: isNewAdmin ? "admin" : "user",
      isAdmin: isNewAdmin,
    });

    req.session.userId = user._id.toString();
    req.flash("success", "Account created successfully! Welcome to Woofy.");
    return res.redirect(isNewAdmin ? "/admin/hospitals" : "/api/dashboard");
  } catch (err) {
    console.error("Signup error:", err);
    if (err.code === 11000) {
      req.flash("error", "Email is already registered. Please log in.");
    } else if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      req.flash("error", messages.join(", "));
    } else {
      req.flash("error", "Registration failed. Please try again.");
    }
    return res.redirect("/api/signup");
  }
};

/**
 * GET: Render Login Page
 */
const getLoginPage = (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect("/api/dashboard");
  }
  res.render("Login/login");
};

/**
 * POST: Handle User Login
 */
const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "Please enter both email and password.");
      return res.redirect("/api/login");
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/api/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/api/login");
    }

    // Ensure ADMIN_EMAIL has admin privileges
    const adminEmail = (process.env.ADMIN_EMAIL || "rathodshubham7711@gmail.com").toLowerCase().trim();
    if (user.email.toLowerCase().trim() === adminEmail && (!user.isAdmin || user.role !== "admin")) {
      user.isAdmin = true;
      user.role = "admin";
      await user.save();
    }

    req.session.userId = user._id.toString();
    req.flash("success", `Welcome back, ${user.fullName}!`);
    return res.redirect(user.isAdmin || user.role === "admin" ? "/admin/hospitals" : "/api/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    req.flash("error", "An error occurred during login. Please try again.");
    return res.redirect("/api/login");
  }
};

/**
 * GET: Handle User Logout
 */
const logout = (req, res) => {
  if (req.session) {
    delete req.session.userId;
  }
  req.flash("success", "You have been logged out successfully.");
  res.redirect("/api/login");
};

/* ==========================================================================
   FORGOT PASSWORD & OTP RESET FLOW
   ========================================================================== */

/**
 * GET: Render Forgot Password Request Page
 */
const getForgotPasswordPage = (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect("/api/dashboard");
  }
  res.render("Forgot-Password/forgot-password");
};

/**
 * POST: Process Forgot Password Request (Generate Token & 6-Digit OTP)
 */
const postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === "") {
      req.flash("error", "Please enter your registered email address.");
      return res.redirect("/api/forget-pass");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      req.flash(
        "error",
        "No account with this email was found. Please check your spelling or sign up.",
      );
      return res.redirect("/api/forget-pass");
    }

    // Generate secure raw token for URL link
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 15 Minutes Expiration
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiresAt;
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = expiresAt;

    await user.save();

    const appBaseUrl = process.env.BASE_URL || "https://woffy.up.railway.app";
    const resetUrl = `${appBaseUrl}/api/reset-password/${rawToken}`;

    // Dispatch Email with 1-Click Link and OTP
    await sendPasswordResetEmail({
      userEmail: user.email,
      userName: user.fullName,
      resetUrl,
      otp,
    });

    req.flash(
      "success",
      `Password reset instructions and a 6-digit OTP have been sent to ${user.email}. Valid for 15 minutes.`,
    );
    return res.redirect(`/api/verify-reset-otp?email=${encodeURIComponent(user.email)}`);
  } catch (err) {
    console.error("Forgot password error:", err);
    req.flash("error", "Failed to process password reset request. Please try again.");
    return res.redirect("/api/forget-pass");
  }
};

/**
 * GET: Render Reset Password Form via 1-Click Token
 */
const getResetPasswordWithTokenPage = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash(
        "error",
        "Password reset token is invalid or has expired. Please request a new one.",
      );
      return res.redirect("/api/forget-pass");
    }

    res.render("Forgot-Password/reset-password", {
      token,
      email: user.email,
    });
  } catch (err) {
    console.error("Reset token verification error:", err);
    req.flash("error", "Error verifying password reset link.");
    res.redirect("/api/forget-pass");
  }
};

/**
 * POST: Save New Password via 1-Click Token
 */
const postResetPasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      req.flash("error", "Please provide and confirm your new password.");
      return res.redirect(`/api/reset-password/${token}`);
    }

    if (password.length < 8) {
      req.flash("error", "Password must be at least 8 characters long.");
      return res.redirect(`/api/reset-password/${token}`);
    }

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect(`/api/reset-password/${token}`);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash(
        "error",
        "Password reset session expired. Please request a new link.",
      );
      return res.redirect("/api/forget-pass");
    }

    user.password = password; // Hashed via pre-save hook
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;

    await user.save();

    req.flash(
      "success",
      "🎉 Password updated successfully! Please log in with your new credentials.",
    );
    return res.redirect("/api/login");
  } catch (err) {
    console.error("Post reset password token error:", err);
    req.flash("error", "Failed to reset password. Please try again.");
    return res.redirect(`/api/reset-password/${req.params.token}`);
  }
};

/**
 * GET: Render OTP Verification Page
 */
const getVerifyOtpPage = (req, res) => {
  const { email } = req.query;
  res.render("Forgot-Password/verify-otp", {
    email: email || "",
  });
};

/**
 * POST: Verify 6-Digit OTP and Reset Password
 */
const postVerifyOtpAndReset = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      req.flash("error", "All fields including OTP and new password are required.");
      return res.redirect(`/api/verify-reset-otp?email=${encodeURIComponent(email || "")}`);
    }

    if (password.length < 8) {
      req.flash("error", "New password must be at least 8 characters long.");
      return res.redirect(`/api/verify-reset-otp?email=${encodeURIComponent(email)}`);
    }

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect(`/api/verify-reset-otp?email=${encodeURIComponent(email)}`);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordOtp: cleanOtp,
      resetPasswordOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash(
        "error",
        "Invalid or expired 6-digit OTP code. Please check and try again.",
      );
      return res.redirect(`/api/verify-reset-otp?email=${encodeURIComponent(email)}`);
    }

    user.password = password; // Hashed via pre-save hook
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;

    await user.save();

    req.flash(
      "success",
      "🎉 Password updated successfully via OTP verification! Please log in.",
    );
    return res.redirect("/api/login");
  } catch (err) {
    console.error("Post verify OTP error:", err);
    req.flash("error", "Failed to verify OTP. Please try again.");
    return res.redirect(`/api/verify-reset-otp?email=${encodeURIComponent(req.body.email || "")}`);
  }
};

/**
 * GET: Render Terms & Privacy Policy Page
 */
const getTermsPage = (req, res) => {
  res.render("Forgot-Password/terms");
};

module.exports = {
  getSignupPage,
  postSignup,
  getLoginPage,
  postLogin,
  logout,
  getForgotPasswordPage,
  postForgotPassword,
  getResetPasswordWithTokenPage,
  postResetPasswordWithToken,
  getVerifyOtpPage,
  postVerifyOtpAndReset,
  getTermsPage,
};
