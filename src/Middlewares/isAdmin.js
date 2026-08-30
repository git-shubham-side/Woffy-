const User = require("../Models/User");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "rathodshubham7711@gmail.com").toLowerCase().trim();

/**
 * Middleware: Verify user is authenticated and has Administrator privileges
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      req.flash("error", "Please log in to access the Admin Portal.");
      return res.redirect("/api/login");
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      delete req.session.userId;
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
      res.locals.isAdminUser = true;
      return next();
    }

    req.flash(
      "error",
      "Access denied. The Admin Portal is restricted to authorized company administrators.",
    );
    return res.redirect("/api/dashboard");
  } catch (err) {
    console.error("Admin authorization error:", err);
    req.flash("error", "Authorization failed. Please try again.");
    return res.redirect("/api/dashboard");
  }
};

module.exports = isAdmin;
