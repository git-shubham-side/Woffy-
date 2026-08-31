const cloudinary = require("cloudinary").v2;

const sanitize = (val) =>
  val ? String(val).replace(/^["']+|["']+$/g, "").trim() : "";

const cloudName = sanitize(process.env.CLOUDINARY_CLOUD_NAME);
const apiKey = sanitize(process.env.CLOUDINARY_API_KEY);
const apiSecret = sanitize(process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

const isCloudinaryConfigured = () => {
  return !!(cloudName && apiKey && apiSecret);
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
};
