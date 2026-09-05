const express = require('express');
const prisma = require('../core/prismaClient');
const { authenticate, authorize } = require('../middleware/rbac');

const router = express.Router();

// LIST
router.get('/', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const categories = await prisma.productCategory.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET BY ID
router.get('/:id', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const category = await prisma.productCategory.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { products: true }
    });
    if (!category) return res.status(404).json({ error: 'Product Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE
router.post('/', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const category = await prisma.productCategory.create({ data: { name } });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'A category with this name already exists' });
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const category = await prisma.productCategory.update({
      where: { id: parseInt(req.params.id) },
      data: { name }
    });
    res.json(category);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Product Category not found' });
    if (err.code === 'P2002') return res.status(400).json({ error: 'A category with this name already exists' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE — Admin only
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    await prisma.productCategory.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Product Category deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Product Category not found' });
    if (err.code === 'P2003') return res.status(400).json({ error: 'Cannot delete — category is linked to existing products' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
