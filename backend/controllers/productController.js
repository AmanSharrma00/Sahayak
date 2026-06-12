const Product = require('../models/Product');
const { uploadImageToCloudinary } = require('../utils/cloudinaryUploader');
const NodeCache = require('node-cache');

// Initialize cache with a Time-To-Live of 5 minutes (300 seconds)
const productCache = new NodeCache({ stdTTL: 300 });

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Vendor
exports.createProduct = async (req, res) => {
  try {
    const { title, slug, price, description, category, stock } = req.body;
    
    // Process image uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Upload each to Cloudinary in the "sahayak_products" folder
        const result = await uploadImageToCloudinary(file.buffer, 'sahayak_products');
        images.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    }

    const product = await Product.create({
      title,
      slug,
      price: Number(price),
      description,
      category,
      vendor: req.user.id, // Comes from authMiddleware
      stock: Number(stock),
      images
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all products with searching and filtering
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    // 1. Generate a unique key based on the query string
    const cacheKey = `products_${JSON.stringify(req.query)}`;
    
    // 2. Check if we have a cached response for this exact query
    const cachedResponse = productCache.get(cacheKey);
    if (cachedResponse) {
      console.log(`[Cache Hit] Serving products for query: ${JSON.stringify(req.query)}`);
      return res.json(cachedResponse);
    }

    console.log(`[Cache Miss] Fetching products from database...`);
    const resPerPage = Number(req.query.limit) || 8;
    const page = Number(req.query.page) || 1;

    // Search by title
    const keyword = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    // Filter by Price and Category
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    const query = { ...keyword, ...filter };

    const productCount = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .skip(resPerPage * (page - 1))
      .limit(resPerPage)
      .lean();

    const responseData = {
      success: true,
      count: products.length,
      productCount,
      resPerPage,
      products,
    };

    // 3. Store the fresh data in cache for next time
    productCache.set(cacheKey, responseData);

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name email')
      .populate('category', 'name');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor owner or Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check ownership
    if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this product' });
    }

    await product.deleteOne();

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
