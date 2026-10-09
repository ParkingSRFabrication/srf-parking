import mongoose from 'mongoose';

const tariffSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['bike', 'car', 'auto', 'bus', 'cycle', 'truck', 'tempo', 'other', 'helmet', 'locker'],
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  billingMethod: {
    type: String,
    enum: ['24_hour_daily', 'hourly', 'fixed'],
    default: '24_hour_daily',
    required: true
  },
  firstSlabAmount: {
    type: Number,
    required: true,
    min: 0
  },
  additionalDayAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  hourlyAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  freeGraceMinutes: {
    type: Number,
    default: 0,
    min: 0
  },
  effectiveFrom: {
    type: Date,
    default: Date.now,
    required: true
  },
  effectiveUntil: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

tariffSchema.index({ category: 1, isActive: 1 });

export const Tariff = mongoose.model('Tariff', tariffSchema);
