import mongoose from 'mongoose';

const renewalRecordSchema = new mongoose.Schema({
  renewedAt: {
    type: Date,
    default: Date.now
  },
  renewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  previousExpiryDate: {
    type: Date,
    required: true
  },
  newExpiryDate: {
    type: Date,
    required: true
  },
  durationMonths: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'UPI', 'CARD', 'OTHER'],
    default: 'CASH'
  },
  paymentReference: {
    type: String,
    default: ''
  }
}, { _id: true });

const monthlyPassSchema = new mongoose.Schema({
  passNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['bike', 'car', 'auto', 'bus', 'cycle', 'truck', 'tempo', 'other', 'helmet', 'locker'],
    default: 'bike'
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    default: '',
    trim: true
  },
  durationMonths: {
    type: Number,
    required: true,
    enum: [1, 6, 12]
  },
  startDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'PENDING', 'CANCELLED'],
    default: 'PAID',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'UPI', 'CARD', 'OTHER'],
    default: 'CASH'
  },
  paymentReference: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
    default: 'ACTIVE',
    index: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLocation'
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  renewalHistory: [renewalRecordSchema],
  notes: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

monthlyPassSchema.index({ vehicleNumber: 1, status: 1 });
monthlyPassSchema.index({ expiryDate: 1, status: 1 });

export const MonthlyPass = mongoose.model('MonthlyPass', monthlyPassSchema);
