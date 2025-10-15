const express = require('express');
const router = express.Router();
const { StockItem } = require('../models');
const { Op } = require('sequelize');

// Obter todos os itens de estoque com filtros opcionais
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, inStock, search } = req.query;
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    
    if (inStock === 'true') {
      where.quantity = { [Op.gt]: 0 };
    } else if (inStock === 'false') {
      where.quantity = 0;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const items = await StockItem.findAll({
      where,
      order: [['name', 'ASC']]
    });
    
    res.json(items);
  } catch (err) {
    console.error('Erro ao buscar itens de estoque:', err);
    res.status(500).json({ message: 'Erro ao buscar itens de estoque' });
  }
});

// Obter um item de estoque específico
router.get('/:id', getStockItem, (req, res) => {
  res.json(res.stockItem);
});

// Criar um novo item de estoque
router.post('/', async (req, res) => {
  try {
    // O SKU será gerado automaticamente pelo hook no modelo
    const item = await StockItem.create({
      name: req.body.name,
      description: req.body.description,
      quantity: req.body.quantity || 0,
      price: req.body.price,
      category: req.body.category || 'other',
      sku: req.body.sku // Opcional, será gerado se não fornecido
    });
    
    res.status(201).json(item);
  } catch (err) {
    console.error('Erro ao criar item de estoque:', err);
    res.status(400).json({ 
      message: 'Erro ao criar item de estoque',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Atualizar um item de estoque
router.put('/:id', getStockItem, async (req, res) => {
  const updates = {};
  
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.quantity !== undefined) updates.quantity = parseInt(req.body.quantity, 10);
  if (req.body.price !== undefined) updates.price = parseFloat(req.body.price);
  if (req.body.category !== undefined) updates.category = req.body.category;
  if (req.body.sku !== undefined) updates.sku = req.body.sku;

  try {
    await res.stockItem.update(updates);
    const updatedItem = await StockItem.findByPk(res.stockItem.id);
    res.json(updatedItem);
  } catch (err) {
    console.error('Erro ao atualizar item de estoque:', err);
    res.status(400).json({ message: 'Erro ao atualizar item de estoque' });
  }
});

// Deletar um item de estoque
router.delete('/:id', getStockItem, async (req, res) => {
  try {
    await res.stockItem.destroy();
    res.json({ message: 'Item de estoque excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir item de estoque:', err);
    res.status(500).json({ message: 'Erro ao excluir item de estoque' });
  }
});

// Atualizar quantidade em estoque (adicionar/remover)
router.patch('/:id/quantity', getStockItem, async (req, res) => {
  const { quantity, operation } = req.body;
  
  if (quantity === undefined || !operation) {
    return res.status(400).json({ message: 'Quantidade e operação são obrigatórias' });
  }

  const amount = parseFloat(quantity);
  
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Quantidade inválida' });
  }

  try {
    if (operation === 'add') {
      await res.stockItem.increment('quantity', { by: amount });
    } else if (operation === 'remove') {
      if (res.stockItem.quantity < amount) {
        return res.status(400).json({ message: 'Estoque insuficiente' });
      }
      await res.stockItem.decrement('quantity', { by: amount });
    } else {
      return res.status(400).json({ message: 'Operação inválida. Use "add" ou "remove"' });
    }

    // Recarregar o item atualizado
    const updatedItem = await StockItem.findByPk(res.stockItem.id);
    res.json(updatedItem);
  } catch (err) {
    console.error('Erro ao atualizar quantidade em estoque:', err);
    res.status(400).json({ message: 'Erro ao atualizar quantidade em estoque' });
  }
});

// Middleware para obter item de estoque por ID
async function getStockItem(req, res, next) {
  try {
    const stockItem = await StockItem.findByPk(req.params.id);
    
    if (!stockItem) {
      return res.status(404).json({ message: 'Item de estoque não encontrado' });
    }
    
    res.stockItem = stockItem;
    next();
  } catch (err) {
    console.error('Erro ao buscar item de estoque:', err);
    res.status(500).json({ message: 'Erro ao buscar item de estoque' });
  }
}

module.exports = router;
