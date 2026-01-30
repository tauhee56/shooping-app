import mongoose from 'mongoose';

const deliveryAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    zip: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const paymentMethodSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'card' },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      required: true,
    },
    at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: Number,
    price: Number,
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  deliveryAddress: {
    type: deliveryAddressSchema,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: {
    type: [statusHistorySchema],
    default: () => [{ status: 'pending', at: new Date() }],
  },
  paymentMethod: {
    type: paymentMethodSchema,
    default: () => ({ type: 'card' }),
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  paymentIntentId: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
