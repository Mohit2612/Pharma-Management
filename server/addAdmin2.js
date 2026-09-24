import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const seedAdmin2 = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pharma';
    await mongoose.connect(mongoUri);
    console.log(`✅ Connected to MongoDB: ${mongoUri}`);

    const email = 'newadmin@gmail.com';
    const plainPassword = 'password123';

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    let admin = await Admin.findOne({ email });

    if (admin) {
      await Admin.updateOne({ email }, { $set: { password: hashedPassword, isActive: true } });
      console.log(`✅ Password for existing admin (${email}) updated to "${plainPassword}".`);
    } else {
      await Admin.collection.insertOne({
        firstName: 'Second',
        lastName: 'Admin',
        email: email,
        password: hashedPassword,
        role: 'superadmin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Secondary admin created! Email: ${email}, Password: ${plainPassword}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding secondary admin:', error);
    process.exit(1);
  }
};

seedAdmin2();
