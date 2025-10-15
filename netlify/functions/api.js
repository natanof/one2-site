const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Database connection (usando SQLite em memória para Netlify)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // SQLite em memória para Netlify
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

// Importar modelos
const DeviceModel = require('../../backend/models/DeviceModel.model.js');
const Service = require('../../backend/models/Service.model.js');
const StockItem = require('../../backend/models/StockItem.model.js');
const Order = require('../../backend/models/Order.model.js');
const CommonIssue = require('../../backend/models/CommonIssue.model.js');
const CustomCase = require('../../backend/models/CustomCase.model.js');

// Inicializar modelos
DeviceModel.init(sequelize);
Service.init(sequelize);
StockItem.init(sequelize);
Order.init(sequelize);
CommonIssue.init(sequelize);
CustomCase.init(sequelize);

// Definir associações
DeviceModel.associate(sequelize.models);
Service.associate(sequelize.models);
StockItem.associate(sequelize.models);
Order.associate(sequelize.models);
CommonIssue.associate(sequelize.models);
CustomCase.associate(sequelize.models);

// Sincronizar banco de dados
sequelize.sync({ force: true }).then(() => {
  console.log('Database synchronized');
  
  // Inserir dados padrão
  const defaultModels = [
    { brand: 'Apple', name: 'iPhone 15 Pro Max' },
    { brand: 'Samsung', name: 'Galaxy S23 Ultra' },
    { brand: 'Xiaomi', name: 'Redmi Note 12' }
  ];

  const defaultServices = [
    { name: 'Troca de Tela', price: 350.00 },
    { name: 'Troca de Bateria', price: 120.00 },
    { name: 'Desoxidação', price: 80.00 }
  ];

  const defaultStock = [
    { name: 'Tela iPhone 12', quantity: 5, cost: 250.00 },
    { name: 'Bateria Samsung Galaxy S21', quantity: 3, cost: 180.00 },
    { name: 'Capa Traseira iPhone 13', quantity: 8, cost: 120.00 }
  ];

  // Criar dados padrão
  Promise.all([
    ...defaultModels.map(model => DeviceModel.create(model)),
    ...defaultServices.map(service => Service.create(service)),
    ...defaultStock.map(item => StockItem.create(item))
  ]).then(() => {
    console.log('Default data created');
  });
});

// Importar rotas
app.use('/api/orders', require('../../backend/routes/orders'));
app.use('/api/stock', require('../../backend/routes/stock'));
app.use('/api/models', require('../../backend/routes/models'));
app.use('/api/services', require('../../backend/routes/services'));
app.use('/api/custom-cases', require('../../backend/routes/customCases'));
app.use('/api/common-issues', require('../../backend/routes/commonIssues'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', database: 'SQLite' });
});

// Rota raiz da API
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
    message: err.message
  });
});

// Handler para Netlify Functions
exports.handler = async (event, context) => {
  return new Promise((resolve) => {
    app(event, context, (err, result) => {
      if (err) {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: err.message })
        });
      } else {
        resolve(result);
      }
    });
  });
};
