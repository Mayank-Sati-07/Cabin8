const express = require('express');
const multer = require('multer');
const prisma = require('../core/prismaClient');
const { authenticate, authorize } = require('../middleware/rbac');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Best-effort fuzzy match: exact match first, then substring either direction.
function fuzzyFind(list, name, getName) {
  if (!name) return null;
  const needle = name.trim().toLowerCase();
  if (!needle) return null;

  const exact = list.find(item => getName(item).trim().toLowerCase() === needle);
  if (exact) return exact;

  return list.find(item => {
    const hay = getName(item).trim().toLowerCase();
    return hay.includes(needle) || needle.includes(hay);
  }) || null;
}

// POST /ai/extract-invoice — proxies a document to the Python AI service,
// then matches the extracted vendor/line items against real Contacts and
// Products so the frontend can prefill a Purchase Order directly.
router.post('/extract-invoice', authenticate, authorize(['ADMIN', 'ACCOUNTANT']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const form = new FormData();
    form.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);

    let aiRes;
    try {
      aiRes = await fetch(`${AI_SERVICE_URL}/documents/upload`, { method: 'POST', body: form });
    } catch {
      return res.status(502).json({ error: 'AI document service is not reachable. Is it running?' });
    }

    const aiData = await aiRes.json().catch(() => null);

    if (!aiRes.ok) {
      return res.status(aiRes.status === 500 ? 502 : aiRes.status).json({ error: aiData?.detail || 'AI service error' });
    }

    const invoice = aiData.invoice || {};
    const [contacts, products] = await Promise.all([
      prisma.contact.findMany(),
      prisma.product.findMany(),
    ]);

    const vendor = fuzzyFind(contacts, invoice.vendor_name, c => c.name);

    const lines = (invoice.items || []).map(item => {
      const match = fuzzyFind(products, item.name, p => p.name);
      return {
        productId: match ? match.id : null,
        matchedProductName: match ? match.name : null,
        extractedName: item.name,
        qty: item.quantity ?? 1,
        unitPrice: item.unit_price ?? 0,
      };
    });

    res.json({
      invoice,
      validation: aiData.validation,
      matched: {
        vendorId: vendor ? vendor.id : null,
        vendorName: vendor ? vendor.name : null,
        lines,
        unmatchedCount: lines.filter(l => !l.productId).length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
