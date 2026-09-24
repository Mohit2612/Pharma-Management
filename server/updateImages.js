import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const updateImages = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pharma';
    await mongoose.connect(mongoUri);
    console.log(`✅ Connected to MongoDB: ${mongoUri}`);

    await Product.updateOne({ brand: "GSK" }, { $set: { image: "/uploads/crocin.png" } });
    await Product.updateOne({ brand: "Omron" }, { $set: { image: "/uploads/omron.png" } });
    await Product.updateOne({ brand: "Dabur" }, { $set: { image: "/uploads/honitus.png" } });
    await Product.updateOne({ brand: "Dr. Trust" }, { $set: { image: "/uploads/drtrust.png" } });
    await Product.updateOne({ brand: "Abbott" }, { $set: { image: "/uploads/limcee.png" } });

    console.log(`✅ Passed images to matching DB items.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating images:', error);
    process.exit(1);
  }
};

updateImages();
