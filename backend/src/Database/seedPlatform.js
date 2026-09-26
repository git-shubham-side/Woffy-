require("dotenv").config();
const mongoose = require("mongoose");
const RescueService = require("../Models/RescueService");
const Product = require("../Models/Product");

const sampleRescue = [
  {
    name: "Charlie's Animal Rescue Centre (CARE)",
    orgType: "Shelter",
    city: "Bengaluru",
    state: "Karnataka",
    address: "Survey No. 124/1, Mittaganahalli Cross, Kogilu Main Road, Yelahanka",
    phone: "+91 94839 16052",
    emergencyHelpline: "+91 94839 16052",
    email: "care.helpline@gmail.com",
    services: ["24/7 Stray Rescue", "Trauma Care", "Adoption", "Shelter"],
    is24x7: true,
    isVerified: true,
    photo: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Save Our Strays (SOS) Mumbai Rescue",
    orgType: "NGO",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Andheri West, Near Link Road",
    phone: "+91 98201 41310",
    emergencyHelpline: "+91 98201 41310",
    email: "sosmumbai@gmail.com",
    services: ["24/7 Stray Rescue", "Animal Ambulance", "First Aid", "Sterilization"],
    is24x7: true,
    isVerified: true,
    photo: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "ResQ Charitable Trust Pune",
    orgType: "NGO",
    city: "Pune",
    state: "Maharashtra",
    address: "Bavdhan, Near NDA Road",
    phone: "+91 98900 11001",
    emergencyHelpline: "+91 98900 11001",
    email: "info@resqct.org",
    services: ["24/7 Stray Rescue", "Wildlife Rehabilitation", "Animal Ambulance", "Medical Ward"],
    is24x7: true,
    isVerified: true,
    photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
  },
];

const sampleProducts = [
  {
    name: "Royal Canin Maxi Adult Dry Dog Food (4 kg)",
    category: "Food",
    price: 2650,
    originalPrice: 2950,
    discountPercent: 10,
    rating: 4.9,
    reviewCount: 320,
    description: "Tailored nutrition for large breed adult dogs with high-digestibility protein.",
    inStock: true,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80",
    tags: ["Food", "Best Seller"],
  },
  {
    name: "Bio-Groom Natural Oatmeal Soothing Dog Shampoo (355 ml)",
    category: "Grooming",
    price: 899,
    originalPrice: 1099,
    discountPercent: 18,
    rating: 4.8,
    reviewCount: 145,
    description: "Anti-itch organic shampoo with natural colloidal oatmeal for healthy skin.",
    inStock: true,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=600&q=80",
    tags: ["Grooming", "Organic"],
  },
  {
    name: "KONG Extreme Heavy Duty Rubber Chew Toy (Large)",
    category: "Toys",
    price: 1199,
    originalPrice: 1450,
    discountPercent: 17,
    rating: 4.9,
    reviewCount: 210,
    description: "Ultra-durable natural rubber toy designed for power chewers to prevent boredom.",
    inStock: true,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80",
    tags: ["Toys", "Durable"],
  },
  {
    name: "Beaphar Multi-Vitamin & Calcium Tablets (180 Tabs)",
    category: "Healthcare",
    price: 650,
    originalPrice: 750,
    discountPercent: 13,
    rating: 4.7,
    reviewCount: 95,
    description: "Essential vitamins, minerals, and calcium for strong bones, joints, and shiny coat.",
    inStock: true,
    isFeatured: false,
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80",
    tags: ["Healthcare", "Supplements"],
  },
];

const seedPlatform = async () => {
  try {
    const mongoUrl = process.env.DBURL || "mongodb://127.0.0.1:27017/Woffy";
    await mongoose.connect(mongoUrl);

    // Seed Rescue Services if empty
    const rescueCount = await RescueService.countDocuments();
    if (rescueCount === 0) {
      await RescueService.insertMany(sampleRescue);
      console.log(`[Platform Seed] Seeded ${sampleRescue.length} rescue services.`);
    }

    // Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(sampleProducts);
      console.log(`[Platform Seed] Seeded ${sampleProducts.length} shop products.`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("[Platform Seed Error]:", err.message);
  }
};

if (require.main === module) {
  seedPlatform();
}

module.exports = seedPlatform;
