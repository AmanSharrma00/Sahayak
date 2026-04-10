const express = require('express');
const router = express.Router();
const { createCategory, getCategories, deleteCategory } = require('../controllers/categoryController');
const protect = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .get(getCategories)
  .post(protect, authorizeRoles('admin'), createCategory);

router.route('/:id')
  .delete(protect, authorizeRoles('admin'), deleteCategory);

module.exports = router;
