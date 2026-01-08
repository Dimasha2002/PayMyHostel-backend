const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative'],
    default: 20000
  },
  month: {
    type: String,
    required: [true, 'Payment month is required'],
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  },
  year: {
    type: String,
    required: [true, 'Payment year is required']
  },
  method: {
    type: String,
    default: 'Bank Slip'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'rejected'],
    default: 'pending'
  },
  reference: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  paymentDate: {
    type: Date,
    required: true
  },
  bankSlip: {
    type: String, // File path
    required: true
  },
  receipt: {
    type: String // Generated receipt file name
  },
  adminNotes: {
    type: String,
    trim: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate unique reference number
paymentSchema.pre('save', async function(next) {
  if (!this.reference) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.reference = `PMH-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
