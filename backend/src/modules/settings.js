const express = require('express');
const prisma = require('../core/prismaClient');
const { authenticate, authorize } = require('../middleware/rbac');

const router = express.Router();

async function getOrCreateSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: 1 } });
}

// GET company settings (home state used for CGST/SGST vs IGST split)
router.get('/', authenticate, async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    await getOrCreateSettings();
    const { companyState, gstin } = req.body;
    const updated = await prisma.settings.update({
      where: { id: 1 },
      data: {
        companyState: companyState ?? undefined,
        gstin:        gstin ?? undefined
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
