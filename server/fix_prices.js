import mongoose from 'mongoose';
import Product from './models/Product.js';

const fixPrices = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pharma');
    const products = await Product.find({ image: { $regex: '^/uploads/' } });
    
    for (const product of products) {
      if (product.price > 1000) {
        product.price = Math.round(product.price / 80);
        await product.save();
        console.log(`Fixed price for ${product.title}: Now ${product.price}`);
      }
    }
    
    console.log('Successfully fixed prices!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
fixPrices();
