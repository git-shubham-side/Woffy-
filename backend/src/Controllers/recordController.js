const Pet = require("../Models/Pet");
const Record = require("../Models/Record");

const isApiRequest = (req) => {
  return (
    req.xhr ||
    (req.headers.accept && req.headers.accept.includes("application/json")) ||
    (req.headers["content-type"] && req.headers["content-type"].includes("application/json")) ||
    Boolean(req.headers.authorization) ||
    req.originalUrl.includes("/api/")
  );
};

const getUserId = (req) => req.userId || (req.session && req.session.userId);

/**
 * GET: Select Pet For Activity Tracking
 */
const getSelectPetForTracking = async (req, res) => {
  try {
    const userId = getUserId(req);
    const pets = await Pet.find({ user: userId }).sort({ createdAt: -1 });

    if (isApiRequest(req)) {
      return res.status(200).json({ success: true, pets: pets || [] });
    }

    res.render("Select-pets-for-tracking/pet-tracking", { pets: pets || [] });
  } catch (err) {
    console.error("Select pet tracking error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Error loading pets." });
    res.render("Select-pets-for-tracking/pet-tracking", { pets: [] });
  }
};

/**
 * GET: Track Activity Form & Recent Logs for Pet
 */
const getTrackPage = async (req, res) => {
  try {
    const userId = getUserId(req);
    let petId = req.params.petId;
    let pet = null;

    if (petId && petId !== "petId") {
      pet = await Pet.findOne({ _id: petId, user: userId });
    }

    if (!pet) {
      pet = await Pet.findOne({ user: userId }).sort({ createdAt: -1 });
    }

    if (!pet) {
      if (isApiRequest(req)) {
        return res.status(200).json({ success: true, pet: null, records: [] });
      }
      req.flash("error", "Please create a pet profile first to begin tracking activities.");
      return res.redirect("/api/create-pet-profile");
    }

    const records = await Record.find({
      pet: pet._id,
      user: userId,
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(20);

    if (isApiRequest(req)) {
      return res.status(200).json({ success: true, pet, records: records || [] });
    }

    res.render("Track-Record-Form/track-record-form", {
      pet,
      records: records || [],
    });
  } catch (err) {
    console.error("Track activity page error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Error loading track page." });
    req.flash("error", "Error loading tracking page.");
    res.redirect("/api/select-pet-for-tracking");
  }
};

/**
 * POST: Create Activity / Care Log
 */
const postCreateRecord = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { petId, activityType, category, title, date, notes, details } = req.body;
    const finalType = activityType || category;
    const finalNotes = notes || details || "";

    let pet = null;
    if (petId) {
      pet = await Pet.findOne({ _id: petId, user: userId });
    }
    if (!pet) {
      pet = await Pet.findOne({ user: userId }).sort({ createdAt: -1 });
    }

    if (!pet) {
      if (isApiRequest(req)) return res.status(404).json({ success: false, message: "Please select a valid pet." });
      req.flash("error", "Please select a valid pet before creating a log.");
      return res.redirect("/api/pet-profiles");
    }

    if (!title || !finalType) {
      if (isApiRequest(req)) return res.status(400).json({ success: false, message: "Activity type and title are required." });
      req.flash("error", "Activity type and title are required.");
      return res.redirect(`/api/track/${pet._id}`);
    }

    let recordImage = "";
    if (req.file) {
      recordImage =
        req.file.path && req.file.path.startsWith("http")
          ? req.file.path
          : "/uploads/records/" + req.file.filename;
    }

    const newRecord = await Record.create({
      pet: pet._id,
      user: userId,
      activityType: finalType,
      title: title.trim(),
      date: date ? new Date(date) : new Date(),
      notes: finalNotes.trim(),
      image: recordImage,
    });

    // Auto-update pet weight if a weight check is logged
    if (finalType === "weight") {
      const numericWeight = parseFloat(title.replace(/[^0-9.]/g, ""));
      if (!isNaN(numericWeight) && numericWeight > 0) {
        pet.weight = numericWeight;
        await pet.save();
      }
    }

    if (isApiRequest(req)) {
      return res.status(201).json({
        success: true,
        message: "Activity log saved successfully!",
        record: newRecord,
        pet,
      });
    }

    req.flash("success", "Activity log saved successfully!");
    res.redirect(`/api/track/${pet._id}`);
  } catch (err) {
    console.error("Create tracking record error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Failed to save tracking log: " + (err.message || "") });
    req.flash("error", "Failed to save tracking log. " + (err.message || ""));
    res.redirect("/api/select-pet-for-tracking");
  }
};

/**
 * GET: Select Pet to Show Full Records
 */
const getSelectPetForRecords = async (req, res) => {
  try {
    const userId = getUserId(req);
    const pets = await Pet.find({ user: userId }).sort({ createdAt: -1 });

    if (isApiRequest(req)) return res.status(200).json({ success: true, pets: pets || [] });
    res.render("Select-Pet-to-show-Record/select-pet-to-show-record", { pets: pets || [] });
  } catch (err) {
    console.error("Select pet show record error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Error loading pets." });
    res.render("Select-Pet-to-show-Record/select-pet-to-show-record", { pets: [] });
  }
};

/**
 * GET: View Complete History / Records for Single Pet
 */
const getViewRecordsPage = async (req, res) => {
  try {
    const userId = getUserId(req);
    let petId = req.params.petId;
    let pet = null;

    if (petId && petId !== "petID") {
      pet = await Pet.findOne({ _id: petId, user: userId });
    }

    if (!pet) {
      pet = await Pet.findOne({ user: userId }).sort({ createdAt: -1 });
    }

    if (!pet) {
      if (isApiRequest(req)) {
        return res.status(200).json({ success: true, pet: null, records: [] });
      }
      req.flash("error", "Please add a pet first to view care and health records.");
      return res.redirect("/api/create-pet-profile");
    }

    const records = await Record.find({
      pet: pet._id,
      user: userId,
    }).sort({ date: -1, createdAt: -1 });

    if (isApiRequest(req)) {
      return res.status(200).json({ success: true, pet, records: records || [] });
    }

    res.render("View-Record-Pet/view-record", {
      pet,
      records: records || [],
    });
  } catch (err) {
    console.error("Show records error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Error loading pet records." });
    req.flash("error", "Error loading pet records.");
    res.redirect("/api/select-pet-to-show-record");
  }
};

/**
 * POST / DELETE: Delete a Single Record
 */
const deleteRecord = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { recordId } = req.params;
    const { petId } = req.body;

    await Record.findOneAndDelete({
      _id: recordId,
      user: userId,
    });

    if (isApiRequest(req)) {
      return res.status(200).json({ success: true, message: "Activity log deleted successfully." });
    }

    req.flash("success", "Activity log deleted successfully.");
    if (petId) {
      return res.redirect(`/api/show-records/${petId}`);
    }
    res.redirect("/api/select-pet-to-show-record");
  } catch (err) {
    console.error("Delete record error:", err);
    if (isApiRequest(req)) return res.status(500).json({ success: false, message: "Failed to delete record." });
    req.flash("error", "Failed to delete record.");
    res.redirect("/api/select-pet-to-show-record");
  }
};

module.exports = {
  getSelectPetForTracking,
  getTrackPage,
  postCreateRecord,
  getSelectPetForRecords,
  getViewRecordsPage,
  deleteRecord,
};
