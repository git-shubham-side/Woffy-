const Pet = require("../Models/Pet");
const User = require("../Models/User");
const Vaccination = require("../Models/Vaccination");
const {
  generateScheduleForPet,
  syncVaccinationStatuses,
} = require("../Utils/vaccineScheduleGenerator");
const { sendVaccinationReminderEmail } = require("../Utils/mailer");

/**
 * GET: Render Main Vaccination & Deworming Hub for Pet
 */
const getVaccinationsPage = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { petId } = req.params;
    const { tab = "all" } = req.query;

    const pets = await Pet.find({ user: userId }).sort({ createdAt: -1 });

    if (!pets || pets.length === 0) {
      req.flash(
        "error",
        "Please create a pet profile first to view and manage vaccination schedules.",
      );
      return res.redirect("/api/create-pet-profile");
    }

    let currentPet = null;
    if (petId && petId !== "petId") {
      currentPet = pets.find((p) => p._id.toString() === petId.toString());
    }
    if (!currentPet) {
      currentPet = pets[0];
    }

    // Fetch existing vaccinations for pet (do not force-generate sample records automatically)
    let vaccinations = await Vaccination.find({ pet: currentPet._id }).sort({
      dueDate: 1,
    });

    if (vaccinations && vaccinations.length > 0) {
      await syncVaccinationStatuses(currentPet._id);
      vaccinations = await Vaccination.find({ pet: currentPet._id }).sort({
        dueDate: 1,
      });
    } else {
      vaccinations = [];
    }

    // Calculate schedule metrics
    const totalCount = vaccinations.length;
    const completedCount = vaccinations.filter(
      (v) => v.status === "Completed",
    ).length;
    const dueSoonCount = vaccinations.filter(
      (v) => v.status === "Due Soon",
    ).length;
    const overdueCount = vaccinations.filter(
      (v) => v.status === "Overdue",
    ).length;
    const upcomingCount = vaccinations.filter(
      (v) => v.status === "Upcoming",
    ).length;
    const completionPercent =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Filter by active tab
    let filteredVaccinations = [...vaccinations];
    if (tab === "due") {
      filteredVaccinations = vaccinations.filter(
        (v) => v.status === "Due Soon" || v.status === "Overdue",
      );
    } else if (tab === "core") {
      filteredVaccinations = vaccinations.filter(
        (v) => v.category === "Core Vaccine" || v.category === "Booster",
      );
    } else if (tab === "deworming") {
      filteredVaccinations = vaccinations.filter(
        (v) => v.category === "Deworming",
      );
    } else if (tab === "completed") {
      filteredVaccinations = vaccinations.filter(
        (v) => v.status === "Completed",
      );
    }

    const nextDue = vaccinations.find(
      (v) => v.status === "Due Soon" || v.status === "Overdue" || v.status === "Upcoming",
    );

    res.render("Vaccinations/vaccinations", {
      pets,
      currentPet,
      vaccinations: filteredVaccinations,
      allVaccinations: vaccinations,
      activeTab: tab,
      stats: {
        totalCount,
        completedCount,
        dueSoonCount,
        overdueCount,
        upcomingCount,
        completionPercent,
        nextDue,
      },
    });
  } catch (err) {
    console.error("Vaccinations page error:", err);
    req.flash("error", "Error loading pet vaccination schedule.");
    res.redirect("/api/dashboard");
  }
};

/**
 * POST: Auto-Populate / Re-Sync Schedule For Pet (Explicit user trigger)
 */
const postGenerateSchedule = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.session.userId;

    const pet = await Pet.findOne({ _id: petId, user: userId });
    if (!pet) {
      req.flash("error", "Pet record not found.");
      return res.redirect("/api/pet-profiles");
    }

    await generateScheduleForPet(pet, userId, true);
    req.flash(
      "success",
      `Standard veterinary vaccination & deworming schedule for "${pet.petName}" generated successfully!`,
    );
    res.redirect(`/api/vaccinations/${pet._id}`);
  } catch (err) {
    console.error("Generate schedule error:", err);
    req.flash("error", "Failed to generate vaccination schedule.");
    res.redirect("/api/dashboard");
  }
};

/**
 * POST: Clear / Delete All Vaccinations For a Pet
 */
const postClearAllVaccinations = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.session.userId;

    await Vaccination.deleteMany({ pet: petId, user: userId });
    req.flash("success", "All vaccination & deworming entries cleared for this pet.");
    res.redirect(`/api/vaccinations/${petId}`);
  } catch (err) {
    console.error("Clear all vaccinations error:", err);
    req.flash("error", "Failed to clear vaccination entries.");
    res.redirect(`/api/vaccinations/${req.params.petId}`);
  }
};

/**
 * POST: Add Custom / Manual Vaccine or Deworming Log
 */
const postAddVaccine = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.session.userId;
    const {
      vaccineName,
      category,
      dueDate,
      administeredDate,
      status,
      clinicOrVetName,
      batchNumber,
      notes,
    } = req.body;

    if (!vaccineName || !dueDate) {
      req.flash("error", "Vaccine name and due date are required.");
      return res.redirect(`/api/vaccinations/${petId}`);
    }

    const pet = await Pet.findOne({ _id: petId, user: userId });
    if (!pet) {
      req.flash("error", "Pet profile not found.");
      return res.redirect("/api/pet-profiles");
    }

    let certificatePhoto = "";
    if (req.file) {
      certificatePhoto =
        req.file.path && req.file.path.startsWith("http")
          ? req.file.path
          : "/uploads/vaccines/" + req.file.filename;
    }

    const isCompleted = status === "Completed";
    const finalAdministeredDate = isCompleted
      ? administeredDate && administeredDate.trim() !== ""
        ? new Date(administeredDate)
        : new Date(dueDate)
      : null;

    await Vaccination.create({
      pet: pet._id,
      user: userId,
      vaccineName: vaccineName.trim(),
      category: category || "Custom",
      dueDate: new Date(dueDate),
      administeredDate: finalAdministeredDate,
      status: isCompleted ? "Completed" : "Upcoming",
      clinicOrVetName: clinicOrVetName ? clinicOrVetName.trim() : "",
      batchNumber: batchNumber ? batchNumber.trim() : "",
      certificateImage: certificatePhoto,
      notes: notes ? notes.trim() : "",
      isAutoGenerated: false,
    });

    await syncVaccinationStatuses(pet._id);

    req.flash("success", `Vaccination entry "${vaccineName}" added successfully!`);
    res.redirect(`/api/vaccinations/${pet._id}`);
  } catch (err) {
    console.error("Add custom vaccine error:", err);
    req.flash("error", "Failed to add vaccine entry: " + (err.message || ""));
    res.redirect(`/api/vaccinations/${req.params.petId}`);
  }
};

/**
 * POST: Mark Vaccine as Administered / Completed
 */
const postCompleteVaccine = async (req, res) => {
  try {
    const { vaccinationId } = req.params;
    const { petId, administeredDate, clinicOrVetName, batchNumber, notes } =
      req.body;

    const vaccination = await Vaccination.findOne({
      _id: vaccinationId,
      user: req.session.userId,
    });

    if (!vaccination) {
      req.flash("error", "Vaccination record not found.");
      return res.redirect("/api/dashboard");
    }

    let certificatePhoto = vaccination.certificateImage || "";
    if (req.file) {
      certificatePhoto =
        req.file.path && req.file.path.startsWith("http")
          ? req.file.path
          : "/uploads/vaccines/" + req.file.filename;
    }

    vaccination.status = "Completed";
    vaccination.administeredDate =
      administeredDate && administeredDate.trim() !== ""
        ? new Date(administeredDate)
        : new Date();
    if (clinicOrVetName) vaccination.clinicOrVetName = clinicOrVetName.trim();
    if (batchNumber) vaccination.batchNumber = batchNumber.trim();
    if (notes) vaccination.notes = notes.trim();
    if (certificatePhoto) vaccination.certificateImage = certificatePhoto;

    await vaccination.save();

    req.flash(
      "success",
      `🎉 Great job! "${vaccination.vaccineName}" recorded as completed with verification.`,
    );
    res.redirect(`/api/vaccinations/${petId || vaccination.pet}`);
  } catch (err) {
    console.error("Complete vaccine error:", err);
    req.flash("error", "Failed to record vaccine completion.");
    res.redirect(`/api/vaccinations/${req.body.petId || ""}`);
  }
};

/**
 * POST: Update / Reschedule a Vaccine Entry
 */
const postUpdateVaccine = async (req, res) => {
  try {
    const { vaccinationId } = req.params;
    const {
      petId,
      vaccineName,
      category,
      dueDate,
      administeredDate,
      status,
      clinicOrVetName,
      batchNumber,
      notes,
    } = req.body;

    const vaccination = await Vaccination.findOne({
      _id: vaccinationId,
      user: req.session.userId,
    });

    if (!vaccination) {
      req.flash("error", "Vaccination record not found.");
      return res.redirect(`/api/vaccinations/${petId}`);
    }

    if (vaccineName) vaccination.vaccineName = vaccineName.trim();
    if (category) vaccination.category = category;
    if (dueDate) vaccination.dueDate = new Date(dueDate);
    if (status) vaccination.status = status;
    if (status === "Completed") {
      vaccination.administeredDate =
        administeredDate && administeredDate.trim() !== ""
          ? new Date(administeredDate)
          : new Date(dueDate);
    } else {
      vaccination.administeredDate = null;
    }
    if (clinicOrVetName !== undefined)
      vaccination.clinicOrVetName = clinicOrVetName.trim();
    if (batchNumber !== undefined) vaccination.batchNumber = batchNumber.trim();
    if (notes !== undefined) vaccination.notes = notes.trim();

    if (req.file) {
      vaccination.certificateImage =
        req.file.path && req.file.path.startsWith("http")
          ? req.file.path
          : "/uploads/vaccines/" + req.file.filename;
    }

    await vaccination.save();
    await syncVaccinationStatuses(vaccination.pet);

    req.flash("success", "Vaccination schedule updated successfully.");
    res.redirect(`/api/vaccinations/${petId || vaccination.pet}`);
  } catch (err) {
    console.error("Update vaccine error:", err);
    req.flash("error", "Failed to update vaccination details.");
    res.redirect(`/api/vaccinations/${req.body.petId || ""}`);
  }
};

/**
 * POST: Delete Vaccine Entry
 */
const postDeleteVaccine = async (req, res) => {
  try {
    const { vaccinationId } = req.params;
    const { petId } = req.body;

    await Vaccination.findOneAndDelete({
      _id: vaccinationId,
      user: req.session.userId,
    });

    req.flash("success", "Vaccination dose entry removed from schedule.");
    res.redirect(`/api/vaccinations/${petId || ""}`);
  } catch (err) {
    console.error("Delete vaccine error:", err);
    req.flash("error", "Failed to delete vaccine entry.");
    res.redirect("/api/dashboard");
  }
};

/**
 * POST: Send Automated / Test Email Reminder to User
 */
const postSendReminderEmail = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.session.userId;

    const user = await User.findById(userId);
    const pet = await Pet.findOne({ _id: petId, user: userId });

    if (!user || !pet) {
      req.flash("error", "User or pet profile not found.");
      return res.redirect("/api/dashboard");
    }

    const pendingVaccines = await Vaccination.find({
      pet: pet._id,
      status: { $in: ["Due Soon", "Overdue", "Upcoming"] },
    })
      .sort({ dueDate: 1 })
      .limit(5);

    if (pendingVaccines.length === 0) {
      req.flash(
        "success",
        `All vaccinations are up to date for ${pet.petName}! No pending reminders right now.`,
      );
      return res.redirect(`/api/vaccinations/${pet._id}`);
    }

    await sendVaccinationReminderEmail({
      userEmail: user.email,
      userName: user.fullName,
      petName: pet.petName,
      petId: pet._id,
      vaccines: pendingVaccines,
    });

    req.flash(
      "success",
      `📧 Vaccination reminder email dispatched to ${user.email} for ${pet.petName}!`,
    );
    res.redirect(`/api/vaccinations/${pet._id}`);
  } catch (err) {
    console.error("Send reminder email error:", err);
    req.flash("error", "Failed to dispatch email reminder.");
    res.redirect(`/api/vaccinations/${req.params.petId}`);
  }
};

/**
 * GET: Render Printable Digital Vaccination Passport
 */
const getVaccinePassportPrint = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.session.userId;

    const user = await User.findById(userId);
    const pet = await Pet.findOne({ _id: petId, user: userId });

    if (!pet) {
      req.flash("error", "Pet profile not found.");
      return res.redirect("/api/pet-profiles");
    }

    const vaccinations = await Vaccination.find({ pet: pet._id }).sort({
      dueDate: 1,
    });

    res.render("Vaccinations/vaccine-passport", {
      pet,
      user,
      vaccinations,
    });
  } catch (err) {
    console.error("Print passport error:", err);
    req.flash("error", "Error generating vaccination passport.");
    res.redirect(`/api/vaccinations/${req.params.petId}`);
  }
};

module.exports = {
  getVaccinationsPage,
  postGenerateSchedule,
  postClearAllVaccinations,
  postAddVaccine,
  postCompleteVaccine,
  postUpdateVaccine,
  postDeleteVaccine,
  postSendReminderEmail,
  getVaccinePassportPrint,
};
