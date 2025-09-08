const mongoose = require('mongoose');
require('dotenv').config();

// Import your Product model
const Product = require('../models/Product');

// Sample products data
const sampleProducts = [
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Flagship Samsung smartphone with S Pen, 200MP camera, and AI-powered features.",
    price: 1299.99,
    category: "Electronics",
    stock: 25,
    image: "/images/phones/s24-ultra.jpg",
    tags: ["samsung", "smartphone", "android", "camera", "s-pen"],
    isActive: true
  },
  {
    name: "iPhone 15 Pro Max",
    description: "Apple's premium smartphone with titanium design, A17 Pro chip, and advanced camera system.",
    price: 1199.99,
    category: "Electronics",
    stock: 30,
    image: "/images/phones/iphone-15-pro-max.jpeg",
    tags: ["apple", "iphone", "ios", "premium", "camera"],
    isActive: true
  },
  {
    name: "Google Pixel 8 Pro",
    description: "Google's flagship with advanced AI photography, pure Android experience, and Magic Eraser.",
    price: 999.99,
    category: "Electronics",
    stock: 20,
    image: "/images/phones/pixel-8-pro.jpg",
    tags: ["google", "pixel", "android", "ai", "photography"],
    isActive: true
  },
  {
    name: "Samsung Galaxy S25",
    description: "Premium Samsung phone with enhanced display, improved battery life, and Galaxy AI features.",
    price: 999.99,
    category: "Electronics",
    stock: 35,
    image: "/images/phones/s25.jpeg",
    tags: ["samsung", "smartphone", "android", "display", "battery"],
    isActive: true
  },
  {
    name: "iPhone 15 Pro",
    description: "Pro-level iPhone with titanium build, Action Button, and professional camera capabilities.",
    price: 999.99,
    category: "Electronics",
    stock: 40,
    image: "/images/phones/iphone-15-pro.jpeg",
    tags: ["apple", "iphone", "ios", "titanium", "professional"],
    isActive: true
  },
  {
    name: "Google Pixel 8",
    description: "Smart Android phone with computational photography, 7 years of updates, and clean interface.",
    price: 699.99,
    category: "Electronics",
    stock: 45,
    image: "/images/phones/pixel-8.jpg",
    tags: ["google", "pixel", "android", "updates", "smart"],
    isActive: true
  },
  {
    name: "Samsung Galaxy S24",
    description: "Compact flagship with powerful performance, bright display, and versatile camera system.",
    price: 799.99,
    category: "Electronics",
    stock: 50,
    image: "/images/phones/s24.jpeg",
    tags: ["samsung", "smartphone", "android", "compact", "performance"],
    isActive: true
  },
  {
    name: "iPhone 15",
    description: "Standard iPhone with USB-C, improved cameras, and Dynamic Island technology.",
    price: 799.99,
    category: "Electronics",
    stock: 60,
    image: "/images/phones/iphone-15.jpg",
    tags: ["apple", "iphone", "ios", "usb-c", "dynamic-island"],
    isActive: true
  },
  {
    name: "iPhone 15 Plus",
    description: "Large-screen iPhone with all-day battery life, advanced dual-camera system, and A16 Bionic chip.",
    price: 899.99,
    category: "Electronics",
    stock: 35,
    image: "/images/phones/iphone-15-plus.jpg",
    tags: ["apple", "iphone", "ios", "large-screen", "battery"],
    isActive: true
  },
  {
    name: "Google Pixel 7a",
    description: "Mid-range Pixel with flagship camera features, wireless charging, and affordable pricing.",
    price: 499.99,
    category: "Electronics",
    stock: 70,
    image: "/images/phones/pixel-7a.jpeg",
    tags: ["google", "pixel", "android", "mid-range", "affordable"],
    isActive: true
  }
];
async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing products (optional)
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully created ${products.length} products`);

    // Display created products
    products.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - $${product.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

// Run the seed function
seedProducts();