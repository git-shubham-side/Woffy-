const User = require("../Models/User");
const { verifyToken } = require("../Utils/tokenHelper");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "rathodshubham7711@gmail.com").toLowerCase().trim();

/**
 * Middleware: Verify user is authenticated and has Administrator privileges
 * Supports both JWT Bearer tokens and Session cookies
 */
const isAdmin = async (req, res, next) => {
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

    const wantsJson =
      req.xhr ||
      (req.headers.accept && req.headers.accept.includes("application/json")) ||
      req.path.startsWith("/api") ||
      req.originalUrl.startsWith("/api");

    if (!userId) {
      if (wantsJson) {
        return res.status(401).json({
          success: false,
          message: "Please log in to access the Admin Portal.",
        });
      }
      req.flash("error", "Please log in to access the Admin Portal.");
      return res.redirect("/api/login");
    }

    const user = await User.findById(userId);
    if (!user) {
      if (wantsJson) {
        return res.status(401).json({
          success: false,
          message: "User account not found. Please log in again.",
        });
      }
      if (req.session) delete req.session.userId;
      req.flash("error", "User session expired. Please log in.");
      return res.redirect("/api/login");
    }

    // Check if user is admin via flag, role, or matching ADMIN_EMAIL
    const isCompanyAdmin =
      user.isAdmin === true ||
      user.role === "admin" ||
      user.email.toLowerCase().trim() === ADMIN_EMAIL;

    if (isCompanyAdmin) {
      req.user = user;
      req.userId = user._id.toString();
      res.locals.isAdminUser = true;
      res.locals.currentUser = user;
      return next();
    }

    if (wantsJson) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Administrator privileges required.",
      });
    }

    req.flash(
      "error",
      "Access denied. The Admin Portal is restricted to authorized company administrators.",
    );
    return res.redirect("/api/dashboard");
  } catch (err) {
    console.error("Admin authorization error:", err);
    if (
      req.xhr ||
      (req.headers.accept && req.headers.accept.includes("application/json")) ||
      req.path.startsWith("/api")
    ) {
      return res.status(500).json({
        success: false,
        message: "Authorization check error.",
      });
    }
    req.flash("error", "Authorization failed. Please try again.");
    return res.redirect("/api/dashboard");
  }
};

module.exports = isAdmin;
