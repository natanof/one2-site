const express = require('express');
const router = express.Router();
const { CommonIssue, DeviceModel } = require('../models');
const { Op } = require('sequelize');

// Rota para listar todos os problemas comuns
router.get('/', async (req, res) => {
  try {
    const { device_model_id, search } = req.query;
    
    const whereClause = {};
    
    if (device_model_id) {
      whereClause.device_model_id = device_model_id;
    }
    
    if (search) {
      whereClause.issue = {
        [Op.like]: `%${search}%`
      };
    }
    
    const issues = await CommonIssue.findAll({
      where: whereClause,
      include: [
        {
          model: DeviceModel,
          as: 'device_model',
          attributes: ['id', 'brand', 'model'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
    
    res.json(issues);
  } catch (error) {
    console.error('Erro ao buscar problemas comuns:', error);
    res.status(500).json({ error: 'Erro ao buscar problemas comuns' });
  }
});

// Rota para obter um problema comum pelo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const issue = await CommonIssue.findByPk(id, {
      include: [
        {
          model: DeviceModel,
          as: 'device_model',
          attributes: ['id', 'brand', 'model'],
        },
      ],
    });
    
    if (!issue) {
      return res.status(404).json({ error: 'Problema comum não encontrado' });
    }
    
    res.json(issue);
  } catch (error) {
    console.error('Erro ao buscar problema comum:', error);
    res.status(500).json({ error: 'Erro ao buscar problema comum' });
  }
});

// Rota para criar um novo problema comum
router.post('/', async (req, res) => {
  try {
    const { issue, average_repair_cost, device_model_id } = req.body;
    
    // Verifica se o modelo de dispositivo existe
    const deviceModel = await DeviceModel.findByPk(device_model_id);
    if (!deviceModel) {
      return res.status(400).json({ error: 'Modelo de dispositivo não encontrado' });
    }
    
    const newIssue = await CommonIssue.create({
      issue,
      average_repair_cost: parseFloat(average_repair_cost) || 0,
      device_model_id,
    });
    
    // Carrega os dados relacionados para a resposta
    const createdIssue = await CommonIssue.findByPk(newIssue.id, {
      include: [
        {
          model: DeviceModel,
          as: 'device_model',
          attributes: ['id', 'brand', 'model'],
        },
      ],
    });
    
    res.status(201).json(createdIssue);
  } catch (error) {
    console.error('Erro ao criar problema comum:', error);
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({ errors });
    }
    res.status(500).json({ error: 'Erro ao criar problema comum' });
  }
});

// Rota para atualizar um problema comum
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { issue, average_repair_cost, device_model_id } = req.body;
    
    const existingIssue = await CommonIssue.findByPk(id);
    if (!existingIssue) {
      return res.status(404).json({ error: 'Problema comum não encontrado' });
    }
    
    // Verifica se o modelo de dispositivo existe, se estiver sendo atualizado
    if (device_model_id && device_model_id !== existingIssue.device_model_id) {
      const deviceModel = await DeviceModel.findByPk(device_model_id);
      if (!deviceModel) {
        return res.status(400).json({ error: 'Modelo de dispositivo não encontrado' });
      }
    }
    
    // Atualiza apenas os campos fornecidos
    if (issue !== undefined) existingIssue.issue = issue;
    if (average_repair_cost !== undefined) {
      existingIssue.average_repair_cost = parseFloat(average_repair_cost) || 0;
    }
    if (device_model_id !== undefined) {
      existingIssue.device_model_id = device_model_id;
    }
    
    await existingIssue.save();
    
    // Recarrega os dados atualizados com as associações
    const updatedIssue = await CommonIssue.findByPk(id, {
      include: [
        {
          model: DeviceModel,
          as: 'device_model',
          attributes: ['id', 'brand', 'model'],
        },
      ],
    });
    
    res.json(updatedIssue);
  } catch (error) {
    console.error('Erro ao atualizar problema comum:', error);
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({ errors });
    }
    res.status(500).json({ error: 'Erro ao atualizar problema comum' });
  }
});

// Rota para excluir um problema comum
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const issue = await CommonIssue.findByPk(id);
    if (!issue) {
      return res.status(404).json({ error: 'Problema comum não encontrado' });
    }
    
    await issue.destroy();
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir problema comum:', error);
    res.status(500).json({ error: 'Erro ao excluir problema comum' });
  }
});

// Rota para buscar problemas comuns por modelo de dispositivo
router.get('/device-model/:deviceModelId', async (req, res) => {
  try {
    const { deviceModelId } = req.params;
    
    const issues = await CommonIssue.findAll({
      where: { device_model_id: deviceModelId },
      include: [
        {
          model: DeviceModel,
          as: 'device_model',
          attributes: ['id', 'brand', 'model'],
        },
      ],
      order: [['issue', 'ASC']],
    });
    
    res.json(issues);
  } catch (error) {
    console.error('Erro ao buscar problemas por modelo de dispositivo:', error);
    res.status(500).json({ error: 'Erro ao buscar problemas por modelo de dispositivo' });
  }
});

module.exports = router;
