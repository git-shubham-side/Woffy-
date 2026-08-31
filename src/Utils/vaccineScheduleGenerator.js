const Vaccination = require("../Models/Vaccination");

/**
 * Standard Veterinary Vaccination & Deworming Protocols
 * Based on WSAVA (World Small Animal Veterinary Association) and Indian Veterinary Guidelines
 */
const CANINE_SCHEDULE = [
  // Deworming Cycles
  {
    name: "Deworming (Puppy Starter / Cycle 1)",
    category: "Deworming",
    weeks: 4,
    stage: "4 Weeks (1 Month)",
    notes: "Essential starter deworming to clear intestinal parasites passed from mother.",
  },
  {
    name: "Deworming (Cycle 2)",
    category: "Deworming",
    weeks: 8,
    stage: "8 Weeks (2 Months)",
    notes: "Second phase puppy deworming paired before core vaccination cycle.",
  },
  {
    name: "Deworming (Cycle 3)",
    category: "Deworming",
    weeks: 12,
    stage: "12 Weeks (3 Months)",
    notes: "Third phase puppy deworming for sustained protection.",
  },
  {
    name: "Deworming (Semi-Annual Cycle)",
    category: "Deworming",
    weeks: 24,
    stage: "6 Months (Juvenile)",
    notes: "Mid-year deworming cycle for growing adolescent dog.",
  },
  {
    name: "Annual / Quarterly Deworming",
    category: "Deworming",
    weeks: 52,
    stage: "12 Months (1 Year Adult)",
    notes: "Regular adult deworming cycle (repeat every 3-6 months).",
  },

  // Core Vaccines (Puppy Series)
  {
    name: "Puppy DP / DHPP (Primary Dose 1)",
    category: "Core Vaccine",
    weeks: 6,
    stage: "6 Weeks (Early Puppy)",
    notes: "Protects against Canine Distemper & Parvovirus (fatal puppy viral infections).",
  },
  {
    name: "DHPPi + Lepto (Dose 2 - 7-in-1 Combo)",
    category: "Core Vaccine",
    weeks: 10,
    stage: "10 Weeks (Dose 2)",
    notes: "7-in-1 Combo vaccine protecting Distemper, Hepatitis, Parvovirus, Parainfluenza & Leptospirosis.",
  },
  {
    name: "DHPPi + Lepto + Corona (Dose 3 - 9-in-1 Combo)",
    category: "Core Vaccine",
    weeks: 14,
    stage: "14 Weeks (Dose 3 Booster)",
    notes: "9-in-1 / MegaVac-9 complete puppy protection booster.",
  },
  {
    name: "Anti-Rabies Vaccine (ARV Primary Dose)",
    category: "Core Vaccine",
    weeks: 14,
    stage: "14 Weeks (Primary Rabies)",
    notes: "Legally mandated & lifesaving vaccine against Rabies virus transmission.",
  },
  {
    name: "Anti-Rabies Booster (ARV Dose 2)",
    category: "Core Vaccine",
    weeks: 18,
    stage: "18 Weeks (Rabies Booster)",
    notes: "Booster dose ensuring lifetime anti-rabies antibody titers.",
  },
  {
    name: "Kennel Cough / Bordetella Bronchiseptica",
    category: "Non-Core",
    weeks: 20,
    stage: "20 Weeks (Social Protection)",
    notes: "Highly recommended for dogs visiting parks, boarding kennels, or training centers.",
  },

  // Annual Adult Boosters
  {
    name: "Annual 9-in-1 Core Booster (MegaVac-9 / Nobivac)",
    category: "Booster",
    weeks: 52,
    stage: "12 Months (1 Year Booster)",
    notes: "Annual revaccination to sustain full immunity against all 9 major canine diseases.",
  },
  {
    name: "Annual Anti-Rabies Booster (ARV)",
    category: "Booster",
    weeks: 52,
    stage: "12 Months (1 Year Rabies)",
    notes: "Annual compulsory anti-rabies immunity booster.",
  },
];

const FELINE_SCHEDULE = [
  {
    name: "Deworming (Kitten Cycle 1)",
    category: "Deworming",
    weeks: 4,
    stage: "4 Weeks",
    notes: "Initial kitten parasite deworming.",
  },
  {
    name: "Deworming (Kitten Cycle 2)",
    category: "Deworming",
    weeks: 8,
    stage: "8 Weeks",
    notes: "Second phase kitten deworming.",
  },
  {
    name: "Tricat / FVRCP (Primary Dose 1)",
    category: "Core Vaccine",
    weeks: 8,
    stage: "8 Weeks",
    notes: "Protects against Feline Rhinotracheitis, Calicivirus, and Panleukopenia.",
  },
  {
    name: "Tricat / FVRCP (Dose 2 Booster)",
    category: "Core Vaccine",
    weeks: 12,
    stage: "12 Weeks",
    notes: "Second dose of core feline 3-in-1 combo.",
  },
  {
    name: "Anti-Rabies Vaccine (Cat ARV)",
    category: "Core Vaccine",
    weeks: 14,
    stage: "14 Weeks",
    notes: "Rabies immunization for cats.",
  },
  {
    name: "Annual FVRCP & Rabies Booster",
    category: "Booster",
    weeks: 52,
    stage: "12 Months (1 Year)",
    notes: "Annual booster to maintain antibody levels.",
  },
];

/**
 * Calculate due date given DOB and target age in weeks
 */
const calculateDueDate = (dob, ageInYears, targetWeeks) => {
  let baseTime;
  if (dob && !isNaN(new Date(dob).getTime())) {
    baseTime = new Date(dob).getTime();
  } else {
    const ageYears = ageInYears && !isNaN(parseFloat(ageInYears)) ? parseFloat(ageInYears) : 1;
    baseTime = Date.now() - ageYears * 365.25 * 24 * 60 * 60 * 1000;
  }
  return new Date(baseTime + targetWeeks * 7 * 24 * 60 * 60 * 1000);
};

/**
 * Automatically generates the complete standard schedule for a pet
 * @param {Object} pet - Pet Mongoose document or object
 * @param {string} userId - User's MongoDB ID
 * @param {boolean} forceReset - Whether to wipe and re-generate existing auto-generated records
 */
const generateScheduleForPet = async (pet, userId, forceReset = false) => {
  if (!pet || !pet._id) return [];

  const existingCount = await Vaccination.countDocuments({ pet: pet._id });
  if (existingCount > 0 && !forceReset) {
    // Schedule already exists, just refresh statuses
    await syncVaccinationStatuses(pet._id);
    return await Vaccination.find({ pet: pet._id }).sort({ dueDate: 1 });
  }

  if (forceReset) {
    await Vaccination.deleteMany({ pet: pet._id, isAutoGenerated: true });
  }

  const isCat = pet.species && pet.species.toLowerCase() === "cat";
  const templateSchedule = isCat ? FELINE_SCHEDULE : CANINE_SCHEDULE;
  const now = new Date();
  const fourteenDaysFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const docsToInsert = templateSchedule.map((item) => {
    const dueDate = calculateDueDate(pet.dob, pet.age, item.weeks);
    const isPastDue = dueDate < now;
    const isDueSoon = dueDate >= now && dueDate <= fourteenDaysFromNow;

    let status = "Upcoming";
    let administeredDate = null;
    let autoNotes = item.notes;

    // If pet was marked already vaccinated and vaccine was due in the past, mark as completed
    if (pet.vaccinated === "Yes" && isPastDue) {
      status = "Completed";
      administeredDate = dueDate;
      autoNotes += " (Recorded as completed during pet registration)";
    } else if (isPastDue) {
      status = "Overdue";
    } else if (isDueSoon) {
      status = "Due Soon";
    }

    return {
      pet: pet._id,
      user: userId || pet.user,
      vaccineName: item.name,
      category: item.category,
      targetAgeWeeks: item.weeks,
      targetStageDescription: item.stage,
      dueDate: dueDate,
      administeredDate: administeredDate,
      status: status,
      notes: autoNotes,
      isAutoGenerated: true,
      clinicOrVetName: status === "Completed" ? "Registered Vet Clinic" : "",
    };
  });

  const createdVaccinations = await Vaccination.insertMany(docsToInsert);
  return createdVaccinations;
};

/**
 * Dynamic sync: Refresh status of all non-completed vaccines for a pet based on current real-time date
 */
const syncVaccinationStatuses = async (petId) => {
  if (!petId) return;
  const now = new Date();
  const fourteenDaysFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const nonCompletedVaccines = await Vaccination.find({
    pet: petId,
    status: { $nin: ["Completed", "Skipped"] },
  });

  for (const v of nonCompletedVaccines) {
    if (v.dueDate < now) {
      if (v.status !== "Overdue") {
        v.status = "Overdue";
        await v.save();
      }
    } else if (v.dueDate >= now && v.dueDate <= fourteenDaysFromNow) {
      if (v.status !== "Due Soon") {
        v.status = "Due Soon";
        await v.save();
      }
    } else {
      if (v.status !== "Upcoming") {
        v.status = "Upcoming";
        await v.save();
      }
    }
  }
};

/**
 * Get upcoming & overdue vaccines across all pets for a user
 * Used for Dashboard widgets, in-app notification badges & email reminders
 */
const getUpcomingVaccinesForUser = async (userId, daysAhead = 30) => {
  if (!userId) return { dueSoon: [], overdue: [], totalDueCount: 0 };

  const thresholdDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);

  const [dueSoon, overdue] = await Promise.all([
    Vaccination.find({
      user: userId,
      status: "Due Soon",
      dueDate: { $lte: thresholdDate },
    })
      .populate("pet", "petName species breed photo photoUrl")
      .sort({ dueDate: 1 }),
    Vaccination.find({
      user: userId,
      status: "Overdue",
    })
      .populate("pet", "petName species breed photo photoUrl")
      .sort({ dueDate: 1 }),
  ]);

  return {
    dueSoon,
    overdue,
    totalDueCount: dueSoon.length + overdue.length,
  };
};

module.exports = {
  CANINE_SCHEDULE,
  FELINE_SCHEDULE,
  calculateDueDate,
  generateScheduleForPet,
  syncVaccinationStatuses,
  getUpcomingVaccinesForUser,
};
