const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cart = require('./models/Cart');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const carts = await Cart.find().populate('items.product', 'title price images vendor');
  for (let cart of carts) {
    if (cart.items.length > 0) {
      console.log("Product in cart:", JSON.stringify(cart.items[0].product, null, 2));
    }
  }
  process.exit();
}).catch(console.error);
