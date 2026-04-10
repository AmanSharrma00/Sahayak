require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const bcrypt = require('bcrypt');
const connectDB = require('./config/db');

// Sample Placeholder Images from Unsplash API
const SAMPLE_DATA = {
  categories: [
    { name: 'Electronics & Gadgets', slug: 'electronics' },
    { name: 'Men\'s Fashion', slug: 'mens-fashion' },
    { name: 'Women\'s Fashion', slug: 'womens-fashion' },
    { name: 'Home & Furniture', slug: 'home-furniture' }
  ],
  products: [
    {
      title: 'Sony Alpha a7 III Mirrorless Camera',
      slug: 'sony-alpha-a7iii',
      price: 154900,
      discountPrice: 142000,
      description: 'Advanced 24.2 MP Full-frame Image Sensor w/ 1.8X readout speed. Spectacular dynamic range and low light capability.',
      stock: 12,
      categorySlug: 'electronics',
      images: [{ url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', public_id: 'seeder1' }]
    },
    {
      title: 'Apple MacBook Pro M3 Max 16-inch',
      slug: 'macbook-pro-m3-max',
      price: 349900,
      discountPrice: 329000,
      description: 'The most advanced Mac ever. Packed with the M3 Max chip for ultimate performance in coding, editing, and rendering.',
      stock: 5,
      categorySlug: 'electronics',
      images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', public_id: 'seeder2' }]
    },
    {
      title: 'Premium Leather Oxford Shoes',
      slug: 'premium-leather-oxfords',
      price: 4500,
      description: 'Handcrafted genuine leather oxfords to elevate your formal attire. Featuring a cushioned sole for all-day comfort.',
      stock: 35,
      categorySlug: 'mens-fashion',
      images: [{ url: 'https://images.unsplash.com/photo-1614252339460-e17f54c3edc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', public_id: 'seeder3' }]
    },
    {
      title: 'Classic Wool Trench Coat',
      slug: 'classic-wool-trench',
      price: 8900,
      discountPrice: 6500,
      description: 'Stay warm and stylish this winter with our premium double-breasted wool trench coat designed for the modern gentleman.',
      stock: 20,
      categorySlug: 'mens-fashion',
      images: [{ url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', public_id: 'seeder4' }]
    },
    {
      title: 'Designer Rose Gold Minimalist Watch',
      slug: 'designer-rose-gold-watch',
      price: 6800,
      description: 'Elegant and lightweight rose-gold timepiece featuring a mesh strap and water-resistant dial. Perfect for everyday wear.',
      stock: 14,
      categorySlug: 'womens-fashion',
      images: [{ url: 'https://images.unsplash.com/photo-1508656934553-9b9359e2197b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', public_id: 'seeder5' }]
    },
    {
      title: 'Modern Velvet Accent Chair',
      slug: 'modern-velvet-accent-chair',
      price: 12500,
      discountPrice: 10999,
      description: 'Add a touch of luxury to your living room with this mid-century modern accent chair upholstered in premium emerald green velvet.',
      stock: 8,
      categorySlug: 'home-furniture',
      images: [{ url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', public_id: 'seeder6' }]
    }
  ]
};

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // 1. Clear database
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({ email: 'seller@sahayak.com' }); // Don't wipe real users just in case

    // 2. Create Vendor
    const hashedPassword = await bcrypt.hash('password123', 10);
    const vendorUser = await User.create({
      name: 'Sahayak Official Store',
      email: 'seller@sahayak.com',
      password: hashedPassword,
      role: 'vendor'
    });
    console.log('Vendor User Created: seller@sahayak.com');

    // 3. Create Categories
    const createdCategories = await Category.insertMany(SAMPLE_DATA.categories);
    console.log(`${createdCategories.length} Categories Created.`);

    // 4. Map Categories to Products
    const productsToCreate = SAMPLE_DATA.products.map(product => {
      // Find matching category ID
      const matchingCategory = createdCategories.find(c => c.slug === product.categorySlug);
      
      return {
        title: product.title,
        slug: product.slug,
        price: product.price,
        discountPrice: product.discountPrice,
        description: product.description,
        stock: product.stock,
        images: product.images,
        category: matchingCategory._id,
        vendor: vendorUser._id
      };
    });

    // 5. Insert Products
    await Product.insertMany(productsToCreate);
    console.log('Products Inserted Successfully! Data Population Complete. ✅');

    process.exit();
  } catch (error) {
    console.error('Error with import data:', error);
    process.exit(1);
  }
};

importData();
