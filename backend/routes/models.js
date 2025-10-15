const express = require('express');
const router = express.Router();
const { DeviceModel, CommonIssue } = require('../models');
const { Op } = require('sequelize');

// Obter todos os modelos de dispositivos com filtros opcionais
router.get('/', async (req, res) => {
  try {
    const { brand, search, active } = req.query;
    const where = {};
    
    if (brand) {
      where.brand = { [Op.iLike]: `%${brand}%` };
    }
    
    if (search) {
      where[Op.or] = [
        { brand: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (active !== undefined) {
      where.is_active = active === 'true';
    }
    
    const models = await DeviceModel.findAll({
      where,
      order: [
        ['brand', 'ASC'],
        ['model', 'ASC']
      ],
      include: [
        {
          model: CommonIssue,
          as: 'common_issues',
          required: false
        }
      ]
    });
    
    res.json(models);
  } catch (err) {
    console.error('Erro ao buscar modelos de dispositivos:', err);
    res.status(500).json({ message: 'Erro ao buscar modelos de dispositivos' });
  }
});

// Obter um modelo de dispositivo específico
router.get('/:id', getModel, (req, res) => {
  res.json(res.deviceModel);
});

// Criar um novo modelo de dispositivo
router.post('/', async (req, res) => {
  try {
    const model = await DeviceModel.create({
      brand: req.body.brand,
      model: req.body.model,
      release_year: req.body.releaseYear,
      screen_size: req.body.screenSize,
      is_active: req.body.isActive !== undefined ? req.body.isActive : true
    });
    
    // Se houver issues comuns, criamos elas também
    if (req.body.commonIssues && Array.isArray(req.body.commonIssues)) {
      const issues = req.body.commonIssues.map(issue => ({
        ...issue,
        device_model_id: model.id
      }));
      
      await CommonIssue.bulkCreate(issues);
      
      // Recarregar o modelo com as issues
      await model.reload({
        include: [
          { model: CommonIssue, as: 'common_issues' }
        ]
      });
    }
    
    res.status(201).json(model);
  } catch (err) {
    console.error('Erro ao criar modelo de dispositivo:', err);
    res.status(400).json({ 
      message: 'Erro ao criar modelo de dispositivo',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Atualizar um modelo de dispositivo
router.put('/:id', getModel, async (req, res) => {
  const updates = {};
  
  if (req.body.brand !== undefined) updates.brand = req.body.brand;
  if (req.body.model !== undefined) updates.model = req.body.model;
  if (req.body.releaseYear !== undefined) updates.release_year = req.body.releaseYear;
  if (req.body.screenSize !== undefined) updates.screen_size = req.body.screenSize;
  if (req.body.isActive !== undefined) updates.is_active = req.body.isActive;

  try {
    await res.deviceModel.update(updates);
    
    // Atualizar issues comuns, se fornecidas
    if (req.body.commonIssues && Array.isArray(req.body.commonIssues)) {
      // Remover issues existentes
      await CommonIssue.destroy({ where: { device_model_id: res.deviceModel.id } });
      
      // Adicionar novas issues
      const issues = req.body.commonIssues.map(issue => ({
        ...issue,
        device_model_id: res.deviceModel.id
      }));
      
      await CommonIssue.bulkCreate(issues);
    }
    
    // Recarregar o modelo com as atualizações
    const updatedModel = await DeviceModel.findByPk(res.deviceModel.id, {
      include: [
        { model: CommonIssue, as: 'common_issues' }
      ]
    });
    
    res.json(updatedModel);
  } catch (err) {
    console.error('Erro ao atualizar modelo de dispositivo:', err);
    res.status(400).json({ message: 'Erro ao atualizar modelo de dispositivo' });
  }
});

// Desativar um modelo de dispositivo (exclusão lógica)
router.delete('/:id', getModel, async (req, res) => {
  try {
    await res.deviceModel.update({ is_active: false });
    res.json({ message: 'Modelo de dispositivo desativado com sucesso' });
  } catch (err) {
    console.error('Erro ao desativar modelo de dispositivo:', err);
    res.status(500).json({ message: 'Erro ao desativar modelo de dispositivo' });
  }
});

// Adicionar um problema comum a um modelo de dispositivo
router.post('/:id/issues', getModel, async (req, res) => {
  const { issue, average_repair_cost } = req.body;
  
  if (!issue) {
    return res.status(400).json({ message: 'A descrição do problema é obrigatória' });
  }
  
  try {
    const newIssue = await CommonIssue.create({
      issue,
      average_repair_cost: average_repair_cost || 0,
      device_model_id: res.deviceModel.id
    });
    
    res.status(201).json(newIssue);
  } catch (err) {
    console.error('Erro ao adicionar problema comum:', err);
    res.status(400).json({ message: 'Erro ao adicionar problema comum' });
  }
});

// Remover um problema comum de um modelo de dispositivo
router.delete('/:modelId/issues/:issueId', getModel, async (req, res) => {
  try {
    const result = await CommonIssue.destroy({
      where: {
        id: req.params.issueId,
        device_model_id: req.params.modelId
      }
    });
    
    if (result === 0) {
      return res.status(404).json({ message: 'Problema comum não encontrado' });
    }
    
    res.json({ message: 'Problema comum removido com sucesso' });
  } catch (err) {
    console.error('Erro ao remover problema comum:', err);
    res.status(500).json({ message: 'Erro ao remover problema comum' });
  }
});

// Middleware para obter modelo de dispositivo por ID
async function getModel(req, res, next) {
  try {
    const deviceModel = await DeviceModel.findByPk(req.params.id, {
      include: [
        { model: CommonIssue, as: 'common_issues' }
      ]
    });
    
    if (!deviceModel) {
      return res.status(404).json({ message: 'Modelo de dispositivo não encontrado' });
    }
    
    res.deviceModel = deviceModel;
    next();
  } catch (err) {
    console.error('Erro ao buscar modelo de dispositivo:', err);
    res.status(500).json({ message: 'Erro ao buscar modelo de dispositivo' });
  }
}

module.exports = router;
