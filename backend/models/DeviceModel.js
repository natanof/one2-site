const mongoose = require('mongoose');

const deviceModelSchema = new mongoose.Schema({
  brand: { 
    type: String, 
    required: true 
  },
  model: { 
    type: String, 
    required: true 
  },
  releaseYear: { 
    type: Number 
  },
  screenSize: { 
    type: Number 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  commonIssues: [{
    issue: String,
    averageRepairCost: Number
  }]
}, {
  timestamps: true
});

// Create a compound index for brand and model to ensure uniqueness
deviceModelSchema.index({ brand: 1, model: 1 }, { unique: true });

// Virtual for full model name
deviceModelSchema.virtual('fullName').get(function() {
  return `${this.brand} ${this.model}`;
});

module.exports = mongoose.model('DeviceModel', deviceModelSchema);
