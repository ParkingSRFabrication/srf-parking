import mongoose from 'mongoose';

const parkingTokenSchema = new mongoose.Schema({
  tokenNumber: {
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
  customerPhone: {
    type: String,
    default: '',
    trim: true
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLocation'
  },
  locationCode: {
    type: String,
    default: 'SRF-MAIN'
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  },
  entryOperator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exitOperator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['INSIDE', 'EXITED', 'CANCELLED'],
    default: 'INSIDE',
    index: true
  },
  entryTime: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  exitTime: {
    type: Date,
    default: null,
    index: true
  },
  durationMinutes: {
    type: Number,
    default: 0
  },
  billableUnits: {
    type: Number,
    default: 1
  },
  amountBilled: {
    type: Number,
    default: 0
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PAID', 'EXEMPT_PASS', 'CANCELLED'],
    default: 'UNPAID',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'UPI', 'CARD', 'OTHER', 'PASS', 'NONE'],
    default: 'NONE'
  },
  paymentReference: {
    type: String,
    default: ''
  },
  tariffSnapshot: {
    category: { type: String },
    billingMethod: { type: String, default: '24_hour_daily' },
    firstSlabAmount: { type: Number, default: 0 },
    additionalDayAmount: { type: Number, default: 0 },
    hourlyAmount: { type: Number, default: 0 },
    freeGraceMinutes: { type: Number, default: 0 },
    tariffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tariff' }
  },
  coveredByPass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonthlyPass',
    default: null
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for fast searching and verification of open sessions
parkingTokenSchema.index({ vehicleNumber: 1, status: 1 });
parkingTokenSchema.index({ entryTime: 1, status: 1 });
parkingTokenSchema.index({ exitTime: 1, paymentStatus: 1 });

export const ParkingToken = mongoose.model('ParkingToken', parkingTokenSchema);
