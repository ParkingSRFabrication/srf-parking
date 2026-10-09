import mongoose from 'mongoose';

const parkingLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  stationName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    default: ''
  },
  contactPhone: {
    type: String,
    default: ''
  },
  capacity: {
    bike: { type: Number, default: 200 },
    car: { type: Number, default: 50 },
    auto: { type: Number, default: 30 },
    cycle: { type: Number, default: 100 },
    bus: { type: Number, default: 10 },
    truck: { type: Number, default: 10 },
    tempo: { type: Number, default: 20 },
    other: { type: Number, default: 50 },
    helmet: { type: Number, default: 100 },
    locker: { type: Number, default: 50 }
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const ParkingLocation = mongoose.model('ParkingLocation', parkingLocationSchema);
