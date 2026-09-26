const User = require("../Models/User");
const { verifyToken } = require("../Utils/tokenHelper");

/**
 * Flexible authentication middleware supporting both JWT Bearer tokens and Session cookies
 */
async function isAuthenticated(req, res, next) {
  try {
    let userId = null;

    // 1. Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        userId = decoded.id;
      }
    }

    // 2. Check Session
    if (!userId && req.session && req.session.userId) {
      userId = req.session.userId;
    }

    if (userId) {
      const user = await User.findById(userId).select("-password");
      if (user) {
        req.user = user;
        req.userId = user._id.toString();
        // Also keep req.session.userId synchronized if session exists
        if (req.session) {
          req.session.userId = user._id.toString();
        }
        res.locals.currentUser = user;
        res.locals.userId = user._id.toString();
        return next();
      }
    }

    // If request wants JSON (API request from React frontend, mobile, or curl)
    const wantsJson =
      req.xhr ||
      (req.headers.accept && req.headers.accept.includes("application/json")) ||
      req.path.startsWith("/api") ||
      req.originalUrl.startsWith("/api");

    if (wantsJson) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in to continue.",
      });
    }

    // Fallback for browser page navigation
    if (req.flash) {
      req.flash("error", "Please log in to access this page.");
    }
    return res.redirect("/api/login");
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({
      success: false,
      message: "Authentication verification failed.",
    });
  }
}

module.exports = isAuthenticated;
