const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  basePrice: { 
    type: Number, 
    required: true,
    min: 0
  },
  estimatedTime: { // in minutes
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['repair', 'maintenance', 'diagnostic', 'customization', 'other'],
    default: 'repair'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requiresDevice: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster querying
serviceSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
