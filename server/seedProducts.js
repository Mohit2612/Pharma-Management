import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const seedProducts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pharma';
    await mongoose.connect(mongoUri);
    console.log(`✅ Connected to MongoDB: ${mongoUri}`);

    // Clear existing products just to ensure a clean slate, or we can just append
    // I will just append to avoid removing anything if they already added.
    
    const productsToAdd = [
      {
        title: "Crocin Advance 500mg Tablets",
        brand: "GSK",
        category: "medicine",
        description: "Crocin Advance is a reliable pain reliever and fever reducer containing Paracetamol. It provides fast relief from headaches, body aches, and fever.",
        tags: "paracetamol, fever, painkiller, headache",
        stock: 150,
        price: 35,
        isActive: true,
        image: ""
      },
      {
        title: "Omron Fully Automatic Blood Pressure Monitor",
        brand: "Omron",
        category: "machine",
        description: "Accurate and easy-to-use digital blood pressure monitor for home use. Features irregular heartbeat detection and body movement indicator.",
        tags: "bp monitor, health machine, digital bp, omron",
        stock: 25,
        price: 2400,
        isActive: true,
        image: ""
      },
      {
        title: "Dabur Honitus Cough Syrup 100ml",
        brand: "Dabur",
        category: "medicine",
        description: "Ayurvedic cough syrup enriched with honey, tulsi, and mulethi. Provides quick relief from cough and sore throat without drowsiness.",
        tags: "cough, ayurvedic, honey, throat",
        stock: 80,
        price: 120,
        isActive: true,
        image: ""
      },
      {
        title: "Dr. Trust Digital Thermometer",
        brand: "Dr. Trust",
        category: "machine",
        description: "Flexible tip digital thermometer with quick response, high accuracy, and fever alarm. Water-resistant and suitable for all ages.",
        tags: "thermometer, digital, fever check, accurate",
        stock: 60,
        price: 299,
        isActive: true,
        image: ""
      },
      {
        title: "Limcee Vitamin C Chewable Tablets 500mg",
        brand: "Abbott",
        category: "self-care",
        description: "Vitamin C chewable tablets in an orange flavor. Helps boost immunity and supports healthy skin and joints.",
        tags: "vitamin c, immunity, chewable, supplement",
        stock: 200,
        price: 25,
        isActive: true,
        image: ""
      }
    ];

    await Product.insertMany(productsToAdd);
    console.log(`✅ Successfully added 5 real pharmaceutical products to the database!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
