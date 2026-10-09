import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  type: {
    type: String,
    enum: ['PARKING_TOKEN', 'MONTHLY_PASS'],
    required: true,
    index: true
  },
  parkingToken: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingToken',
    default: null
  },
  monthlyPass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonthlyPass',
    default: null
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  method: {
    type: String,
    enum: ['CASH', 'UPI', 'CARD', 'OTHER'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'REVERSED'],
    default: 'COMPLETED',
    index: true
  },
  transactionReference: {
    type: String,
    default: '',
    trim: true
  },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLocation'
  },
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  refundReason: {
    type: String,
    default: ''
  },
  refundedAt: {
    type: Date,
    default: null
  },
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

paymentSchema.index({ createdAt: 1, status: 1 });
paymentSchema.index({ type: 1, createdAt: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
