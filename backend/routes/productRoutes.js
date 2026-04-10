const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts, 
  getProductById, 
  deleteProduct 
} = require('../controllers/productController');

const protect = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Vendor & Admin routes
router.post(
  '/', 
  protect, 
  authorizeRoles('vendor', 'admin'), 
  upload.array('images', 5), // Max 5 images per product
  createProduct
);

router.delete(
  '/:id', 
  protect, 
  authorizeRoles('vendor', 'admin'), 
  deleteProduct
);

module.exports = router;
