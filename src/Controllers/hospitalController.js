const Hospital = require("../Models/Hospital");
const { sendContactEmail } = require("../Utils/mailer");

/**
 * Calculate distance in Kilometers between two coordinates using Haversine formula
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

/**
 * Known Indian Major City Centroids for fallback GPS city matching
 */
const CITY_CENTROIDS = [
  { city: "Mumbai", lat: 19.076, lng: 72.8777 },
  { city: "Thane", lat: 19.2183, lng: 72.9781 },
  { city: "Navi Mumbai", lat: 19.033, lng: 73.0297 },
  { city: "Pune", lat: 18.5204, lng: 73.8567 },
  { city: "Delhi", lat: 28.6139, lng: 77.209 },
  { city: "Gurgaon", lat: 28.4595, lng: 77.0266 },
  { city: "Noida", lat: 28.5355, lng: 77.391 },
  { city: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { city: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { city: "Chennai", lat: 13.0827, lng: 80.2707 },
  { city: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { city: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { city: "Jaipur", lat: 26.9124, lng: 75.7873 },
];

/**
 * Find closest city from coordinates
 */
const findClosestCity = (lat, lng) => {
  if (!lat || !lng) return null;
  let closest = null;
  let minDistance = Infinity;

  CITY_CENTROIDS.forEach((c) => {
    const dist = calculateDistanceKm(lat, lng, c.lat, c.lng);
    if (dist !== null && dist < minDistance) {
      minDistance = dist;
      closest = { ...c, distance: dist };
    }
  });

  return closest;
};

/**
 * GET: Render Public Verified Hospitals Directory (Shows ONLY Approved/Verified Hospitals)
 */
const getHospitalsPage = async (req, res) => {
  try {
    let { city, search, is24x7, lat, lng, detectedCity } = req.query;

    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    if (userLat && userLng && (!city || city === "All" || city === "auto")) {
      const matchedCity = findClosestCity(userLat, userLng);
      if (matchedCity) {
        city = matchedCity.city;
        detectedCity = matchedCity.city;
      }
    }

    // Strictly query ONLY verified & approved hospitals for public listing
    const query = {
      isVerified: true,
      status: "approved",
    };

    if (city && city.trim() !== "" && city !== "All") {
      query.city = new RegExp(`^${city.trim()}$`, "i");
    }

    if (is24x7 === "true" || is24x7 === "1") {
      query.is24x7 = true;
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { address: searchRegex },
        { city: searchRegex },
        { services: searchRegex },
      ];
    }

    let hospitals = await Hospital.find(query).sort({ rating: -1, createdAt: -1 });

    // Attach calculated distance if user coordinates provided
    if (userLat && userLng && hospitals.length > 0) {
      hospitals = hospitals.map((h) => {
        const doc = h.toObject();
        if (doc.lat && doc.lng) {
          doc.distanceKm = calculateDistanceKm(
            userLat,
            userLng,
            doc.lat,
            doc.lng,
          );
        } else {
          doc.distanceKm = null;
        }
        return doc;
      });

      hospitals.sort((a, b) => {
        if (a.distanceKm !== null && b.distanceKm !== null) {
          return a.distanceKm - b.distanceKm;
        }
        if (a.distanceKm !== null) return -1;
        if (b.distanceKm !== null) return 1;
        return (b.rating || 0) - (a.rating || 0);
      });
    }

    // Distinct list of cities among approved hospitals + standard cities
    const distinctCities = await Hospital.distinct("city", {
      isVerified: true,
      status: "approved",
    });
    const defaultCities = [
      "Mumbai",
      "Pune",
      "Delhi",
      "Bengaluru",
      "Hyderabad",
      "Chennai",
      "Kolkata",
      "Ahmedabad",
      "Jaipur",
    ];
    const allCities = Array.from(
      new Set([...distinctCities, ...defaultCities]),
    ).sort();

    res.render("Hospitals/hospitals", {
      hospitals,
      cities: allCities,
      selectedCity: city || "All",
      detectedCity: detectedCity || null,
      searchQuery: search || "",
      is24x7Only: is24x7 === "true" || is24x7 === "1",
      userLat,
      userLng,
    });
  } catch (err) {
    console.error("Hospitals directory error:", err);
    req.flash("error", "Failed to load hospitals list.");
    res.render("Hospitals/hospitals", {
      hospitals: [],
      cities: ["Mumbai", "Pune", "Delhi", "Bengaluru"],
      selectedCity: "All",
      detectedCity: null,
      searchQuery: "",
      is24x7Only: false,
      userLat: null,
      userLng: null,
    });
  }
};

/**
 * GET: Nearby Hospitals JSON API (Approved only)
 */
const getNearbyHospitalsApi = async (req, res) => {
  try {
    const { lat, lng, is24x7, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude coordinates are required.",
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const query = { isVerified: true, status: "approved" };
    if (is24x7 === "true") query.is24x7 = true;

    let hospitals = await Hospital.find(query).lean();

    hospitals = hospitals
      .map((h) => {
        h.distanceKm = calculateDistanceKm(userLat, userLng, h.lat, h.lng);
        return h;
      })
      .filter((h) => h.distanceKm !== null)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, parseInt(limit));

    const closestCity = findClosestCity(userLat, userLng);

    res.status(200).json({
      success: true,
      count: hospitals.length,
      detectedCity: closestCity ? closestCity.city : null,
      userLocation: { lat: userLat, lng: userLng },
      hospitals,
    });
  } catch (err) {
    console.error("Nearby hospitals API error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch nearby hospitals." });
  }
};

/**
 * GET: Render Hospital Listing Application Form (Partner Onboarding)
 */
const getAddHospitalPage = (req, res) => {
  res.render("Hospitals/add-hospital");
};

/**
 * POST: Submit Hospital Listing Application for Verification (Status: Pending)
 */
const postAddHospital = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      contactRole,
      licenseNumber,
      address,
      city,
      state,
      pincode,
      phone,
      emergencyPhone,
      email,
      website,
      is24x7,
      services,
      customServices,
      lat,
      lng,
      notes,
    } = req.body;

    if (!name || !address || !city || !phone) {
      req.flash(
        "error",
        "Please provide the hospital/clinic name, city, address, and contact number.",
      );
      return res.redirect("/services/hospitals/add");
    }

    let servicesList = [];
    if (Array.isArray(services)) {
      servicesList = services;
    } else if (typeof services === "string" && services.trim() !== "") {
      servicesList = [services.trim()];
    }

    if (customServices && customServices.trim() !== "") {
      const additional = customServices
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      servicesList = Array.from(new Set([...servicesList, ...additional]));
    }

    if (servicesList.length === 0) {
      servicesList = ["OPD & Consultation", "Vaccination", "Diagnostics"];
    }

    let photoPath = "";
    if (req.file) {
      photoPath =
        req.file.path && req.file.path.startsWith("http")
          ? req.file.path
          : "/uploads/hospitals/" + req.file.filename;
    } else if (req.body.photoUrl && req.body.photoUrl.trim() !== "") {
      photoPath = req.body.photoUrl.trim();
    } else {
      photoPath =
        "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80";
    }

    // Save as Pending verification
    const hospital = await Hospital.create({
      name: name.trim(),
      contactPerson: contactPerson ? contactPerson.trim() : "",
      contactRole: contactRole ? contactRole.trim() : "",
      licenseNumber: licenseNumber ? licenseNumber.trim() : "",
      address: address.trim(),
      city: city.trim(),
      state: state ? state.trim() : "Maharashtra",
      pincode: pincode ? pincode.trim() : "",
      phone: phone.trim(),
      emergencyPhone: emergencyPhone ? emergencyPhone.trim() : phone.trim(),
      email: email ? email.toLowerCase().trim() : "",
      website: website ? website.trim() : "",
      is24x7: is24x7 === "on" || is24x7 === "true" || is24x7 === true,
      services: servicesList,
      photo: photoPath,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      notes: notes ? notes.trim() : "",
      isVerified: false,
      status: "pending",
      user: req.session && req.session.userId ? req.session.userId : null,
    });

    // Notify company/admin via email about the new hospital registration
    try {
      await sendContactEmail({
        name: contactPerson ? `${contactPerson} (${name})` : name,
        email: email || "partner@woofy.com",
        subject: `New Hospital Listing Application: ${hospital.name} (${hospital.city})`,
        message: `A new pet hospital listing application has been submitted on Woofy.\n\nHospital: ${hospital.name}\nCity: ${hospital.city}\nAddress: ${hospital.address}\nContact Person: ${contactPerson || "N/A"} (${contactRole || "N/A"})\nPhone: ${hospital.phone}\n24/7 Emergency: ${hospital.is24x7 ? "Yes" : "No"}\nServices: ${servicesList.join(", ")}\n\nPlease login to the Company Admin Portal at /admin/hospitals to review and verify this application.`,
      });
    } catch (mailErr) {
      console.warn("Could not dispatch admin notification email:", mailErr.message);
    }

    req.flash(
      "success",
      `Thank you! Your hospital registration application for "${hospital.name}" has been received. Our team will verify the details and approve your listing shortly.`,
    );
    res.redirect("/services/hospitals");
  } catch (err) {
    console.error("Hospital application submission error:", err);
    req.flash(
      "error",
      "Failed to submit application: " + (err.message || "Please try again."),
    );
    res.redirect("/services/hospitals/add");
  }
};

module.exports = {
  getHospitalsPage,
  getNearbyHospitalsApi,
  getAddHospitalPage,
  postAddHospital,
};
