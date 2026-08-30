const bcrypt = require("bcrypt");
const User = require("../Models/User");

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

/**
 * GET: Forgot Password Placeholder
 */
const getForgotPassword = (req, res) => {
  req.flash(
    "error",
    "Password reset instructions sent to your email (if registered).",
  );
  res.redirect("/api/login");
};

/**
 * GET: Render Terms & Privacy Policy
 */
const getTermsPage = (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Terms & Privacy | Woofy</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; line-height: 1.6; padding: 3rem 1.5rem; }
        .container { max-width: 700px; margin: 0 auto; background: #ffffff; padding: 2.5rem; border-radius: 8px; border: 1px solid #e2e8f0; }
        h1 { color: #0f172a; margin-bottom: 1rem; }
        p { margin-bottom: 1rem; color: #64748b; }
        a { color: #2563eb; text-decoration: none; font-weight: 500; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Terms of Service & Privacy Policy</h1>
        <p>Welcome to Woofy! We provide health tracking, grooming logs, and pet care management tools for pet owners.</p>
        <p>By accessing or using Woofy, you agree to provide accurate information about your pets and respect all community safety standards.</p>
        <p>Your data is securely stored and used only to offer pet management functionality.</p>
        <div style="margin-top: 2rem;">
          <a href="/api/signup">&larr; Back to Signup</a> | <a href="/api/dashboard">Dashboard</a>
        </div>
      </div>
    </body>
    </html>
  `);
};

module.exports = {
  getSignupPage,
  postSignup,
  getLoginPage,
  postLogin,
  logout,
  getForgotPassword,
  getTermsPage,
};
