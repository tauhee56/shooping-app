import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['Home', 'Work', 'Other'],
    default: 'Home',
  },
  fullName: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  street: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    default: '',
  },
  zip: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    default: '',
  },
  isDefault: {
    type: Boolean,
    default: false,
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

addressSchema.index({ user: 1, isDefault: 1 });

const Address = mongoose.model('Address', addressSchema);
export default Address;
