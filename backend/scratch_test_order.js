const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cart = require('./models/Cart');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne();
  const cart = await Cart.findOne({ user: user._id }).populate('items.product', 'title price images vendor');
  
  if (!cart || cart.items.length === 0) {
    console.log("Cart is empty");
    process.exit();
  }

  const orderItems = cart.items.map(item => {
    return {
      name: item.product.title,
      quantity: item.quantity,
      image: item.product.images?.length > 0 ? item.product.images[0].url : '',
      price: item.price,
      product: item.product._id,
      vendor: item.product.vendor
    };
  });

  console.log("Order items payload:");
  console.log(JSON.stringify(orderItems, null, 2));
  
  // Let's also check if vendor is undefined
  const hasMissingVendor = orderItems.some(item => !item.vendor);
  console.log("Has missing vendor?", hasMissingVendor);

  process.exit();
}).catch(console.error);
