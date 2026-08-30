async function isAuthenticated(req, res, next) {
  // console.log("User id from Middleware:", req.session.userId);
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash("error", "Please log in to access this page.");
  res.redirect("/api/login");
}

module.exports = isAuthenticated;
