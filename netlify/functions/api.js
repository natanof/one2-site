const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Import database models
const { sequelize } = require('../../backend/models');

// Database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite connection has been established successfully.');
    
    // Sync all models
    await sequelize.sync({ force: false });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Import routes
app.use('/api/orders', require('../../backend/routes/orders'));
app.use('/api/stock', require('../../backend/routes/stock'));
app.use('/api/models', require('../../backend/routes/models'));
app.use('/api/services', require('../../backend/routes/services'));
app.use('/api/custom-cases', require('../../backend/routes/customCases'));
app.use('/api/common-issues', require('../../backend/routes/commonIssues'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    database: 'SQLite',
    connected: true
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Bem-vindo à API da OneTech',
    endpoints: {
      orders: '/api/orders',
      stock: '/api/stock',
      models: '/api/models',
      services: '/api/services',
      customCases: '/api/custom-cases',
      commonIssues: '/api/common-issues',
      health: '/api/health'
    },
    documentation: 'Consulte a documentação da API para mais detalhes.'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Wrap the Express app with serverless-http
const handler = serverless(app);

// Netlify Functions handler
module.exports.handler = async (event, context) => {
  // Ensure database connection
  await connectDB();
  
  // Process the request
  const result = await handler(event, context);
  return result;
};
