const mongoose = require('mongoose');

const stockItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 0
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  category: { 
    type: String,
    enum: ['phone_case', 'screen_protector', 'charger', 'cable', 'adapter', 'other'],
    default: 'other'
  },
  sku: { 
    type: String,
    unique: true
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
});

// Generate SKU before saving if not provided
stockItemSchema.pre('save', function(next) {
  if (!this.sku) {
    const prefix = this.category ? this.category.substring(0, 3).toUpperCase() : 'ITM';
    const random = Math.floor(1000 + Math.random() * 9000);
    this.sku = `${prefix}-${random}`;
  }
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('StockItem', stockItemSchema);
