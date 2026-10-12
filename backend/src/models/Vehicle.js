import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    default: 'bike',
    trim: true,
    lowercase: true,
    index: true
  },
  ownerName: {
    type: String,
    default: '',
    trim: true
  },
  ownerPhone: {
    type: String,
    default: '',
    trim: true
  },
  totalVisits: {
    type: Number,
    default: 0
  },
  totalAmountSpent: {
    type: Number,
    default: 0
  },
  lastVisitedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
