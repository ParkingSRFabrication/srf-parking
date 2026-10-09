import mongoose from 'mongoose';

const businessSettingsSchema = new mongoose.Schema({
  businessName: {
    type: String,
    default: 'SR FABRICATION',
    required: true
  },
  tagline: {
    type: String,
    default: 'Railway Station Vehicle Parking Management System'
  },
  locationName: {
    type: String,
    default: 'Railway Station Parking Plaza'
  },
  stationCode: {
    type: String,
    default: 'SRF-MAIN'
  },
  tokenPrefix: {
    type: String,
    default: 'SRF'
  },
  passPrefix: {
    type: String,
    default: 'SRF-PASS'
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  currency: {
    type: String,
    default: 'INR'
  },
  currencySymbol: {
    type: String,
    default: '₹'
  },
  receiptHeader: {
    type: String,
    default: 'SR FABRICATION\nRAILWAY STATION VEHICLE PARKING'
  },
  receiptFooter: {
    type: String,
    default: 'Thank you for parking with us. Please keep token safe.\nLost token penalty applies.'
  },
  passExpiringSoonDays: {
    type: Number,
    default: 5
  },
  contactPhone: {
    type: String,
    default: ''
  },
  contactAddress: {
    type: String,
    default: 'Railway Station Compound'
  },
  categories: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    isVehicle: { type: Boolean, default: true }
  }]
}, {
  timestamps: true
});

export const BusinessSettings = mongoose.model('BusinessSettings', businessSettingsSchema);
