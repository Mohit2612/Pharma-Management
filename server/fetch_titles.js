import mongoose from 'mongoose';
import Product from './models/Product.js';

const fetchTitles = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pharma');
    const products = await Product.find({}, 'title');
    console.log(JSON.stringify(products, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
fetchTitles();
