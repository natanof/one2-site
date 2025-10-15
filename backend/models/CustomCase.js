const mongoose = require('mongoose');

const customCaseSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
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
  designDescription: {
    type: String,
    required: true
  },
  designImage: {
    type: String, // URL to the uploaded design image
    required: true
  },
  status: {
    type: String,
    enum: ['design_pending', 'design_approved', 'in_production', 'ready_for_pickup', 'delivered'],
    default: 'design_pending'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String
  },
  estimatedCompletion: {
    type: Date
  },
  designApprovedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for faster querying
customCaseSchema.index({ orderId: 1 });
customCaseSchema.index({ status: 1 });
customCaseSchema.index({ customerName: 'text', phone: 'text', deviceModel: 'text' });

// Virtual for getting the order details
customCaseSchema.virtual('order', {
  ref: 'Order',
  localField: 'orderId',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('CustomCase', customCaseSchema);
