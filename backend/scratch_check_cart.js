const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cart = require('./models/Cart');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const cart = await Cart.findOne().populate('items.product', 'title price images vendor');
  console.log(JSON.stringify(cart, null, 2));
  process.exit();
}).catch(console.error);
