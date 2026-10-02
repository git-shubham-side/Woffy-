/**
 * RAG Retriever & Augmentation Service for Jimmy AI
 * Retrieves real-time data from:
 * 1. User Account (Profile, Pets, Vaccinations, Health Records)
 * 2. Woffy Platform Data (Pet Shop Products, Rescue Directory, Hospitals, Feature Routes)
 */

const mongoose = require("mongoose");
const User = require("../Models/User");
const Pet = require("../Models/Pet");
const Vaccination = require("../Models/Vaccination");
const Record = require("../Models/Record");
const Product = require("../Models/Product");
const Hospital = require("../Models/Hospital");
const RescueService = require("../Models/RescueService");

const isDatabaseReady = () => mongoose.connection && mongoose.connection.readyState === 1;

// Comprehensive Platform Feature & Route Knowledge Map
const PLATFORM_ROUTES_MAP = [
  {
    feature: "Pet Profiles",
    route: "/pet-profiles",
    description: "View, manage, edit all registered pets, and view their individual health cards.",
  },
  {
    feature: "Add New Pet",
    route: "/create-pet-profile",
    description: "Register a new dog/pet profile with breed, age, weight, allergies, and photos.",
  },
  {
    feature: "Smart QR Collar Tag & Lost Pet Switch",
    route: "/pet-profiles",
    description: "Download printable collar tags and QR code wallet cards. 1-click toggle to mark a dog as lost with emergency contact and reward.",
  },
  {
    feature: "Vaccinations & Digital Vaccine Passport",
    route: "/vaccinations",
    description: "Track upcoming, due, and completed vaccines (Rabies, DHPP, etc.) and generate/download a verified digital vaccine passport.",
  },
  {
    feature: "Daily Health Tracking Records",
    route: "/records",
    description: "Log daily weight tracking, medical notes, medication schedules, vet visits, and grooming/bath records.",
  },
  {
    feature: "Rescue & Shelter Directory",
    route: "/services/rescue",
    description: "Find verified animal shelters, NGOs, stray dog emergency helplines, and animal ambulances.",
  },
  {
    feature: "Pet Essentials Shop",
    route: "/shop",
    description: "Browse and order curated dog food, grooming kits, toys, healthcare products, and accessories.",
  },
  {
    feature: "User Profile Settings",
    route: "/settings",
    description: "Update account profile, change password, manage notifications, and view emergency contacts.",
  },
  {
    feature: "Dashboard Overview",
    route: "/dashboard",
    description: "Quick summary of all pets, urgent vaccine alerts, recent health logs, and quick actions.",
  },
];

// Fallback in-memory platform data if database is still connecting
const FALLBACK_PRODUCTS = [
  {
    name: "Royal Canin Maxi Adult Dog Food (4kg)",
    category: "Food",
    brandName: "Royal Canin",
    price: 2850,
    originalPrice: 3200,
    discountPercent: 11,
    rating: 4.9,
    description: "Optimal digestive security and joint support for large breed dogs.",
    inStock: true,
  },
  {
    name: "Pedigree Pro Expert Nutrition for Active Dogs (3kg)",
    category: "Food",
    brandName: "Pedigree",
    price: 1399,
    originalPrice: 1550,
    discountPercent: 10,
    rating: 4.8,
    description: "High protein blend with essential minerals for energetic dogs.",
    inStock: true,
  },
  {
    name: "Anti-Tick & Flea Organic Neem Dog Shampoo (250ml)",
    category: "Grooming",
    brandName: "Woffy Care",
    price: 399,
    originalPrice: 499,
    discountPercent: 20,
    rating: 4.9,
    description: "Natural herbal neem formula that soothes itchy skin and eliminates ticks.",
    inStock: true,
  },
  {
    name: "Indestructible Natural Rubber Chew Bone",
    category: "Toys",
    brandName: "KONG Style",
    price: 349,
    originalPrice: 450,
    discountPercent: 22,
    rating: 4.7,
    description: "Durable non-toxic teething chew toy for aggressive chewers.",
    inStock: true,
  },
  {
    name: "Reflective Padded Dog Harness & Heavy-Duty Leash",
    category: "Accessories",
    brandName: "Woffy Safe",
    price: 699,
    originalPrice: 899,
    discountPercent: 22,
    rating: 4.9,
    description: "Escape-proof breathable mesh harness with night-visibility reflective bands.",
    inStock: true,
  }
];

const FALLBACK_HOSPITALS = [
  {
    name: "Crown Vet 24/7 Animal Hospital",
    city: "Mumbai & Pune",
    phone: "+91 98201 11222",
    emergencyPhone: "+91 98201 99999",
    is24x7: true,
    rating: 4.9,
    address: "Bandra West, Mumbai / Koregaon Park, Pune",
    services: ["24/7 Emergency", "Critical Care & ICU", "Surgery", "Digital X-Ray"],
  },
  {
    name: "Woffy Partner Veterinary Clinic & Trauma Center",
    city: "Metro Partner",
    phone: "+91 98200 88771",
    emergencyPhone: "+91 98200 88770",
    is24x7: true,
    rating: 4.8,
    address: "Central Metro Hub, Near Main Animal Hospital",
    services: ["OPD Consultation", "Vaccination", "Diagnostics", "Emergency First Aid"],
  }
];

const FALLBACK_RESCUES = [
  {
    name: "Animals Matter To Me (AMTM) Emergency Rescue",
    orgType: "NGO & Sanctuary",
    city: "Mumbai / Thane",
    phone: "+91 99677 95660",
    emergencyHelpline: "+91 99677 95660",
    is24x7: true,
    address: "Chikuwadi Road, Malad West, Mumbai",
    services: ["24/7 Stray Animal Rescue", "Animal Ambulance", "Medical Treatment"],
  },
  {
    name: "Welfare of Stray Dogs (WSD)",
    orgType: "Stray Rescue & Vaccination",
    city: "Mumbai",
    phone: "+91 89760 22838",
    emergencyHelpline: "+91 89760 22838",
    is24x7: false,
    address: "Fort, South Mumbai",
    services: ["Anti-Rabies Drive", "Stray Dog Sterilization", "Emergency First Aid"],
  }
];

/**
 * Retrieve user's personal account data:
 * - User Profile
 * - All Registered Pets
 * - Pending/Upcoming Vaccinations
 * - Recent Health Tracking Records
 */
async function retrieveUserAccountContext(userId, selectedPetId = null) {
  if (!userId) {
    return {
      isAuthenticated: false,
      user: null,
      pets: [],
      selectedPet: null,
      vaccinations: [],
      records: [],
      summaryText: "User is currently browsing as a guest (Not logged in).",
    };
  }

  if (!isDatabaseReady()) {
    return {
      isAuthenticated: true,
      user: { fullName: "User", email: "" },
      pets: [],
      selectedPet: null,
      vaccinations: [],
      records: [],
      summaryText: "Database connection initializing.",
    };
  }

  try {
    // 1. Fetch User Profile
    const user = await User.findById(userId)
      .select("fullName email phone role isAdmin createdAt")
      .maxTimeMS(2500)
      .lean();

    if (!user) {
      return {
        isAuthenticated: false,
        user: null,
        pets: [],
        selectedPet: null,
        vaccinations: [],
        records: [],
        summaryText: "User not found in database.",
      };
    }

    // 2. Fetch User's Pets
    const pets = await Pet.find({ user: userId })
      .select(
        "petName species breed dob age weight gender vaccinated photoUrl collarId allergies medicalAlerts isLost lostMessage rewardAmount notes createdAt"
      )
      .maxTimeMS(2500)
      .lean();

    // Determine targeted pet if specified or default to first pet
    let selectedPet = null;
    if (selectedPetId && pets.length > 0) {
      selectedPet = pets.find((p) => p._id.toString() === selectedPetId.toString()) || pets[0];
    } else if (pets.length > 0) {
      selectedPet = pets[0];
    }

    // 3. Fetch Vaccinations for user's pets
    const vaccinations = await Vaccination.find({ user: userId })
      .populate("pet", "petName breed")
      .sort({ dueDate: 1 })
      .limit(10)
      .maxTimeMS(2500)
      .lean();

    // 4. Fetch Recent Health Records
    const records = await Record.find({ user: userId })
      .populate("pet", "petName")
      .sort({ date: -1 })
      .limit(8)
      .maxTimeMS(2500)
      .lean();

    // Build structured text summary for LLM context
    let accountSummary = `USER ACCOUNT PROFILE:\n`;
    accountSummary += `- Name: ${user.fullName}\n- Email: ${user.email}\n- Role: ${user.role || 'User'}\n`;
    accountSummary += `- Total Pets Registered: ${pets.length}\n\n`;

    if (pets.length > 0) {
      accountSummary += `REGISTERED PETS:\n`;
      pets.forEach((p, idx) => {
        accountSummary += `${idx + 1}. ${p.petName} (${p.species || 'Dog'} - ${p.breed || 'Unknown Breed'})\n`;
        accountSummary += `   - Age: ${p.age || 'N/A'} yrs | Weight: ${p.weight || 'N/A'} kg | Gender: ${p.gender || 'Unknown'}\n`;
        accountSummary += `   - Vaccination Status: ${p.vaccinated || 'Yes'}\n`;
        accountSummary += `   - Allergies: ${p.allergies || 'None recorded'}\n`;
        accountSummary += `   - Medical Alerts: ${p.medicalAlerts || 'None recorded'}\n`;
        accountSummary += `   - Collar Tag ID: ${p.collarId || 'Not assigned yet'}\n`;
        accountSummary += `   - Lost Status: ${p.isLost ? `🚨 CURRENTLY MARKED AS LOST! (Reward: ${p.rewardAmount || 'N/A'})` : 'Safe at home'}\n`;
        if (p.notes) accountSummary += `   - Notes: ${p.notes}\n`;
      });
      accountSummary += `\n`;
    } else {
      accountSummary += `No pets registered yet in this account. Suggest visiting /create-pet-profile to register their dog!\n\n`;
    }

    if (vaccinations.length > 0) {
      accountSummary += `PET VACCINATIONS SCHEDULE:\n`;
      vaccinations.forEach((v) => {
        const petName = v.pet?.petName || 'Pet';
        const formattedDate = v.dueDate ? new Date(v.dueDate).toLocaleDateString('en-GB') : 'Unknown';
        accountSummary += `- [${v.status}] ${v.vaccineName} for ${petName} (Due Date: ${formattedDate}, Category: ${v.category})\n`;
      });
      accountSummary += `\n`;
    }

    if (records.length > 0) {
      accountSummary += `RECENT HEALTH & ACTIVITY LOGS:\n`;
      records.forEach((r) => {
        const petName = r.pet?.petName || 'Pet';
        const formattedDate = r.date ? new Date(r.date).toLocaleDateString('en-GB') : '';
        accountSummary += `- [${r.activityType}] ${r.title} for ${petName} on ${formattedDate} ${r.notes ? `(${r.notes})` : ''}\n`;
      });
      accountSummary += `\n`;
    }

    return {
      isAuthenticated: true,
      user,
      pets,
      selectedPet,
      vaccinations,
      records,
      summaryText: accountSummary,
    };
  } catch (error) {
    console.error("Error retrieving user account context:", error.message);
    return {
      isAuthenticated: false,
      user: null,
      pets: [],
      selectedPet: null,
      vaccinations: [],
      records: [],
      summaryText: "User account context query encountered an error.",
    };
  }
}

/**
 * Retrieve relevant Woffy Platform Data based on semantic query:
 * - Shop Products (Food, Grooming, Healthcare, Toys)
 * - Animal Hospitals & 24x7 Emergency Clinics
 * - Rescue Shelters & Stray Helplines
 * - Navigation links
 */
async function retrievePlatformContext(query) {
  const clean = (query || "").toLowerCase();
  let platformSummary = `WOFFY PLATFORM CAPABILITIES & NAVIGATION:\n`;

  PLATFORM_ROUTES_MAP.forEach((r) => {
    platformSummary += `- ${r.feature} (${r.route}): ${r.description}\n`;
  });
  platformSummary += `\n`;

  const retrievedData = {
    products: [],
    hospitals: [],
    rescues: [],
  };

  const shopKeywords = ["shop", "buy", "product", "food", "kibble", "toy", "leash", "collar", "shampoo", "treat", "price", "kharid", "saaman"];
  const matchesShop = shopKeywords.some((kw) => clean.includes(kw));

  const hospitalKeywords = ["hospital", "clinic", "doctor", "vet", "ill", "emergency clinic", "doctor ko dikhana", "opd"];
  const matchesHospital = hospitalKeywords.some((kw) => clean.includes(kw));

  const rescueKeywords = ["rescue", "shelter", "ngo", "ambulance", "stray", "injured", "sadak", "madad", "helpline"];
  const matchesRescue = rescueKeywords.some((kw) => clean.includes(kw));

  if (!isDatabaseReady()) {
    // When DB is offline/buffering, provide instant fallback platform data
    if (matchesShop) retrievedData.products = FALLBACK_PRODUCTS;
    if (matchesHospital) retrievedData.hospitals = FALLBACK_HOSPITALS;
    if (matchesRescue) retrievedData.rescues = FALLBACK_RESCUES;
    return { platformSummary, retrievedData };
  }

  try {
    // 1. Fetch Shop Products
    if (matchesShop) {
      let productFilter = { status: "approved", inStock: true };
      if (clean.includes("food") || clean.includes("khana")) productFilter.category = "Food";
      else if (clean.includes("groom") || clean.includes("shampoo")) productFilter.category = "Grooming";
      else if (clean.includes("toy") || clean.includes("khel")) productFilter.category = "Toys";
      else if (clean.includes("health") || clean.includes("medicine")) productFilter.category = "Healthcare";

      const products = await Product.find(productFilter)
        .select("name category brandName price originalPrice discountPercent rating buyUrl description inStock")
        .sort({ rating: -1, isFeatured: -1 })
        .limit(6)
        .maxTimeMS(2500)
        .lean();

      retrievedData.products = products.length > 0 ? products : FALLBACK_PRODUCTS;
    }

    // 2. Fetch Hospitals
    if (matchesHospital) {
      const hospitals = await Hospital.find({ status: "approved" })
        .select("name address city phone emergencyPhone services is24x7 rating")
        .sort({ is24x7: -1, rating: -1 })
        .limit(5)
        .maxTimeMS(2500)
        .lean();

      retrievedData.hospitals = hospitals.length > 0 ? hospitals : FALLBACK_HOSPITALS;
    }

    // 3. Fetch Rescues
    if (matchesRescue) {
      const rescues = await RescueService.find({ isVerified: true })
        .select("name orgType city phone emergencyHelpline services is24x7 address")
        .sort({ is24x7: -1 })
        .limit(5)
        .maxTimeMS(2500)
        .lean();

      retrievedData.rescues = rescues.length > 0 ? rescues : FALLBACK_RESCUES;
    }
  } catch (err) {
    console.warn("Database platform query fallback:", err.message);
    if (matchesShop) retrievedData.products = FALLBACK_PRODUCTS;
    if (matchesHospital) retrievedData.hospitals = FALLBACK_HOSPITALS;
    if (matchesRescue) retrievedData.rescues = FALLBACK_RESCUES;
  }

  // Append retrieved platform items to summary
  if (retrievedData.products.length > 0) {
    platformSummary += `RETRIEVED WOFFY SHOP PRODUCTS:\n`;
    retrievedData.products.forEach((p) => {
      platformSummary += `- ${p.name} (${p.category}) by ${p.brandName || 'Woffy'} | Price: ₹${p.price} | Rating: ⭐${p.rating} | Route: /shop\n`;
    });
    platformSummary += `\n`;
  }

  if (retrievedData.hospitals.length > 0) {
    platformSummary += `RETRIEVED APPROVED VET HOSPITALS:\n`;
    retrievedData.hospitals.forEach((h) => {
      platformSummary += `- ${h.name} (${h.city}) | Phone: ${h.phone} | 24x7: ${h.is24x7 ? 'YES' : 'No'} | Address: ${h.address}\n`;
    });
    platformSummary += `\n`;
  }

  if (retrievedData.rescues.length > 0) {
    platformSummary += `RETRIEVED ANIMAL RESCUES & SHELTERS:\n`;
    retrievedData.rescues.forEach((r) => {
      platformSummary += `- ${r.name} (${r.orgType} - ${r.city}) | Helpline: ${r.emergencyHelpline || r.phone} | 24x7: ${r.is24x7 ? 'YES' : 'No'}\n`;
    });
    platformSummary += `\n`;
  }

  return {
    platformSummary,
    retrievedData,
  };
}

/**
 * Build the complete RAG prompt augmented with user account & platform knowledge
 */
function buildRagPrompt(userMessage, accountContext, platformContext) {
  return `=== REAL-TIME RETRIEVED CONTEXT (RAG PIPELINE) ===

[USER ACCOUNT CONTEXT]
${accountContext.summaryText}

[WOFFY PLATFORM CONTEXT]
${platformContext.platformSummary}

=== END OF RETRIEVED CONTEXT ===

USER QUESTION: "${userMessage}"

INSTRUCTIONS FOR GENERATION:
1. Ground your answers strictly in the retrieved data when the user asks about their account, their pets, vaccines, health records, products in the shop, or emergency rescue contacts.
2. If the user asks about their pet, refer to their real pet by name (e.g. "${accountContext.selectedPet?.petName || 'your pet'}") and its breed/details.
3. If they ask about vaccines, give the exact status from the retrieved schedule.
4. If they ask about products or services, refer directly to the retrieved items and prices.
5. If the user writes in Hindi or Hinglish, answer warmly and naturally in Hindi / Hinglish. If in English, answer in English.
6. Provide clear markdown bullet points, relevant emojis, and direct Woffy navigation paths (e.g. /vaccinations, /records, /shop).`;
}

module.exports = {
  PLATFORM_ROUTES_MAP,
  retrieveUserAccountContext,
  retrievePlatformContext,
  buildRagPrompt,
};
