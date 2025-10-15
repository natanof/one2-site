require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/one2';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Insert default data
const insertDefaultData = async () => {
  try {
    const { DeviceModel, Service, StockItem } = models;
    
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
        { name: 'Tela iPhone 12', quantity: 5, price: 250.00 },
        { name: 'Bateria Samsung Galaxy S21', quantity: 3, price: 180.00 },
        { name: 'Capa Traseira iPhone 13', quantity: 8, price: 120.00 }
      ]);
      console.log('Default stock items created');
    }
  } catch (error) {
    console.error('Error inserting default data:', error);
  }
};

testConnection();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à API da OneTech',
    endpoints: {
      orders: '/api/orders',
      stock: '/api/stock',
      models: '/api/models',
      services: '/api/services',
      customCases: '/api/custom-cases',
      commonIssues: '/api/common-issues',
      health: '/health'
    },
    documentation: 'Consulte a documentação da API para mais detalhes.'
  });
});

// Routes
app.use('/api/orders', require('./routes/orders'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/models', require('./routes/models'));
app.use('/api/services', require('./routes/services'));
app.use('/api/custom-cases', require('./routes/customCases'));
app.use('/api/common-issues', require('./routes/commonIssues'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', database: 'SQLite' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database file: ${path.join(dbDir, 'database.sqlite')}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = { app, sequelize }; // for testing
