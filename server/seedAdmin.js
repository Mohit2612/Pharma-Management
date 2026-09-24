import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pharma';
    await mongoose.connect(mongoUri);
    console.log(`✅ Connected to MongoDB: ${mongoUri}`);

    const email = 'admin@gmail.com';
    const plainPassword = 'admin';

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    let admin = await Admin.findOne({ email });

    if (admin) {
      await Admin.updateOne({ email }, { $set: { password: hashedPassword } });
      console.log(`✅ Password for existing admin (${email}) updated to "${plainPassword}".`);
    } else {
      await Admin.collection.insertOne({
        firstName: 'Super',
        lastName: 'Admin',
        email: email,
        password: hashedPassword,
        role: 'superadmin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Default admin created via direct insert! Email: ${email}, Password: ${plainPassword}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
