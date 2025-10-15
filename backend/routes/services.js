const express = require('express');
const router = express.Router();
const { Service } = require('../models');
const { Op } = require('sequelize');

// Obter todos os serviços com filtros opcionais
router.get('/', async (req, res) => {
  try {
    const { category, search, active } = req.query;
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (active !== undefined) {
      where.is_active = active === 'true';
    }
    
    const services = await Service.findAll({
      where,
      order: [['name', 'ASC']]
    });
    
    res.json(services);
  } catch (err) {
    console.error('Erro ao buscar serviços:', err);
    res.status(500).json({ message: 'Erro ao buscar serviços' });
  }
});

// Obter um serviço específico
router.get('/:id', getService, (req, res) => {
  res.json(res.service);
});

// Criar um novo serviço
router.post('/', async (req, res) => {
  try {
    const service = await Service.create({
      name: req.body.name,
      description: req.body.description || '',
      base_price: req.body.basePrice,
      estimated_time: req.body.estimatedTime || 60, // Padrão: 60 minutos
      category: req.body.category || 'repair',     // Padrão: 'repair'
      is_active: req.body.isActive !== undefined ? req.body.isActive : true,
      requires_device: req.body.requiresDevice !== undefined ? req.body.requiresDevice : true
    });
    
    res.status(201).json(service);
  } catch (err) {
    console.error('Erro ao criar serviço:', err);
    res.status(400).json({ 
      message: 'Erro ao criar serviço',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Atualizar um serviço
router.put('/:id', getService, async (req, res) => {
  const updates = {};
  
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.basePrice !== undefined) updates.base_price = parseFloat(req.body.basePrice);
  if (req.body.estimatedTime !== undefined) updates.estimated_time = parseInt(req.body.estimatedTime, 10);
  if (req.body.category !== undefined) updates.category = req.body.category;
  if (req.body.isActive !== undefined) updates.is_active = req.body.isActive;
  if (req.body.requiresDevice !== undefined) updates.requires_device = req.body.requiresDevice;

  try {
    await res.service.update(updates);
    const updatedService = await Service.findByPk(res.service.id);
    res.json(updatedService);
  } catch (err) {
    console.error('Erro ao atualizar serviço:', err);
    res.status(400).json({ message: 'Erro ao atualizar serviço' });
  }
});

// Desativar um serviço (exclusão lógica)
router.delete('/:id', getService, async (req, res) => {
  try {
    await res.service.update({ is_active: false });
    res.json({ message: 'Serviço desativado com sucesso' });
  } catch (err) {
    console.error('Erro ao desativar serviço:', err);
    res.status(500).json({ message: 'Erro ao desativar serviço' });
  }
});

// Atualizar preço do serviço
router.patch('/:id/price', getService, async (req, res) => {
  if (req.body.basePrice === undefined) {
    return res.status(400).json({ message: 'O preço base é obrigatório' });
  }

  try {
    const newPrice = parseFloat(req.body.basePrice);
    if (isNaN(newPrice) || newPrice < 0) {
      return res.status(400).json({ message: 'Preço inválido' });
    }
    
    await res.service.update({ base_price: newPrice });
    const updatedService = await Service.findByPk(res.service.id);
    res.json(updatedService);
  } catch (err) {
    console.error('Erro ao atualizar preço do serviço:', err);
    res.status(400).json({ message: 'Erro ao atualizar preço do serviço' });
  }
});

// Alternar status ativo/inativo do serviço
router.patch('/:id/toggle-active', getService, async (req, res) => {
  try {
    const newStatus = !res.service.is_active;
    await res.service.update({ is_active: newStatus });
    
    res.json({
      message: `Serviço ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
      isActive: newStatus
    });
  } catch (err) {
    console.error('Erro ao alternar status do serviço:', err);
    res.status(400).json({ message: 'Erro ao alternar status do serviço' });
  }
});

// Middleware para obter serviço por ID
async function getService(req, res, next) {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }
    
    res.service = service;
    next();
  } catch (err) {
    console.error('Erro ao buscar serviço:', err);
    res.status(500).json({ message: 'Erro ao buscar serviço' });
  }
}

module.exports = router;
