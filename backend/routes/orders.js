const express = require('express');
const router = express.Router();
const { Order, CustomCase } = require('../models');
const { Op } = require('sequelize');

// Get all orders with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at[Op.gte] = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.created_at[Op.lte] = end;
      }
    }
    
    const orders = await Order.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: CustomCase,
          as: 'custom_case',
          required: false,
        },
      ],
    });
      
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single order
router.get('/:id', getOrder, (req, res) => {
  res.json(res.order);
});

// Create a new order
router.post('/', async (req, res) => {
  try {
    const order = await Order.create({
      customer_name: req.body.customerName,
      phone: req.body.phone,
      device_model: req.body.deviceModel,
      issue: req.body.issue,
      service_type: req.body.serviceType,
      estimated_price: req.body.estimatedPrice,
      status: req.body.status || 'pending',
      notes: req.body.notes,
    });
    
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(400).json({ message: 'Error creating order', error: err.message });
  }
});

// Update an order
router.patch('/:id', getOrder, async (req, res) => {
  const updates = {};
  
  if (req.body.customerName != null) updates.customer_name = req.body.customerName;
  if (req.body.phone != null) updates.phone = req.body.phone;
  if (req.body.deviceModel != null) updates.device_model = req.body.deviceModel;
  if (req.body.issue != null) updates.issue = req.body.issue;
  if (req.body.serviceType != null) updates.service_type = req.body.serviceType;
  if (req.body.estimatedPrice != null) updates.estimated_price = req.body.estimatedPrice;
  if (req.body.status != null) updates.status = req.body.status;
  if (req.body.notes != null) updates.notes = req.body.notes;

  try {
    await res.order.update(updates);
    const updatedOrder = await Order.findByPk(res.order.id, {
      include: [
        {
          model: CustomCase,
          as: 'custom_case',
          required: false,
        },
      ],
    });
    res.json(updatedOrder);
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(400).json({ message: 'Error updating order' });
  }
});

// Delete an order
router.delete('/:id', getOrder, async (req, res) => {
  try {
    await res.order.destroy();
    res.json({ message: 'Order deleted' });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ message: 'Error deleting order' });
  }
});

// Update order status
router.patch('/:id/status', getOrder, async (req, res) => {
  if (!req.body.status) {
    return res.status(400).json({ message: 'Status is required' });
  }
  
  try {
    const updates = { status: req.body.status };
    
    if (req.body.status === 'completed') {
      updates.completed_at = new Date();
    }
    
    await res.order.update(updates);
    const updatedOrder = await Order.findByPk(res.order.id, {
      include: [
        {
          model: CustomCase,
          as: 'custom_case',
          required: false,
        },
      ],
    });
    res.json(updatedOrder);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(400).json({ message: 'Error updating order status' });
  }
});

// Middleware to get order by ID
async function getOrder(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: CustomCase,
          as: 'custom_case',
          required: false,
        },
      ],
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.order = order;
    next();
  } catch (err) {
    console.error('Error finding order:', err);
    res.status(500).json({ message: 'Error finding order' });
  }
}

module.exports = router;
