const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private/Customer
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    const isValidProduct = await Product.findById(productId);
    if (!isValidProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already submitted a review
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user.id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    req.body.user = req.user.id;
    req.body.product = productId;

    const review = await Review.create(req.body);

    res.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner or Admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
