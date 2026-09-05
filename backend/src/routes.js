const express = require('express');
const prisma = require('./core/prismaClient');
const genericResource = require('./core/genericResource');

const auth = require('./modules/auth');
const dashboard = require('./modules/dashboard');
const productCategory = require('./modules/productCategory');
const purchase = require('./modules/purchase');
const sales = require('./modules/sales');
const payment = require('./modules/payment');
const journalEntry = require('./modules/journalEntry');
const budgetEngine = require('./modules/budgetEngine');
const reports = require('./modules/reports');
const portal = require('./modules/portal');

const router = express.Router();

router.use('/auth', auth);
router.use('/dashboard', dashboard);

// masters
router.use('/contacts', genericResource(prisma, 'contact'));
router.use('/products', genericResource(prisma, 'product'));
router.use('/product-categories', productCategory);
router.use('/analytic-accounts', genericResource(prisma, 'analyticAccount'));
router.use('/accounts', genericResource(prisma, 'account'));
router.use('/journals', genericResource(prisma, 'journal'));

// transactions
router.use('/purchase', purchase);
router.use('/sales', sales);
router.use('/payments', payment);
router.use('/journal-entries', journalEntry);
router.use('/budgets', budgetEngine);
router.use('/reports', reports);
router.use('/portal', portal);

module.exports = router;
