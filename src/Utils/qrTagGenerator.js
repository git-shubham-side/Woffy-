const QRCode = require("qrcode");
const crypto = require("node:crypto");

/**
 * Generate a short, unique, human-readable collar tag ID
 * @param {string} petName
 * @returns {string} e.g. WF-MAX-8921
 */
const generateCollarId = (petName) => {
  const cleanPrefix = (petName || "PET")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 4);
  const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `WF-${cleanPrefix}-${randomSuffix}`;
};

/**
 * Generate high-resolution DataURL QR Code for a Pet
 * @param {string} identifier - collarId or petId
 * @returns {Promise<string>} Base64 DataURL
 */
const generatePetQrCode = async (identifier) => {
  try {
    const appBaseUrl = process.env.BASE_URL || "https://woffy.up.railway.app";
    const publicUrl = `${appBaseUrl}/pet/tag/${identifier}`;

    const qrDataUrl = await QRCode.toDataURL(publicUrl, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 2,
      width: 400,
      color: {
        dark: "#0f172a", // Deep slate for high-contrast scanning
        light: "#ffffff",
      },
    });

    return qrDataUrl;
  } catch (error) {
    console.error("QR generation error:", error);
    return "";
  }
};

/**
 * Sync and ensure a pet has a valid collarId and QR Code DataURL
 * @param {Object} pet - Mongoose Pet Document
 * @returns {Promise<Object>} Updated pet document
 */
const syncPetQrCode = async (pet) => {
  let hasChanges = false;

  if (!pet.collarId || pet.collarId.trim() === "") {
    pet.collarId = generateCollarId(pet.petName);
    hasChanges = true;
  }

  if (!pet.qrCodeDataUrl || pet.qrCodeDataUrl.trim() === "" || hasChanges) {
    const qrDataUrl = await generatePetQrCode(pet.collarId || pet._id.toString());
    pet.qrCodeDataUrl = qrDataUrl;
    hasChanges = true;
  }

  if (hasChanges) {
    await pet.save();
  }

  return pet;
};

module.exports = {
  generateCollarId,
  generatePetQrCode,
  syncPetQrCode,
};
