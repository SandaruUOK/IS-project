const mongoose = require('mongoose');
require('dotenv').config();

// Import your Product model
const Product = require('../models/Product');

// Sample products data
const sampleProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation and 20-hour battery life.",
    price: 89.99,
    category: "Electronics",
    stock: 50,
    image: "headphones.jpg",
    tags: ["wireless", "bluetooth", "music", "audio"],
    isActive: true
  },
  {
    name: "Organic Cotton T-Shirt",
    description: "Comfortable 100% organic cotton t-shirt available in multiple colors.",
    price: 24.99,
    category: "Clothing",
    stock: 100,
    image: "tshirt.jpg",
    tags: ["organic", "cotton", "casual", "comfortable"],
    isActive: true
  },
  {
    name: "JavaScript Programming Guide",
    description: "Complete guide to modern JavaScript programming with practical examples.",
    price: 39.99,
    category: "Books",
    stock: 25,
    image: "js-book.jpg",
    tags: ["programming", "javascript", "coding", "learning"],
    isActive: true
  },
  {
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracker with heart rate monitoring and GPS.",
    price: 199.99,
    category: "Electronics",
    stock: 30,
    image: "fitness-watch.jpg",
    tags: ["fitness", "health", "smartwatch", "gps"],
    isActive: true
  },
  {
    name: "Yoga Mat Pro",
    description: "Premium non-slip yoga mat perfect for all types of yoga and exercise.",
    price: 45.99,
    category: "Sports",
    stock: 75,
    image: "yoga-mat.jpg",
    tags: ["yoga", "exercise", "fitness", "meditation"],
    isActive: true
  },
  {
    name: "Organic Face Moisturizer",
    description: "Natural organic face moisturizer suitable for all skin types.",
    price: 32.99,
    category: "Beauty",
    stock: 40,
    image: "moisturizer.jpg",
    tags: ["organic", "skincare", "natural", "face"],
    isActive: true
  },
  {
    name: "Gourmet Coffee Beans",
    description: "Premium single-origin coffee beans with rich flavor and aroma.",
    price: 18.99,
    category: "Food",
    stock: 60,
    image: "coffee-beans.jpg",
    tags: ["coffee", "gourmet", "organic", "beans"],
    isActive: true
  },
  {
    name: "Indoor Plant - Snake Plant",
    description: "Low-maintenance snake plant perfect for indoor spaces.",
    price: 15.99,
    category: "Home & Garden",
    stock: 35,
    image: "snake-plant.jpg",
    tags: ["plant", "indoor", "decoration", "air-purifying"],
    isActive: true
  },
  {
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with precision tracking and long battery life.",
    price: 29.99,
    category: "Electronics",
    stock: 80,
    image: "wireless-mouse.jpg",
    tags: ["wireless", "computer", "ergonomic", "office"],
    isActive: true
  },
  {
    name: "Essential Oil Diffuser",
    description: "Ultrasonic essential oil diffuser with LED lights and timer function.",
    price: 49.99,
    category: "Home & Garden",
    stock: 45,
    image: "oil-diffuser.jpg",
    tags: ["aromatherapy", "essential-oils", "relaxation", "home"],
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