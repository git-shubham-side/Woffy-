require("dotenv").config();
const mongoose = require("mongoose");
const Hospital = require("../Models/Hospital");

const sampleHospitals = [
  // Mumbai
  {
    name: "Crown Vet 24/7 Emergency Hospital",
    address: "Arch No. 28/29, Below Mahalaxmi Flyover, Mahalaxmi",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400034",
    phone: "+91 86550 09999",
    emergencyPhone: "+91 86550 09999",
    email: "info@crown.vet",
    website: "https://crown.vet",
    rating: 4.9,
    reviewCount: 420,
    services: [
      "24/7 Emergency",
      "ICU & Critical Care",
      "Surgery & OT",
      "Diagnostics",
      "Ultrasound",
      "In-House Pharmacy",
    ],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80",
    lat: 18.9833,
    lng: 72.8277,
  },
  {
    name: "Dr. Khandekar Pet Hospital & Vet Clinic",
    address: "Shop No. 4, Greenfield CHS, Lokhandwala Complex, Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400053",
    phone: "+91 98200 45678",
    emergencyPhone: "+91 98200 45679",
    email: "drkhandekar.vet@gmail.com",
    rating: 4.8,
    reviewCount: 280,
    services: ["24/7 Emergency", "OPD & Consultation", "Vaccination", "Dental Scaling", "In-House Pharmacy"],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80",
    lat: 19.1417,
    lng: 72.8258,
  },
  {
    name: "Happy Paws Veterinary Clinic & 24/7 Care",
    address: "Sector 17, Vashi, Palm Beach Road",
    city: "Navi Mumbai",
    state: "Maharashtra",
    pincode: "400703",
    phone: "+91 22 2789 5432",
    emergencyPhone: "+91 98330 11223",
    rating: 4.8,
    reviewCount: 190,
    services: ["24/7 Emergency", "Surgery & OT", "Digital X-Ray / Scan", "Vaccination"],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80",
    lat: 19.0771,
    lng: 72.9986,
  },
  {
    name: "Thane Pet Emergency Hospital & Surgical Center",
    address: "Ghodbunder Road, Near Manpada, Thane West",
    city: "Thane",
    state: "Maharashtra",
    pincode: "400607",
    phone: "+91 22 2589 8765",
    emergencyPhone: "+91 98210 99887",
    rating: 4.7,
    reviewCount: 210,
    services: ["24/7 Emergency", "ICU & Critical Care", "Surgery & OT", "OPD & Consultation"],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80",
    lat: 19.2372,
    lng: 72.9781,
  },
  // Pune
  {
    name: "Apollo Pet Care & Veterinary Multi-Speciality",
    address: "Lane 7, Near South Main Road, Koregaon Park",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    phone: "+91 20 2615 1234",
    emergencyPhone: "+91 98900 11223",
    email: "punepetcare@apollovet.com",
    rating: 4.7,
    reviewCount: 310,
    services: [
      "24/7 Emergency",
      "Surgery & OT",
      "Blood Bank",
      "Digital X-Ray / Scan",
      "Vaccination",
    ],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80",
    lat: 18.5362,
    lng: 73.8958,
  },
  {
    name: "Pet Priority Veterinary Clinic",
    address: "Baner - Pashan Link Road, Baner",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411045",
    phone: "+91 98500 66778",
    emergencyPhone: "+91 98500 66779",
    rating: 4.8,
    reviewCount: 240,
    services: ["24/7 Emergency", "Ultrasound", "OPD & Consultation", "Vaccination"],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1583912267670-6575ad4736e6?auto=format&fit=crop&w=600&q=80",
    lat: 18.559,
    lng: 73.7868,
  },
  // Bengaluru
  {
    name: "CUPA Small Animal Hospital",
    address: "KHB Colony, 5th Block, Koramangala",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560095",
    phone: "+91 80 2294 7300",
    emergencyPhone: "+91 80 2294 7301",
    email: "cupahospital@cupaindia.org",
    rating: 4.8,
    reviewCount: 560,
    services: [
      "24/7 Emergency",
      "Surgery & OT",
      "ICU & Critical Care",
      "Digital X-Ray / Scan",
      "OPD & Consultation",
    ],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80",
    lat: 12.9352,
    lng: 77.6245,
  },
  {
    name: "Cessna Lifeline Veterinary Hospital 24/7",
    address: "No. 148, HCGR Plaza, Domlur, Inner Ring Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560071",
    phone: "+91 80 4160 5555",
    emergencyPhone: "+91 76763 65365",
    website: "https://cessnalifeline.com",
    rating: 4.9,
    reviewCount: 890,
    services: ["24/7 Emergency", "Surgery & OT", "ICU & Critical Care", "Ultrasound", "In-House Pharmacy"],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80",
    lat: 12.9609,
    lng: 77.6387,
  },
  // Delhi NCR
  {
    name: "Max Vets 24x7 Multi-Speciality Hospital",
    address: "B-27, East of Kailash, Near Mount Kailash Tower",
    city: "Delhi",
    state: "Delhi",
    pincode: "110065",
    phone: "+91 11 4165 5566",
    emergencyPhone: "+91 98110 54321",
    email: "care@maxvets.com",
    website: "https://maxvets.com",
    rating: 4.9,
    reviewCount: 780,
    services: [
      "24/7 Emergency",
      "Surgery & OT",
      "Ultrasound",
      "Digital X-Ray / Scan",
      "ICU & Critical Care",
      "Pet Ambulance",
    ],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1583912267670-6575ad4736e6?auto=format&fit=crop&w=600&q=80",
    lat: 28.5562,
    lng: 77.241,
  },
  {
    name: "DCC Animal Hospital & 24/7 Emergency",
    address: "A-9, Sector 23, Palam Vihar",
    city: "Gurgaon",
    state: "Haryana",
    pincode: "122017",
    phone: "+91 124 498 8888",
    emergencyPhone: "+91 93115 60101",
    rating: 4.8,
    reviewCount: 340,
    services: ["24/7 Emergency", "Surgery & OT", "ICU & Critical Care", "Vaccination"],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80",
    lat: 28.5085,
    lng: 77.0396,
  },
  {
    name: "Noida Pet Care Multi-Speciality Center",
    address: "Sector 50, Near Wave City Center",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201301",
    phone: "+91 120 456 7890",
    emergencyPhone: "+91 98180 12345",
    rating: 4.7,
    reviewCount: 220,
    services: ["24/7 Emergency", "Digital X-Ray / Scan", "OPD & Consultation", "Vaccination"],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80",
    lat: 28.5708,
    lng: 77.3629,
  },
  // Hyderabad
  {
    name: "Olive Pet Clinic & 24/7 Care",
    address: "Plot No. 42, Jubilee Hills, Road No. 36",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500033",
    phone: "+91 40 2355 8899",
    emergencyPhone: "+91 98490 67890",
    email: "support@olivepetclinic.in",
    rating: 4.7,
    reviewCount: 230,
    services: [
      "24/7 Emergency",
      "Surgery & OT",
      "Ultrasound",
      "Vaccination",
      "In-House Pharmacy",
    ],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80",
    lat: 17.4319,
    lng: 78.4073,
  },
  // Chennai
  {
    name: "Tamil Nadu Veterinary Animal Hospital",
    address: "Madhavaram Milk Colony",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600051",
    phone: "+91 44 2555 1584",
    emergencyPhone: "+91 44 2555 1585",
    email: "tanuvas.hospital@tn.gov.in",
    rating: 4.6,
    reviewCount: 390,
    services: ["24/7 Emergency", "ICU & Critical Care", "Digital X-Ray / Scan", "Surgery & OT", "In-House Pharmacy"],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
    lat: 13.1488,
    lng: 80.2306,
  },
  // Kolkata
  {
    name: "Kolkata Veterinary Care & Trauma Centre",
    address: "68, Kshudiram Bose Sarani, Belgachia",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700037",
    phone: "+91 33 2556 5611",
    emergencyPhone: "+91 98310 99887",
    email: "kolkatavetcare@gmail.com",
    rating: 4.7,
    reviewCount: 310,
    services: ["24/7 Emergency", "Surgery & OT", "Blood Bank", "Diagnostics", "OPD & Consultation"],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80",
    lat: 22.6013,
    lng: 88.3847,
  },
  // Ahmedabad
  {
    name: "Animal Care Hospital & Surgical Centre",
    address: "Opp. Drive-in Cinema, Bodakdev",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380054",
    phone: "+91 79 2685 4321",
    emergencyPhone: "+91 98250 12345",
    email: "care@ahmedabadpetcare.org",
    rating: 4.8,
    reviewCount: 260,
    services: ["24/7 Emergency", "Surgery & OT", "OPD & Consultation", "Diagnostics", "In-House Pharmacy"],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1583912267670-6575ad4736e6?auto=format&fit=crop&w=600&q=80",
    lat: 23.0489,
    lng: 72.5256,
  },
  // Jaipur
  {
    name: "Jaipur Pet Hospital & Emergency Care",
    address: "Tonk Road, Near Gandhi Nagar",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302015",
    phone: "+91 141 270 9988",
    emergencyPhone: "+91 98290 55443",
    rating: 4.8,
    reviewCount: 180,
    services: ["24/7 Emergency", "Surgery & OT", "Digital X-Ray / Scan", "Vaccination"],
    is24x7: true,
    isVerified: true,
    photo:
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80",
    lat: 26.8833,
    lng: 75.8016,
  },
];

const seedHospitals = async () => {
  try {
    const mongoUrl = process.env.DBURL || "mongodb://127.0.0.1:27017/Woffy";
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB for hospital seeding...");

    // Remove existing and re-seed to ensure all updated cities exist
    await Hospital.deleteMany({});
    await Hospital.insertMany(sampleHospitals);
    console.log(`[Seed] Seeded ${sampleHospitals.length} hospitals across major cities!`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Seeding error:", err.message);
  }
};

if (require.main === module) {
  seedHospitals();
}

module.exports = {
  sampleHospitals,
  seedHospitals,
};
