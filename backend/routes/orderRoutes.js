const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getMyOrders, 
  getOrderById,
  getVendorOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const protect = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, createOrder);

router.route('/my-orders')
  .get(protect, getMyOrders);

router.route('/vendor')
  .get(protect, authorizeRoles('vendor', 'admin'), getVendorOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(protect, authorizeRoles('vendor', 'admin'), updateOrderStatus);

module.exports = router;
