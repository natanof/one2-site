const express = require('express');
const router = express.Router();
const CustomCase = require('../models/CustomCase');
const Order = require('../models/Order');

// Get all custom cases with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { customerName: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { deviceModel: new RegExp(search, 'i') },
        { 'order.orderNumber': new RegExp(search, 'i') }
      ];
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
    
    const customCases = await CustomCase.find(query)
      .sort({ createdAt: -1 })
      .populate('orderId');
      
    res.json(customCases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single custom case
router.get('/:id', getCustomCase, (req, res) => {
  res.json(res.customCase);
});

// Create a new custom case
router.post('/', async (req, res) => {
  // First create the order
  const order = new Order({
    customerName: req.body.customerName,
    phone: req.body.phone,
    deviceModel: req.body.deviceModel,
    issue: 'Custom Case Design',
    serviceType: 'custom_case',
    estimatedPrice: req.body.price || 0,
    status: 'pending',
    notes: 'Custom case design order'
  });

  try {
    // Save the order first
    const newOrder = await order.save();
    
    // Then create the custom case
    const customCase = new CustomCase({
      orderId: newOrder._id,
      customerName: req.body.customerName,
      phone: req.body.phone,
      deviceModel: req.body.deviceModel,
      designDescription: req.body.designDescription,
      designImage: req.body.designImage,
      status: 'design_pending',
      price: req.body.price || 0,
      notes: req.body.notes
    });
    
    const newCustomCase = await customCase.save();
    
    // Update the order with the custom case reference
    newOrder.customCase = newCustomCase._id;
    await newOrder.save();
    
    res.status(201).json(newCustomCase);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a custom case
router.patch('/:id', getCustomCase, async (req, res) => {
  if (req.body.designDescription != null) {
    res.customCase.designDescription = req.body.designDescription;
  }
  if (req.body.designImage != null) {
    res.customCase.designImage = req.body.designImage;
  }
  if (req.body.status != null) {
    res.customCase.status = req.body.status;
    
    // Update timestamps based on status changes
    if (req.body.status === 'design_approved') {
      res.customCase.designApprovedAt = new Date();
    } else if (req.body.status === 'completed') {
      res.customCase.completedAt = new Date();
    }
  }
  if (req.body.price != null) {
    res.customCase.price = req.body.price;
    
    // Also update the order's estimated price
    await Order.findByIdAndUpdate(res.customCase.orderId, { 
      estimatedPrice: req.body.price 
    });
  }
  if (req.body.notes != null) {
    res.customCase.notes = req.body.notes;
  }
  if (req.body.estimatedCompletion != null) {
    res.customCase.estimatedCompletion = req.body.estimatedCompletion;
  }

  try {
    const updatedCustomCase = await res.customCase.save();
    res.json(updatedCustomCase);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a custom case
router.delete('/:id', getCustomCase, async (req, res) => {
  try {
    // First delete the associated order
    await Order.findByIdAndDelete(res.customCase.orderId);
    
    // Then delete the custom case
    await res.customCase.remove();
    
    res.json({ message: 'Custom case and associated order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update custom case status
router.patch('/:id/status', getCustomCase, async (req, res) => {
  if (!req.body.status) {
    return res.status(400).json({ message: 'Status is required' });
  }
  
  res.customCase.status = req.body.status;
  
  // Update timestamps based on status changes
  if (req.body.status === 'design_approved') {
    res.customCase.designApprovedAt = new Date();
  } else if (req.body.status === 'completed') {
    res.customCase.completedAt = new Date();
    
    // Also update the associated order status
    await Order.findByIdAndUpdate(res.customCase.orderId, { 
      status: 'completed' 
    });
  }

  try {
    const updatedCustomCase = await res.customCase.save();
    res.json(updatedCustomCase);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Upload design image (in a real app, you'd use something like multer for file uploads)
router.post('/:id/upload-design', getCustomCase, async (req, res) => {
  if (!req.body.imageUrl) {
    return res.status(400).json({ message: 'Image URL is required' });
  }
  
  try {
    res.customCase.designImage = req.body.imageUrl;
    const updatedCustomCase = await res.customCase.save();
    res.json(updatedCustomCase);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Middleware to get custom case by ID
async function getCustomCase(req, res, next) {
  let customCase;
  try {
    customCase = await CustomCase.findById(req.params.id).populate('orderId');
    if (customCase == null) {
      return res.status(404).json({ message: 'Cannot find custom case' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.customCase = customCase;
  next();
}

module.exports = router;
