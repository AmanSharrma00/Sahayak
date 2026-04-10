const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Find the standard order we created earlier to get the total amount
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentInfo.status === 'Paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // Razorpay accepts amount in the smallest currency sub-unit (paise for INR)
    const options = {
      amount: Math.round(order.totalPrice * 100),
      currency: "INR",
      receipt: `receipt_${order._id}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    if (!razorpayOrder) {
      return res.status(500).json({ message: 'Error creating Razorpay order' });
    }

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is authentic, update the order in DB
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentInfo = {
          id: razorpay_payment_id,
          status: 'Paid'
        };
        await order.save();
        
        return res.status(200).json({ success: true, message: "Payment verified successfully" });
      } else {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
