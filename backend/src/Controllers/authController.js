const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const User = require("../Models/User");
const Pet = require("../Models/Pet");
const Vaccination = require("../Models/Vaccination");
const Record = require("../Models/Record");
const { sendPasswordResetEmail } = require("../Utils/mailer");
const { generateToken } = require("../Utils/tokenHelper");

/**
 * Check whether incoming request expects JSON response (React SPA / mobile / API)
 */
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
 * GET: Render Signup Page / Check Auth
 */
const getSignupPage = (req, res) => {
  const userId = req.userId || (req.session && req.session.userId);
  if (userId) {
    if (isApiRequest(req)) {
      return res.status(200).json({ success: true, message: "Already authenticated." });
    }
    return res.redirect("/api/dashboard");
  }
  if (isApiRequest(req)) {
    return res.status(200).json({ success: true, message: "Signup endpoint ready." });
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
      if (isApiRequest(req)) {
        return res.status(400).json({ success: false, message: "Please fill in all required fields." });
      }
      req.flash("error", "Please fill in all required fields.");
      return res.redirect("/api/signup");
    }

    if (password.length < 8) {
      if (isApiRequest(req)) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
      }
      req.flash("error", "Password must be at least 8 characters long.");
      return res.redirect("/api/signup");
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      if (isApiRequest(req)) {
        return res.status(409).json({ success: false, message: "An account with this email already exists. Please log in." });
      }
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

    if (req.session) {
      req.session.userId = user._id.toString();
    }
    const token = generateToken(user);

    const safeUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
    };

    if (isApiRequest(req)) {
      return res.status(201).json({
        success: true,
        message: "Account created successfully! Welcome to Woofy.",
        token,
        user: safeUser,
      });
    }

    req.flash("success", "Account created successfully! Welcome to Woofy.");
    return res.redirect(isNewAdmin ? "/admin/hospitals" : "/api/dashboard");
  } catch (err) {
    console.error("Signup error:", err);
    let errMsg = "Registration failed. Please try again.";
    if (err.code === 11000) {
      errMsg = "Email is already registered. Please log in.";
    } else if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      errMsg = messages.join(", ");
    }
    if (isApiRequest(req)) {
      return res.status(500).json({ success: false, message: errMsg });
    }
    req.flash("error", errMsg);
    return res.redirect("/api/signup");
  }
};

/**
 * GET: Render Login Page / Check Auth
 */
const getLoginPage = (req, res) => {
  const userId = req.userId || (req.session && req.session.userId);
  if (userId) {
    if (isApiRequest(req)) {
      return res.status(200).json({ success: true, message: "Already authenticated." });
    }
    return res.redirect("/api/dashboard");
  }
  if (isApiRequest(req)) {
    return res.status(200).json({ success: true, message: "Login endpoint ready." });
  }
  res.render("Login/login");
};

/**
 * GET: Current Authenticated User (GET /api/auth/me)
 */
const getMe = async (req, res) => {
  try {
    const userId = req.userId || (req.session && req.session.userId);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const adminEmail = (process.env.ADMIN_EMAIL || "rathodshubham7711@gmail.com").toLowerCase().trim();
    const isCompanyAdmin =
      user.isAdmin === true ||
      user.role === "admin" ||
      user.email.toLowerCase().trim() === adminEmail;

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: isCompanyAdmin ? "admin" : user.role,
        isAdmin: isCompanyAdmin,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Helper to determine the exact Google OAuth callback URL dynamically
 */
const getGoogleCallbackUrl = (req) => {
  const currentHost = (
    req.get("x-forwarded-host") ||
    req.get("host") ||
    ""
  ).toLowerCase();
  const isLocalhost =
    currentHost.includes("localhost") || currentHost.includes("127.0.0.1");

  if (isLocalhost) {
    if (
      process.env.GOOGLE_CALLBACK_URL &&
      process.env.GOOGLE_CALLBACK_URL.includes("localhost")
    ) {
      return process.env.GOOGLE_CALLBACK_URL.trim();
    }
    const port = process.env.PORT || 5000;
    return `http://${currentHost || `localhost:${port}`}/auth/google/callback`;
  }

  if (
    process.env.GOOGLE_CALLBACK_URL &&
    !process.env.GOOGLE_CALLBACK_URL.includes("localhost") &&
    !process.env.GOOGLE_CALLBACK_URL.includes("127.0.0.1")
  ) {
    return process.env.GOOGLE_CALLBACK_URL.trim();
  }

  if (process.env.BASE_URL && process.env.BASE_URL.trim() !== "") {
    return `${process.env.BASE_URL.trim().replace(/\/+$/, "")}/auth/google/callback`;
  }

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
      if (isApiRequest(req)) {
        return res.status(500).json({ success: false, message: "Google OAuth credentials not configured." });
      }
      req.flash(
        "error",
        "Google OAuth is not configured yet. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.",
      );
      return res.redirect("/api/login");
    }

    const callbackUrl = getGoogleCallbackUrl(req);
    console.log(`[Google OAuth] Initiating redirect with callback URL: ${callbackUrl}`);

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
    if (isApiRequest(req)) {
      return res.status(500).json({ success: false, message: "Could not initialize Google authentication." });
    }
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
    console.log(`[Google OAuth] Callback received: code=${code ? "present" : "missing"}, error=${error || "none"}`);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    if (error) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(`Google sign-in cancelled: ${error}`)}`);
    }

    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("No authorization code received from Google.")}`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.trim() : "";

    const callbackUrl = getGoogleCallbackUrl(req);

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
      return res.redirect(`${frontendUrl}/login?error=Google_Token_Exchange_Failed`);
    }

    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const googleProfile = await userinfoResponse.json();

    if (!userinfoResponse.ok || !googleProfile.email) {
      console.error("Google UserInfo Fetch Failed:", googleProfile);
      return res.redirect(`${frontendUrl}/login?error=Google_Profile_Failed`);
    }

    const email = googleProfile.email.toLowerCase().trim();
    const googleId = googleProfile.sub;
    const fullName = googleProfile.name || googleProfile.given_name || "Pet Parent";
    const avatar = googleProfile.picture || null;

    const adminEmail = (process.env.ADMIN_EMAIL || "rathodshubham7711@gmail.com").toLowerCase().trim();
    const isCompanyAdmin = email === adminEmail;

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

    if (req.session) {
      req.session.userId = user._id.toString();
    }
    const token = generateToken(user);

    // Redirect to React Frontend with token in query params so React can store it!
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}&userId=${user._id}`);
  } catch (err) {
    console.error("Google Callback Error:", err);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/login?error=Google_Callback_Error`);
  }
};

/**
 * POST: Handle User Login
 */
const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      if (isApiRequest(req)) {
        return res.status(400).json({ success: false, message: "Please enter both email and password." });
      }
      req.flash("error", "Please enter both email and password.");
      return res.redirect("/api/login");
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (!user) {
      if (isApiRequest(req)) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
      }
      req.flash("error", "Invalid email or password.");
      return res.redirect("/api/login");
    }

    if (!user.password) {
      const msg = "This account was registered using Google. Please sign in with Google.";
      if (isApiRequest(req)) {
        return res.status(400).json({ success: false, message: msg });
      }
      req.flash("error", msg);
      return res.redirect("/api/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      if (isApiRequest(req)) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
      }
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

    if (req.session) {
      req.session.userId = user._id.toString();
    }
    const token = generateToken(user);

    const safeUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
    };

    if (isApiRequest(req)) {
      return res.status(200).json({
        success: true,
        message: `Welcome back, ${user.fullName}!`,
        token,
        user: safeUser,
      });
    }

    req.flash("success", `Welcome back, ${user.fullName}!`);
    return res.redirect(user.isAdmin || user.role === "admin" ? "/admin/hospitals" : "/api/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    if (isApiRequest(req)) {
      return res.status(500).json({ success: false, message: "An error occurred during login. Please try again." });
    }
    req.flash("error", "An error occurred during login. Please try again.");
    return res.redirect("/api/login");
  }
};

/**
 * GET/POST: Handle User Logout
 */
const logout = (req, res) => {
  if (req.session) {
    delete req.session.userId;
  }
  if (isApiRequest(req)) {
    return res.status(200).json({ success: true, message: "You have been logged out successfully." });
  }
  req.flash("success", "You have been logged out successfully.");
  res.redirect("/api/login");
};

/**
 * GET: Render Forgot Password Request Page
 */
const getForgotPasswordPage = (req, res) => {
  const userId = req.userId || (req.session && req.session.userId);
  if (userId) {
    if (isApiRequest(req)) return res.json({ success: true, message: "Already authenticated." });
    return res.redirect("/api/dashboard");
  }
  if (isApiRequest(req)) return res.json({ success: true, message: "Ready for password reset request." });
  res.render("Forgot-Password/forgot-password");
};

/**
 * POST: Process Forgot Password Request (Generate Token & 6-Digit OTP)
 */
const postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === "") {
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: "Please enter your registered email address." });
      req.flash("error", "Please enter your registered email address.");
      return res.redirect("/api/forget-pass");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      if (isApiRequest(req)) return res.status(404).json({ success: false, message: "No account with this email was found." });
      req.flash("error", "No account with this email was found. Please check your spelling or sign up.");
      return res.redirect("/api/forget-pass");
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiresAt;
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = expiresAt;

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    sendPasswordResetEmail({
      userEmail: user.email,
      userName: user.fullName,
      resetUrl,
      otp,
    }).catch((e) => console.error("Async reset email error:", e));

    const msg = `Password reset instructions and a 6-digit OTP have been sent to ${user.email}. Valid for 15 minutes.`;

    if (isApiRequest(req)) {
      return res.status(200).json({
        success: true,
        message: msg,
        email: user.email,
        rawToken: process.env.NODE_ENV !== "production" ? rawToken : undefined,
      });
    }

    req.flash("success", msg);
    return res.redirect(`/api/verify-reset-otp?email=${encodeURIComponent(user.email)}`);
  } catch (err) {
    console.error("Forgot password error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Failed to process password reset request." });
    req.flash("error", "Failed to process password reset request. Please try again.");
    return res.redirect("/api/forget-pass");
  }
};

/**
 * GET: Render Reset Password Form via Token
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
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: "Password reset token is invalid or has expired." });
      req.flash("error", "Password reset token is invalid or has expired. Please request a new one.");
      return res.redirect("/api/forget-pass");
    }

    if (isApiRequest(req)) return res.status(200).json({ success: true, email: user.email });
    res.render("Forgot-Password/reset-password", { token, email: user.email });
  } catch (err) {
    console.error("Reset token verification error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Error verifying password reset link." });
    req.flash("error", "Error verifying password reset link.");
    res.redirect("/api/forget-pass");
  }
};

/**
 * POST: Save New Password via Token
 */
const postResetPasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: "Please provide and confirm your new password." });
      req.flash("error", "Please provide and confirm your new password.");
      return res.redirect(`/api/reset-password/${token}`);
    }

    if (password.length < 8) {
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
      req.flash("error", "Password must be at least 8 characters long.");
      return res.redirect(`/api/reset-password/${token}`);
    }

    if (password !== confirmPassword) {
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: "Passwords do not match." });
      req.flash("error", "Passwords do not match.");
      return res.redirect(`/api/reset-password/${token}`);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: "Password reset session expired. Please request a new link." });
      req.flash("error", "Password reset session expired. Please request a new link.");
      return res.redirect("/api/forget-pass");
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;

    await user.save();

    if (isApiRequest(req)) {
      return res.status(200).json({ success: true, message: "Password updated successfully! Please log in with your new credentials." });
    }

    req.flash("success", "🎉 Password updated successfully! Please log in with your new credentials.");
    return res.redirect("/api/login");
  } catch (err) {
    console.error("Post reset password token error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Failed to reset password. Please try again." });
    req.flash("error", "Failed to reset password. Please try again.");
    return res.redirect(`/api/reset-password/${req.params.token}`);
  }
};

/**
 * GET: Render OTP Verification Page
 */
const getVerifyOtpPage = (req, res) => {
  const { email } = req.query;
  if (isApiRequest(req)) return res.json({ success: true, email: email || "" });
  res.render("Forgot-Password/verify-otp", { email: email || "" });
};

/**
 * POST: Verify 6-Digit OTP and Reset Password
 */
const postVerifyOtpAndReset = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      const msg = "All fields including OTP and new password are required.";
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: msg });
      req.flash("error", msg);
      return res.redirect(`/api/verify-reset-otp?email=${encodeURIComponent(email || "")}`);
    }

    if (password.length < 8) {
      const msg = "New password must be at least 8 characters long.";
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: msg });
      req.flash("error", msg);
      return res.redirect(`/api/verify-reset-otp?email=${encodeURIComponent(email)}`);
    }

    if (password !== confirmPassword) {
      const msg = "Passwords do not match.";
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: msg });
      req.flash("error", msg);
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
      const msg = "Invalid or expired 6-digit OTP code. Please check and try again.";
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: msg });
      req.flash("error", msg);
      return res.redirect(`/api/verify-reset-otp?email=${encodeURIComponent(email)}`);
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;

    await user.save();

    if (isApiRequest(req)) {
      return res.status(200).json({ success: true, message: "Password updated successfully via OTP! Please log in." });
    }

    req.flash("success", "🎉 Password updated successfully via OTP verification! Please log in.");
    return res.redirect("/api/login");
  } catch (err) {
    console.error("Post verify OTP error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Failed to verify OTP. Please try again." });
    req.flash("error", "Failed to verify OTP. Please try again.");
    return res.redirect(`/api/verify-reset-otp?email=${encodeURIComponent(req.body.email || "")}`);
  }
};

/**
 * GET: Terms & Privacy Policy
 */
const getTermsPage = (req, res) => {
  if (isApiRequest(req)) return res.json({ success: true, title: "Terms and Conditions" });
  res.render("Forgot-Password/terms");
};

/**
 * GET: User Settings Details & Metrics
 */
const getSettingsPage = async (req, res) => {
  try {
    const userId = req.userId || (req.session && req.session.userId);
    if (!userId) {
      if (isApiRequest(req)) return res.status(401).json({ success: false, message: "Unauthorized" });
      return res.redirect("/api/login");
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      if (isApiRequest(req)) return res.status(404).json({ success: false, message: "User not found" });
      req.flash("error", "User not found. Please log in again.");
      return res.redirect("/api/login");
    }

    const [petCount, vaccineCount, recordCount] = await Promise.all([
      Pet.countDocuments({ user: user._id }),
      Vaccination.countDocuments({ user: user._id }),
      Record.countDocuments({ user: user._id }),
    ]);

    if (isApiRequest(req)) {
      return res.status(200).json({
        success: true,
        user,
        stats: { petCount, vaccineCount, recordCount },
      });
    }

    res.render("Settings/settings", {
      user,
      petCount,
      vaccineCount,
      recordCount,
      activePage: "settings",
    });
  } catch (err) {
    console.error("Get settings error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Failed to load settings." });
    req.flash("error", "Failed to load settings. Please try again.");
    res.redirect("/api/dashboard");
  }
};

/**
 * POST: Update Profile Details
 */
const postUpdateProfile = async (req, res) => {
  try {
    const userId = req.userId || (req.session && req.session.userId);
    if (!userId) {
      if (isApiRequest(req)) return res.status(401).json({ success: false, message: "Unauthorized" });
      return res.redirect("/api/login");
    }

    const { fullName } = req.body;
    if (!fullName || fullName.trim().length === 0) {
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: "Full name cannot be empty." });
      req.flash("error", "Full name cannot be empty.");
      return res.redirect("/settings");
    }

    const user = await User.findById(userId);
    if (!user) {
      if (isApiRequest(req)) return res.status(404).json({ success: false, message: "User not found" });
      req.flash("error", "User not found.");
      return res.redirect("/api/login");
    }

    user.fullName = fullName.trim();
    await user.save();

    if (isApiRequest(req)) {
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully!",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin,
          avatar: user.avatar,
        },
      });
    }

    req.flash("success", "Profile updated successfully!");
    res.redirect("/settings");
  } catch (err) {
    console.error("Update profile error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Failed to update profile." });
    req.flash("error", "Failed to update profile.");
    res.redirect("/settings");
  }
};

/**
 * POST: Change or Set Password
 */
const postChangePassword = async (req, res) => {
  try {
    const userId = req.userId || (req.session && req.session.userId);
    if (!userId) {
      if (isApiRequest(req)) return res.status(401).json({ success: false, message: "Unauthorized" });
      return res.redirect("/api/login");
    }

    const user = await User.findById(userId);
    if (!user) {
      if (isApiRequest(req)) return res.status(404).json({ success: false, message: "User not found." });
      req.flash("error", "User not found.");
      return res.redirect("/api/login");
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (user.password) {
      if (!currentPassword) {
        const msg = "Current password is required.";
        if (isApiRequest(req)) return res.status(400).json({ success: false, message: msg });
        req.flash("error", msg);
        return res.redirect("/settings");
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        const msg = "Incorrect current password.";
        if (isApiRequest(req)) return res.status(400).json({ success: false, message: msg });
        req.flash("error", msg);
        return res.redirect("/settings");
      }
    }

    if (!newPassword || newPassword.length < 8) {
      const msg = "New password must be at least 8 characters long.";
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: msg });
      req.flash("error", msg);
      return res.redirect("/settings");
    }

    if (newPassword !== confirmPassword) {
      const msg = "New passwords do not match.";
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: msg });
      req.flash("error", msg);
      return res.redirect("/settings");
    }

    user.password = newPassword;
    await user.save();

    if (isApiRequest(req)) {
      return res.status(200).json({ success: true, message: "Password updated successfully!" });
    }

    req.flash("success", "Password updated successfully!");
    res.redirect("/settings");
  } catch (err) {
    console.error("Change password error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Failed to update password." });
    req.flash("error", "Failed to update password.");
    res.redirect("/settings");
  }
};

/**
 * POST: Permanently Delete User Account & All Associated Data
 */
const postDeleteAccount = async (req, res) => {
  try {
    const userId = req.userId || (req.session && req.session.userId);
    if (!userId) {
      if (isApiRequest(req)) return res.status(401).json({ success: false, message: "Unauthorized" });
      return res.redirect("/api/login");
    }

    const user = await User.findById(userId);
    if (!user) {
      if (isApiRequest(req)) return res.status(404).json({ success: false, message: "User not found." });
      req.flash("error", "User not found.");
      return res.redirect("/api/login");
    }

    const { password, confirmDelete } = req.body;

    if (user.password) {
      if (!password) {
        const msg = "Please enter your password to confirm account deletion.";
        if (isApiRequest(req)) return res.status(400).json({ success: false, message: msg });
        req.flash("error", msg);
        return res.redirect("/settings");
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const msg = "Incorrect password. Account deletion cancelled.";
        if (isApiRequest(req)) return res.status(400).json({ success: false, message: msg });
        req.flash("error", msg);
        return res.redirect("/settings");
      }
    } else {
      const cleanConfirm = (confirmDelete || "").trim().toUpperCase();
      const userEmailUpper = (user.email || "").trim().toUpperCase();
      if (cleanConfirm !== "DELETE" && cleanConfirm !== userEmailUpper) {
        const msg = "Please type 'DELETE' or your registered email to confirm account deletion.";
        if (isApiRequest(req)) return res.status(400).json({ success: false, message: msg });
        req.flash("error", msg);
        return res.redirect("/settings");
      }
    }

    await Vaccination.deleteMany({ user: userId });
    await Record.deleteMany({ user: userId });
    await Pet.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    if (req.session) {
      req.session.destroy();
    }
    res.clearCookie("connect.sid");

    if (isApiRequest(req)) {
      return res.status(200).json({ success: true, message: "Account and associated data deleted permanently." });
    }

    return res.redirect("/?accountDeleted=true");
  } catch (err) {
    console.error("Delete account error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Failed to delete account." });
    req.flash("error", "Failed to delete account. Please try again.");
    res.redirect("/settings");
  }
};

module.exports = {
  getSignupPage,
  postSignup,
  getLoginPage,
  getMe,
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
