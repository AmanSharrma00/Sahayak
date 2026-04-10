const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentInfo
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentInfo,
      user: req.user.id
    });

    const createdOrder = await order.save();

    // Clear user cart once order is created successfully
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'title images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow admin, or the user who placed the order, or a vendor involved in the order
    const isCustomer = order.user._id.toString() === req.user.id;
    const isVendor = order.orderItems.some(item => item.vendor.toString() === req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isVendor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders for a specific vendor
// @route   GET /api/orders/vendor/orders
// @access  Private/Vendor
exports.getVendorOrders = async (req, res) => {
  try {
    // Find all orders where at least one item belongs to this vendor
    const orders = await Order.find({ 'orderItems.vendor': req.user.id }).sort({ createdAt: -1 });
    
    // Filter the items to only show the ones belonging to the specific vendor
    const mappedOrders = orders.map(order => {
      const vendorItems = order.orderItems.filter(item => item.vendor.toString() === req.user.id);
      return {
        _id: order._id,
        user: order.user,
        shippingInfo: order.shippingInfo,
        paymentInfo: order.paymentInfo,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        vendorItems
      }
    });

    res.json({ success: true, count: mappedOrders.length, orders: mappedOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Vendor or Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus === 'Delivered') {
      return res.status(400).json({ message: 'You have already delivered this order' });
    }

    order.orderStatus = req.body.status;
    
    if (req.body.status === 'Delivered') {
      order.deliveredAt = Date.now();
      
      // Update stock
      for (const item of order.orderItems) {
        await updateStock(item.product, item.quantity);
      }
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function updateStock(productId, quantity) {
  const product = await Product.findById(productId);
  if (product) {
    product.stock -= quantity;
    await product.save({ validateBeforeSave: false });
  }
}
