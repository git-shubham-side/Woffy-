/**
 * GET: Render Landing Page
 */
const getLandingPage = (req, res) => {
  res.render("Landing/index");
};

/**
 * GET: Health check endpoint
 */
const getHealthCheck = (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
};

/**
 * GET: Services & Shop Redirect to Dashboard
 */
const getServicesRedirect = (req, res) => {
  res.redirect("/api/dashboard");
};

/**
 * 404 Route Not Found Middleware
 */
const notFoundHandler = (req, res) => {
  res.status(404).render("Route-Not-Found/route-not-found");
};

/**
 * Global Error Handler Middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error("Global application error:", err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
};

module.exports = {
  getLandingPage,
  getHealthCheck,
  getServicesRedirect,
  notFoundHandler,
  globalErrorHandler,
};
