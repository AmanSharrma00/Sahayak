const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const products = await Product.find({}, 'title vendor');
  console.log(JSON.stringify(products, null, 2));
  process.exit();
}).catch(console.error);
