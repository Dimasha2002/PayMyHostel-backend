const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hostelBlock: {
    type: String,
    required: [true, 'Hostel block is required'],
    trim: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  monthlyRent: {
    type: Number,
    required: [true, 'Monthly rent is required'],
    default: 20000
  },
  facilities: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  residents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Create compound index for unique room identification
roomSchema.index({ hostelBlock: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
