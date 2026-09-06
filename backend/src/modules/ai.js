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

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'vendor';
}

// Contact.email is required + unique, but the AI extraction has no vendor
// email — synthesize a stable placeholder and disambiguate on collision.
async function createVendor(vendorName) {
  const base = slugify(vendorName);
  let email = `${base}@vendor.cabin8.local`;

  if (await prisma.contact.findUnique({ where: { email } })) {
    email = `${base}-${Date.now()}@vendor.cabin8.local`;
  }

  return prisma.contact.create({ data: { name: vendorName, email } });
}

// We only know the price we're being charged (cost), not what we'd resell
// it for — default salesPrice to cost so the record is usable immediately,
// with an obvious zero-margin the user can correct on the Products page.
async function createProduct(item) {
  const price = item.unit_price ?? 0;
  return prisma.product.create({
    data: { name: item.name, type: 'GOODS', salesPrice: price, cost: price },
  });
}

// POST /ai/extract-invoice — proxies a document to the Python AI service,
// then matches the extracted vendor/line items against real Contacts and
// Products. Anything that doesn't match an existing record is created
// automatically (pass ?autoCreate=false to only match, never create) so
// the frontend can prefill a Purchase Order directly with no manual lookup.
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
    const autoCreate = req.query.autoCreate !== 'false';

    const contacts = await prisma.contact.findMany();
    const products = await prisma.product.findMany();

    let vendor = fuzzyFind(contacts, invoice.vendor_name, c => c.name);
    let vendorCreated = false;

    if (!vendor && autoCreate && invoice.vendor_name) {
      vendor = await createVendor(invoice.vendor_name);
      vendorCreated = true;
    }

    const lines = [];
    for (const item of (invoice.items || [])) {
      let product = fuzzyFind(products, item.name, p => p.name);
      let created = false;

      if (!product && autoCreate && item.name) {
        product = await createProduct(item);
        created = true;
        products.push(product); // reuse it if the invoice repeats this item name
      }

      lines.push({
        productId: product ? product.id : null,
        matchedProductName: product ? product.name : null,
        productCreated: created,
        extractedName: item.name,
        qty: item.quantity ?? 1,
        unitPrice: item.unit_price ?? 0,
      });
    }

    res.json({
      invoice,
      validation: aiData.validation,
      matched: {
        vendorId: vendor ? vendor.id : null,
        vendorName: vendor ? vendor.name : null,
        vendorCreated,
        lines,
        createdProductCount: lines.filter(l => l.productCreated).length,
        unmatchedCount: lines.filter(l => !l.productId).length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
