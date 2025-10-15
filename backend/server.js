require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Insert default data
const insertDefaultData = async () => {
  try {
    const { DeviceModel, Service, StockItem } = require('./models');
    
    // Check if models exist
    const modelCount = await DeviceModel.count();
    if (modelCount === 0) {
      await DeviceModel.bulkCreate([
        { brand: 'Apple', model: 'iPhone 15 Pro Max' },
        { brand: 'Samsung', model: 'Galaxy S23 Ultra' },
        { brand: 'Xiaomi', model: 'Redmi Note 12' }
      ]);
      console.log('Default models created');
    }
    
    // Check if services exist
    const serviceCount = await Service.count();
    if (serviceCount === 0) {
      await Service.bulkCreate([
        { name: 'Troca de Tela', base_price: 350.00 },
        { name: 'Troca de Bateria', base_price: 120.00 },
        { name: 'Desoxidação', base_price: 80.00 }
      ]);
      console.log('Default services created');
    }
    
    // Check if stock items exist
    const stockCount = await StockItem.count();
    if (stockCount === 0) {
      await StockItem.bulkCreate([
        { name: 'Tela iPhone 12', quantity: 5, cost: 250.00 },
        { name: 'Bateria Samsung Galaxy S21', quantity: 3, cost: 180.00 },
        { name: 'Capa Traseira iPhone 13', quantity: 8, cost: 120.00 }
      ]);
      console.log('Default stock items created');
    }
  } catch (error) {
    console.error('Error inserting default data:', error);
  }
};

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Connection to SQLite has been established successfully.');
    
    // Sync all models
    await sequelize.sync({ force: false }); // Set force: true to drop and recreate tables
    console.log('All models were synchronized successfully.');
    
    // Insert default data
    await insertDefaultData();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/models', require('./routes/models'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/services', require('./routes/services'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/custom-cases', require('./routes/customCases'));
app.use('/api/common-issues', require('./routes/commonIssues'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    database: 'SQLite',
    connected: 'connected'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Bem-vindo à API da OneTech',
    endpoints: {
      models: '/api/models',
      stock: '/api/stock',
      services: '/api/services',
      orders: '/api/orders',
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
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start the server after database is ready
startServer().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;