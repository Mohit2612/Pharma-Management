import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Product from './models/Product.js';

const brainDir = 'C:\\Users\\Di\\.gemini\\antigravity-ide\\brain\\038b953e-17dc-4115-96b8-3e5047693f57';
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const imageMap = {
  "Accu-Chek Active Glucometer Test Strips Box Of 50": "accu_chek_strips_1787600850265.jpg",
  "Omron Blood Pressure Monitor HEM-7121J": "omron_bp_monitor_1787600920708.jpg",
  "Omron Compressor Nebulizer Ne-C106": "omron_nebulizer_1787600932666.jpg",
  "OneTouch Select Plus Simple Glucometer (FREE 10 strips + lancing device + 10 lancets)": "onetouch_glucometer_1787600946973.jpg",
  "Accu-Chek Active Blood Glucose Monitoring System With 10 Free Test Strips": "accu_chek_monitoring_system_1787600966514.jpg",
  "Apollo Pharmacy Digital Flexible Thermometer": "apollo_thermometer_1787601096898.jpg",
  "Romsons Respirometer SH-6082": "romsons_respirometer_1787601107738.jpg",
  "Prega News Pregnancy Test Card": "prega_news_1787601207234.jpg",
  "Polymed Pulse Oximeter CMS50C": "polymed_pulse_oximeter_1787601256909.jpg",
  "Freestyle Libre Reader - Flash Glucose Monitoring System": "freestyle_libre_reader_1787601270205.jpg",
  "Seni Air Classic Breathable Adult Diapers Medium": "seni_adult_diapers_1787601281890.jpg",
  "Cipla Saslic DS Foaming Face Wash, 60 ml": "real_pharma_products_1787598341421.jpg"
};

const updateImages = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pharma');
    const products = await Product.find({});
    
    for (const product of products) {
      const imageName = imageMap[product.title];
      if (imageName) {
        const sourcePath = path.join(brainDir, imageName);
        const destPath = path.join(uploadsDir, imageName);
        
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`Copied ${imageName} for ${product.title}`);
          
          product.image = `/uploads/${imageName}`;
          await product.save();
        } else {
          console.error(`File not found: ${sourcePath}`);
        }
      }
    }
    
    console.log("Images updated successfully!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

updateImages();
