const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const productsWithoutVendor = await Product.find({ vendor: { $exists: false } });
  const productsWithNullVendor = await Product.find({ vendor: null });
  console.log("Products without vendor field:", productsWithoutVendor.length);
  console.log("Products with null vendor:", productsWithNullVendor.length);
  process.exit();
}).catch(console.error);
