async function isAuthenticated(req, res, next) {
  console.log("User id from Middleware:", req.session.userId);
  if (req.session.userId) {
    return next();
  }
  res.redirect("/api/login");
}

module.exports = isAuthenticated;
