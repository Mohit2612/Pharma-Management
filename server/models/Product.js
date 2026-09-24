import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['medicine', 'self-care', 'machine'],
        message: '{VALUE} is not a valid category',
      },
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    tags: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    manufacturer: {
      type: String,
      trim : true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search — replaces legacy SQL `LIKE '%search_text%'`
productSchema.index({ title: 'text', brand: 'text', tags: 'text' });

// Index for category filtering
productSchema.index({ category: 1 });


const Product = mongoose.model('Product', productSchema);

export default Product;
