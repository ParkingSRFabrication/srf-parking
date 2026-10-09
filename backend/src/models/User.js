import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  operatorId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'operator'],
    default: 'operator',
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  mpinHash: {
    type: String,
    default: null
  },
  assignedLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLocation'
  },
  permissions: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Helper methods
userSchema.methods.comparePassword = async function(password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.compareMpin = async function(mpin) {
  if (!this.mpinHash) return false;
  return bcrypt.compare(mpin, this.mpinHash);
};

userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.mpinHash;
  return obj;
};

export const User = mongoose.model('User', userSchema);
