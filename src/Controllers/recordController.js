const Pet = require("../Models/Pet");
const Record = require("../Models/Record");

/**
 * GET: Select Pet For Activity Tracking
 */
const getSelectPetForTracking = async (req, res) => {
  try {
    const pets = await Pet.find({ user: req.session.userId }).sort({
      createdAt: -1,
    });
    res.render("Select-pets-for-tracking/pet-tracking", { pets: pets || [] });
  } catch (err) {
    console.error("Select pet tracking error:", err);
    res.render("Select-pets-for-tracking/pet-tracking", { pets: [] });
  }
};

/**
 * GET: Track Activity Form & Recent Logs for Pet
 */
const getTrackPage = async (req, res) => {
  try {
    let petId = req.params.petId;
    let pet = null;

    if (petId && petId !== "petId") {
      pet = await Pet.findOne({ _id: petId, user: req.session.userId });
    }

    if (!pet) {
      pet = await Pet.findOne({ user: req.session.userId }).sort({
        createdAt: -1,
      });
    }

    if (!pet) {
      req.flash(
        "error",
        "Please create a pet profile first to begin tracking activities.",
      );
      return res.redirect("/api/create-pet-profile");
    }

    const records = await Record.find({
      pet: pet._id,
      user: req.session.userId,
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(10);

    res.render("Track-Record-Form/track-record-form", {
      pet,
      records: records || [],
    });
  } catch (err) {
    console.error("Track activity page error:", err);
    req.flash("error", "Error loading tracking page.");
    res.redirect("/api/select-pet-for-tracking");
  }
};

/**
 * POST: Create Activity / Care Log (with optional photo / prescription attachment)
 */
const postCreateRecord = async (req, res) => {
  try {
    const { petId, activityType, category, title, date, notes, details } =
      req.body;
    const finalType = activityType || category;
    const finalNotes = notes || details || "";

    let pet = null;
    if (petId) {
      pet = await Pet.findOne({ _id: petId, user: req.session.userId });
    }
    if (!pet) {
      pet = await Pet.findOne({ user: req.session.userId }).sort({
        createdAt: -1,
      });
    }

    if (!pet) {
      req.flash("error", "Please select a valid pet before creating a log.");
      return res.redirect("/api/pet-profiles");
    }

    if (!title || !finalType) {
      req.flash("error", "Activity type and title are required.");
      return res.redirect(`/api/track/${pet._id}`);
    }

    let recordImage = "";
    if (req.file) {
      recordImage = "/uploads/records/" + req.file.filename;
    }

    await Record.create({
      pet: pet._id,
      user: req.session.userId,
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

    req.flash("success", "Activity log saved successfully!");
    res.redirect(`/api/track/${pet._id}`);
  } catch (err) {
    console.error("Create tracking record error:", err);
    req.flash("error", "Failed to save tracking log. " + (err.message || ""));
    res.redirect("/api/select-pet-for-tracking");
  }
};

/**
 * GET: Select Pet to Show Full Records
 */
const getSelectPetForRecords = async (req, res) => {
  try {
    const pets = await Pet.find({ user: req.session.userId }).sort({
      createdAt: -1,
    });
    res.render("Select-Pet-to-show-Record/select-pet-to-show-record", {
      pets: pets || [],
    });
  } catch (err) {
    console.error("Select pet show record error:", err);
    res.render("Select-Pet-to-show-Record/select-pet-to-show-record", {
      pets: [],
    });
  }
};

/**
 * GET: View Complete History / Records for Single Pet
 */
const getViewRecordsPage = async (req, res) => {
  try {
    let petId = req.params.petId;
    let pet = null;

    if (petId && petId !== "petID") {
      pet = await Pet.findOne({ _id: petId, user: req.session.userId });
    }

    if (!pet) {
      pet = await Pet.findOne({ user: req.session.userId }).sort({
        createdAt: -1,
      });
    }

    if (!pet) {
      req.flash(
        "error",
        "Please add a pet first to view care and health records.",
      );
      return res.redirect("/api/create-pet-profile");
    }

    const records = await Record.find({
      pet: pet._id,
      user: req.session.userId,
    }).sort({ date: -1, createdAt: -1 });

    res.render("View-Record-Pet/view-record", {
      pet,
      records: records || [],
    });
  } catch (err) {
    console.error("Show records error:", err);
    req.flash("error", "Error loading pet records.");
    res.redirect("/api/select-pet-to-show-record");
  }
};

/**
 * POST: Delete a Single Record
 */
const deleteRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { petId } = req.body;

    await Record.findOneAndDelete({
      _id: recordId,
      user: req.session.userId,
    });
    req.flash("success", "Activity log deleted successfully.");

    if (petId) {
      return res.redirect(`/api/show-records/${petId}`);
    }
    res.redirect("/api/select-pet-to-show-record");
  } catch (err) {
    console.error("Delete record error:", err);
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
