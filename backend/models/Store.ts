import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  paymentOptions: {
    codEnabled: {
      type: Boolean,
      default: false,
    },
    stripeEnabled: {
      type: Boolean,
      default: true,
    },
  },
  storeType: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  logo: {
    type: String,
    default: null,
  },
  banner: {
    type: String,
    default: null,
  },
  location: {
    type: String,
    default: '',
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  rating: {
    type: Number,
    default: 0,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Store = mongoose.model('Store', storeSchema);
export default Store;
