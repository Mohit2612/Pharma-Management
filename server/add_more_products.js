import mongoose from 'mongoose';
import Product from './models/Product.js';

const PILLS_IMG = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80';
const LIQUID_IMG = 'https://images.unsplash.com/photo-1550572017-edb95f206584?w=500&q=80';
const CREAM_IMG = 'https://images.unsplash.com/photo-1611079830811-865ff4428d17?w=500&q=80';
const FIRST_AID_IMG = 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&q=80';

const newProducts = [
  {
    title: "Crocin Advance 500mg (15 Tablets)",
    brand: "GSK",
    category: "medicine",
    description: "Crocin Advance 500mg Tablet is a medicine used to relieve pain and to reduce fever.",
    tags: "paracetamol, fever, pain, headache",
    image: PILLS_IMG,
    stock: 100,
    price: 30
  },
  {
    title: "Vicks VapoRub 50g",
    brand: "Vicks",
    category: "medicine",
    description: "Vicks VapoRub provides multi-symptom cold relief.",
    tags: "cold, cough, balm, vicks",
    image: CREAM_IMG,
    stock: 50,
    price: 155
  },
  {
    title: "Dettol Antiseptic Liquid 250ml",
    brand: "Dettol",
    category: "self-care",
    description: "Dettol Antiseptic Liquid protects from 100 illness-causing germs.",
    tags: "antiseptic, dettol, first aid, liquid",
    image: LIQUID_IMG,
    stock: 75,
    price: 110
  },
  {
    title: "Savlon Antiseptic Cream 30g",
    brand: "Savlon",
    category: "self-care",
    description: "Savlon Antiseptic Cream helps prevent infection in minor cuts and wounds.",
    tags: "cream, savlon, first aid, wounds",
    image: CREAM_IMG,
    stock: 60,
    price: 45
  },
  {
    title: "Benadryl Cough Syrup 150ml",
    brand: "Benadryl",
    category: "medicine",
    description: "Benadryl Cough Formula provides effective relief from cough.",
    tags: "cough, syrup, cold",
    image: LIQUID_IMG,
    stock: 40,
    price: 125
  },
  {
    title: "Eno Regular Antacid Powder 100g",
    brand: "Eno",
    category: "medicine",
    description: "Eno Fruit Salt Regular gets to work in 6 seconds to relieve acidity.",
    tags: "acidity, eno, gas, digestion",
    image: FIRST_AID_IMG,
    stock: 120,
    price: 140
  },
  {
    title: "Revital H Multivitamin (30 Capsules)",
    brand: "Sun Pharma",
    category: "self-care",
    description: "Revital H is a daily health supplement with Ginseng, Vitamins and Minerals.",
    tags: "vitamins, health, supplement, energy",
    image: PILLS_IMG,
    stock: 45,
    price: 350
  },
  {
    title: "Shelcal 500mg (15 Tablets)",
    brand: "Torrent Pharma",
    category: "medicine",
    description: "Shelcal 500 Tablet is a calcium and vitamin D supplement.",
    tags: "calcium, bones, vitamin d3",
    image: PILLS_IMG,
    stock: 80,
    price: 115
  },
  {
    title: "Volini Pain Relief Spray 60g",
    brand: "Volini",
    category: "medicine",
    description: "Volini Spray provides instant relief from muscle pain, sprain and joint pain.",
    tags: "spray, pain, muscle, joint",
    image: LIQUID_IMG,
    stock: 65,
    price: 175
  },
  {
    title: "Moov Pain Relief Cream 50g",
    brand: "Moov",
    category: "medicine",
    description: "Moov Pain Relief Cream is an ayurvedic ointment for back pain and joint pain.",
    tags: "cream, pain, backache",
    image: CREAM_IMG,
    stock: 90,
    price: 160
  },
  {
    title: "Bandaid Washproof (100 Strips)",
    brand: "Johnson & Johnson",
    category: "self-care",
    description: "Band-Aid Washproof Plasters keep out water, dirt and germs.",
    tags: "bandaid, plaster, wound, first aid",
    image: FIRST_AID_IMG,
    stock: 150,
    price: 120
  },
  {
    title: "Himalaya Liv.52 DS (60 Tablets)",
    brand: "Himalaya",
    category: "medicine",
    description: "Liv.52 DS is a hepatoprotective supplement that protects liver health.",
    tags: "liver, ayurvedic, himalaya",
    image: PILLS_IMG,
    stock: 55,
    price: 180
  },
  {
    title: "Digene Antacid Tablets (15 Tablets)",
    brand: "Abbott",
    category: "medicine",
    description: "Digene tablets provide quick relief from acidity and gas.",
    tags: "acidity, gas, antacid",
    image: PILLS_IMG,
    stock: 200,
    price: 25
  },
  {
    title: "Pudin Hara Pearls (10 Strips)",
    brand: "Dabur",
    category: "medicine",
    description: "Dabur Pudin Hara provides quick relief from stomach ache and gas.",
    tags: "stomach, gas, ayurvedic",
    image: PILLS_IMG,
    stock: 150,
    price: 55
  },
  {
    title: "Betadine Ointment 20g",
    brand: "Win-Medicare",
    category: "self-care",
    description: "Betadine Ointment is an antiseptic and disinfectant used for wounds.",
    tags: "antiseptic, ointment, wound",
    image: CREAM_IMG,
    stock: 80,
    price: 135
  }
];

const addProducts = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pharma');
    const count = await Product.insertMany(newProducts);
    console.log(`Successfully added ${count.length} new products to the database!`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

addProducts();
