const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String
  },
  image: {
    url: String,
    public_id: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
