import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';

const checkAdmin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pharma');
    const admin = await Admin.findOne({ email: 'admin@gmail.com' }).select('+password');
    if (!admin) {
      console.log('Admin not found!');
    } else {
      console.log('Admin found:', admin.email);
      const isMatch = await bcrypt.compare('admin', admin.password);
      console.log('Password match:', isMatch);
      console.log('IsActive:', admin.isActive);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
checkAdmin();
