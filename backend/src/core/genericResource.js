const express = require('express');
const { authenticate, authorize } = require('../middleware/rbac');

function genericResource(prisma, modelName, allowedRoles = ['ADMIN', 'ACCOUNTANT']) {

  const router = express.Router();
  const model = prisma[modelName];

  if (!model) {
    throw new Error(`Prisma model "${modelName}" does not exist`);
  }

  // LIST
  router.get('/', authenticate, authorize(allowedRoles), async (req, res) => {
    try {
      const records = await model.findMany({ orderBy: { id: 'desc' } });
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET BY ID
  router.get('/:id', authenticate, authorize(allowedRoles), async (req, res) => {
    try {
      const record = await model.findUnique({ where: { id: parseInt(req.params.id) } });
      if (!record) return res.status(404).json({ error: `${modelName} not found` });
      res.json(record);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // CREATE
  router.post('/', authenticate, authorize(allowedRoles), async (req, res) => {
    try {
      const record = await model.create({ data: req.body });
      res.status(201).json(record);
    } catch (err) {
      if (err.code === 'P2002') return res.status(400).json({ error: `A ${modelName} with this ${err.meta?.target || 'value'} already exists` });
      res.status(500).json({ error: err.message });
    }
  });

  // UPDATE
  router.put('/:id', authenticate, authorize(allowedRoles), async (req, res) => {
    try {
      const record = await model.update({
        where: { id: parseInt(req.params.id) },
        data: req.body
      });
      res.json(record);
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: `${modelName} not found` });
      if (err.code === 'P2002') return res.status(400).json({ error: `A ${modelName} with this ${err.meta?.target || 'value'} already exists` });
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE — Admin only regardless of allowedRoles
  router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
      await model.delete({ where: { id: parseInt(req.params.id) } });
      res.json({ message: `${modelName} deleted` });
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: `${modelName} not found` });
      if (err.code === 'P2003') return res.status(400).json({ error: `Cannot delete — ${modelName} is linked to existing records` });
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = genericResource;