import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';

const fixAdmin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pharma');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin', salt);
    
    await Admin.updateMany({}, { password: hashedPassword });
    console.log('Successfully updated all admins to have password "admin"');
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
fixAdmin();
