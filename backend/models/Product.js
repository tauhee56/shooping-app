const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    default: null,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  images: [{
    type: String,
  }],
  category: {
    type: String,
    default: '',
  },
  tags: [String],
  stock: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviews: [{
    user: mongoose.Schema.Types.ObjectId,
    rating: Number,
    comment: String,
    createdAt: Date,
  }],
  ingredients: [String],
  benefits: [String],
  weight: {
    type: String,
    default: '',
  },
  deliveryTime: {
    type: String,
    default: 'Standard delivery',
  },
  freeDelivery: {
    type: Boolean,
    default: false,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
