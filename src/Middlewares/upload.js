const multer = require("multer");
const path = require("node:path");
const fs = require("node:fs");

// Ensure directories exist
const uploadBase = path.join(__dirname, "..", "public", "uploads");
const petUploads = path.join(uploadBase, "pets");
const recordUploads = path.join(uploadBase, "records");
const galleryUploads = path.join(uploadBase, "gallery");
const hospitalUploads = path.join(uploadBase, "hospitals");
const productUploads = path.join(uploadBase, "products");
const rescueUploads = path.join(uploadBase, "rescue");

[
  uploadBase,
  petUploads,
  recordUploads,
  galleryUploads,
  hospitalUploads,
  productUploads,
  rescueUploads,
].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "petImage") {
      cb(null, petUploads);
    } else if (file.fieldname === "galleryImages") {
      cb(null, galleryUploads);
    } else if (file.fieldname === "recordImage") {
      cb(null, recordUploads);
    } else if (file.fieldname === "hospitalImage") {
      cb(null, hospitalUploads);
    } else if (file.fieldname === "productImage") {
      cb(null, productUploads);
    } else if (file.fieldname === "rescueImage") {
      cb(null, rescueUploads);
    } else {
      cb(null, uploadBase);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPG, PNG, WEBP, GIF) are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = upload;
