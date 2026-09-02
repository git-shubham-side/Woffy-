const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const User = require("../Models/User");
const Pet = require("../Models/Pet");
const Vaccination = require("../Models/Vaccination");
const Record = require("../Models/Record");
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
 * Helper to determine the exact Google OAuth callback URL dynamically
 * Prevents localhost redirect errors when running in production, and vice-versa
 */
const getGoogleCallbackUrl = (req) => {
  const currentHost = (
    req.get("x-forwarded-host") ||
    req.get("host") ||
    ""
  ).toLowerCase();
  const isLocalhost =
    currentHost.includes("localhost") || currentHost.includes("127.0.0.1");

  // 1. If running on localhost:
  if (isLocalhost) {
    if (
      process.env.GOOGLE_CALLBACK_URL &&
      process.env.GOOGLE_CALLBACK_URL.includes("localhost")
    ) {
      return process.env.GOOGLE_CALLBACK_URL.trim();
    }
    const port = process.env.PORT || 3000;
    return `http://${currentHost || `localhost:${port}`}/auth/google/callback`;
  }

  // 2. If running on production:
  // Use GOOGLE_CALLBACK_URL only if it's a production URL (not localhost)
  if (
    process.env.GOOGLE_CALLBACK_URL &&
    !process.env.GOOGLE_CALLBACK_URL.includes("localhost") &&
    !process.env.GOOGLE_CALLBACK_URL.includes("127.0.0.1")
  ) {
    return process.env.GOOGLE_CALLBACK_URL.trim();
  }

  // Otherwise, use BASE_URL if set (e.g. https://woffy.up.railway.app)
  if (process.env.BASE_URL && process.env.BASE_URL.trim() !== "") {
    return `${process.env.BASE_URL.trim().replace(/\/+$/, "")}/auth/google/callback`;
  }

  // Fallback to request headers on production
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
  return `${protocol}://${currentHost}/auth/google/callback`;
};

/**
 * GET: Initiate Google OAuth 2.0 Flow
 */
const getGoogleAuthRedirect = (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.trim() : "";

    if (!clientId || !clientSecret) {
      req.flash(
        "error",
        "Google OAuth is not configured yet. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.",
      );
      return res.redirect("/api/login");
    }

    const callbackUrl = getGoogleCallbackUrl(req);

    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: callbackUrl,
      client_id: clientId,
      access_type: "offline",
      response_type: "code",
      prompt: "select_account",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);
    return res.redirect(`${rootUrl}?${qs.toString()}`);
  } catch (err) {
    console.error("Google Auth Redirect Error:", err);
    req.flash("error", "Could not initialize Google authentication.");
    return res.redirect("/api/login");
  }
};

/**
 * GET: Handle Google OAuth 2.0 Callback
 */
const handleGoogleCallback = async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      req.flash("error", `Google sign-in cancelled or denied (${error}).`);
      return res.redirect("/api/login");
    }

    if (!code) {
      req.flash("error", "No authorization code received from Google.");
      return res.redirect("/api/login");
    }

    const clientId = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.trim() : "";

    if (!clientId || !clientSecret) {
      req.flash("error", "Google OAuth credentials are not configured in your environment.");
      return res.redirect("/api/login");
    }

    const callbackUrl = getGoogleCallbackUrl(req);

    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Google Token Exchange Failed:", tokenData);
      req.flash("error", "Failed to retrieve access token from Google.");
      return res.redirect("/api/login");
    }

    // 2. Fetch Google User Profile
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const googleProfile = await userinfoResponse.json();

    if (!userinfoResponse.ok || !googleProfile.email) {
      console.error("Google UserInfo Fetch Failed:", googleProfile);
      req.flash("error", "Failed to retrieve user profile from Google.");
      return res.redirect("/api/login");
    }

    const email = googleProfile.email.toLowerCase().trim();
    const googleId = googleProfile.sub;
    const fullName = googleProfile.name || googleProfile.given_name || "Pet Parent";
    const avatar = googleProfile.picture || null;

    const adminEmail = (process.env.ADMIN_EMAIL || "rathodshubham7711@gmail.com").toLowerCase().trim();
    const isCompanyAdmin = email === adminEmail;

    // 3. Find or Create User
    let user = await User.findOne({
      $or: [{ googleId: googleId }, { email: email }],
    });

    if (user) {
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        updated = true;
      }
      if (isCompanyAdmin && (!user.isAdmin || user.role !== "admin")) {
        user.isAdmin = true;
        user.role = "admin";
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      user = await User.create({
        fullName: fullName.trim(),
        email: email,
        googleId: googleId,
        avatar: avatar,
        authProvider: "google",
        role: isCompanyAdmin ? "admin" : "user",
        isAdmin: isCompanyAdmin,
      });
    }

    // 4. Establish Session
    req.session.userId = user._id.toString();
    req.flash("success", `Welcome, ${user.fullName}! Signed in with Google.`);

    const destination = user.isAdmin || user.role === "admin" ? "/admin/hospitals" : "/api/dashboard";
    return res.redirect(destination);
  } catch (err) {
    console.error("Google Callback Error:", err);
    req.flash("error", "Google authentication failed. Please try again.");
    return res.redirect("/api/login");
  }
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

    if (!user.password) {
      req.flash(
        "error",
        "This account was registered using Google. Please click 'Continue with Google' to sign in.",
      );
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

    // Dispatch Email with 1-Click Link and OTP (using warm pool)
    sendPasswordResetEmail({
      userEmail: user.email,
      userName: user.fullName,
      resetUrl,
      otp,
    }).catch((e) => console.error("Async reset email error:", e));

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

/**
 * GET: Render User Settings Page
 */
const getSettingsPage = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect("/api/login");
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      req.flash("error", "User not found. Please log in again.");
      return res.redirect("/api/login");
    }

    const [petCount, vaccineCount, recordCount] = await Promise.all([
      Pet.countDocuments({ user: user._id }),
      Vaccination.countDocuments({ user: user._id }),
      Record.countDocuments({ user: user._id }),
    ]);

    res.render("Settings/settings", {
      user,
      petCount,
      vaccineCount,
      recordCount,
      activePage: "settings",
    });
  } catch (err) {
    console.error("Get settings error:", err);
    req.flash("error", "Failed to load settings. Please try again.");
    res.redirect("/api/dashboard");
  }
};

/**
 * POST: Update Profile Details
 */
const postUpdateProfile = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect("/api/login");
    }

    const { fullName } = req.body;
    if (!fullName || fullName.trim().length === 0) {
      req.flash("error", "Full name cannot be empty.");
      return res.redirect("/settings");
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/api/login");
    }

    user.fullName = fullName.trim();
    await user.save();

    req.flash("success", "Profile updated successfully!");
    res.redirect("/settings");
  } catch (err) {
    console.error("Update profile error:", err);
    req.flash("error", "Failed to update profile.");
    res.redirect("/settings");
  }
};

/**
 * POST: Change or Set Password
 */
const postChangePassword = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect("/api/login");
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/api/login");
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // If user already has a password, verify currentPassword
    if (user.password) {
      if (!currentPassword) {
        req.flash("error", "Current password is required.");
        return res.redirect("/settings");
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        req.flash("error", "Incorrect current password.");
        return res.redirect("/settings");
      }
    }

    if (!newPassword || newPassword.length < 8) {
      req.flash("error", "New password must be at least 8 characters long.");
      return res.redirect("/settings");
    }

    if (newPassword !== confirmPassword) {
      req.flash("error", "New passwords do not match.");
      return res.redirect("/settings");
    }

    user.password = newPassword; // Hashed via pre-save hook
    await user.save();

    req.flash("success", "Password updated successfully!");
    res.redirect("/settings");
  } catch (err) {
    console.error("Change password error:", err);
    req.flash("error", "Failed to update password.");
    res.redirect("/settings");
  }
};

/**
 * POST: Permanently Delete User Account & All Associated Data
 */
const postDeleteAccount = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect("/api/login");
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/api/login");
    }

    const { password, confirmDelete } = req.body;

    // Security Verification:
    if (user.password) {
      if (!password) {
        req.flash("error", "Please enter your password to confirm account deletion.");
        return res.redirect("/settings");
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        req.flash("error", "Incorrect password. Account deletion cancelled.");
        return res.redirect("/settings");
      }
    } else {
      // Google-only user without password: must type DELETE or their registered email
      const cleanConfirm = (confirmDelete || "").trim().toUpperCase();
      const userEmailUpper = (user.email || "").trim().toUpperCase();
      if (cleanConfirm !== "DELETE" && cleanConfirm !== userEmailUpper) {
        req.flash(
          "error",
          "Please type 'DELETE' or your registered email to confirm account deletion.",
        );
        return res.redirect("/settings");
      }
    }

    const userId = user._id;

    // Cascading deletion:
    // 1. Delete all vaccinations belonging to user
    await Vaccination.deleteMany({ user: userId });

    // 2. Delete all daily records belonging to user
    await Record.deleteMany({ user: userId });

    // 3. Delete all pets belonging to user
    await Pet.deleteMany({ user: userId });

    // 4. Delete user account
    await User.findByIdAndDelete(userId);

    // 5. Destroy active session
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error during account deletion:", err);
      }
      res.clearCookie("connect.sid");
      return res.redirect("/?accountDeleted=true");
    });
  } catch (err) {
    console.error("Delete account error:", err);
    req.flash("error", "Failed to delete account. Please try again.");
    res.redirect("/settings");
  }
};

module.exports = {
  getSignupPage,
  postSignup,
  getLoginPage,
  postLogin,
  logout,
  getGoogleAuthRedirect,
  handleGoogleCallback,
  getForgotPasswordPage,
  postForgotPassword,
  getResetPasswordWithTokenPage,
  postResetPasswordWithToken,
  getVerifyOtpPage,
  postVerifyOtpAndReset,
  getTermsPage,
  getSettingsPage,
  postUpdateProfile,
  postChangePassword,
  postDeleteAccount,
};
