const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Notice content is required']
  },
  type: {
    type: String,
    enum: ['general', 'urgent', 'maintenance', 'event', 'payment'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: 'admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notice', noticeSchema);
