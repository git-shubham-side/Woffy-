const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Food", "Grooming", "Toys", "Healthcare", "Accessories", "Bedding & Bowls"],
      default: "Food",
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 25,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80",
    },
    buyUrl: {
      type: String,
      trim: true,
      default: "",
    },
    tags: {
      type: [String],
      default: ["Dog Care", "Best Seller"],
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({
  name: "text",
  category: "text",
  description: "text",
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
