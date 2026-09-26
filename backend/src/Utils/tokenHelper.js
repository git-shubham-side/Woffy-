const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "woffy_jwt_secret_key_2026_super_secure";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generate a JWT token for a user
 * @param {Object} user 
 * @returns {String}
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role || "user",
      isAdmin: user.isAdmin || false,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Verify a JWT token
 * @param {String} token 
 * @returns {Object|null}
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
