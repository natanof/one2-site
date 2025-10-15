const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  deviceModel: { 
    type: String, 
    required: true 
  },
  issue: { 
    type: String, 
    required: true 
  },
  serviceType: { 
    type: String, 
    required: true 
  },
  estimatedPrice: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'delivered'],
    default: 'pending' 
  },
  notes: { 
    type: String 
  },
  customCase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomCase'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
