require('dotenv').config();

const bcrypt = require('bcryptjs');
const prisma = require('./src/core/prismaClient');
const { nextPONumber, nextBillNumber, nextSONumber, nextInvoiceNumber } = require('./src/core/sequence');
const { postVendorBill, postCustomerInvoice, postBillPayment, postInvoicePayment } = require('./src/modules/postingEngine');

// ── Master data helpers (idempotent — safe to re-run) ──────────────────────

async function upsertAccount(name, type) {
  const existing = await prisma.account.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.account.create({ data: { name, type } });
}

async function upsertJournal(name, type, defaultAccountId) {
  const existing = await prisma.journal.findFirst({ where: { type } });
  if (existing) return existing;
  return prisma.journal.create({ data: { name, type, defaultAccountId } });
}

async function upsertProductCategory(name) {
  return prisma.productCategory.upsert({ where: { name }, update: {}, create: { name } });
}

async function upsertContact(data) {
  return prisma.contact.upsert({ where: { email: data.email }, update: {}, create: data });
}

async function upsertProduct(data) {
  const existing = await prisma.product.findFirst({ where: { name: data.name } });
  if (existing) return existing;
  return prisma.product.create({ data });
}

async function upsertAnalyticAccount(name, type) {
  const existing = await prisma.analyticAccount.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.analyticAccount.create({ data: { name, type } });
}

async function upsertSettings(data) {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: 1, ...data } });
}

async function upsertUser({ name, loginId, email, password, role, contactId }) {
  const existing = await prisma.user.findUnique({ where: { loginId } });
  if (existing) return existing;
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { name, loginId, email, password: hashed, role, contactId: contactId || null } });
}

async function main() {
  // ── Chart of accounts ──────────────────────────────────────────────────
  console.log('Seeding chart of accounts...');

  const purchaseExpense = await upsertAccount('Purchase Expense', 'EXPENSE');
  const creditors       = await upsertAccount('Creditors', 'LIABILITY');
  const debtors         = await upsertAccount('Debtors', 'ASSET');
  const saleIncome      = await upsertAccount('Sale Income', 'INCOME');
  const cash            = await upsertAccount('Cash', 'CASH');
  const bank            = await upsertAccount('Bank', 'BANK');
  await upsertAccount('Capital', 'CAPITAL');
  await upsertAccount('Other Expense', 'OTHER_EXPENSE');
  await upsertAccount('CGST Input', 'ASSET');
  await upsertAccount('SGST Input', 'ASSET');
  await upsertAccount('IGST Input', 'ASSET');
  await upsertAccount('CGST Output', 'LIABILITY');
  await upsertAccount('SGST Output', 'LIABILITY');
  await upsertAccount('IGST Output', 'LIABILITY');

  // ── Company settings ────────────────────────────────────────────────────
  console.log('Seeding company settings...');

  await upsertSettings({ companyState: 'Maharashtra' });

  // ── Journals ────────────────────────────────────────────────────────────
  console.log('Seeding journals...');

  await upsertJournal('Sales Journal', 'SALES', saleIncome.id);
  await upsertJournal('Purchase Journal', 'PURCHASE', purchaseExpense.id);
  await upsertJournal('Bank Journal', 'BANK', bank.id);
  await upsertJournal('Cash Journal', 'CASH', cash.id);

  // ── Product categories ──────────────────────────────────────────────────
  console.log('Seeding product categories...');

  const categories = {};
  for (const name of ['Chairs & Seating', 'Tables & Desks', 'Sofas & Recliners', 'Storage & Shelving', 'Bedroom Furniture', 'Office Furniture', 'Outdoor & Patio', 'Raw Materials']) {
    categories[name] = await upsertProductCategory(name);
  }

  // ── Products ─────────────────────────────────────────────────────────────
  console.log('Seeding products...');

  const productDefs = [
    // Chairs & Seating
    ['Sheesham Wood Dining Chair', 'GOODS', 2200, 3499, 'Chairs & Seating'],
    ['Ergonomic Mesh Office Chair', 'GOODS', 3800, 5999, 'Chairs & Seating'],
    ['Classic Rocking Chair (Teak)', 'GOODS', 4500, 6999, 'Chairs & Seating'],
    ['Bar Stool - Walnut Finish', 'GOODS', 1600, 2499, 'Chairs & Seating'],
    ['Recliner Chair - Faux Leather', 'GOODS', 8500, 12999, 'Chairs & Seating'],
    // Tables & Desks
    ['6-Seater Solid Wood Dining Table', 'GOODS', 18000, 27999, 'Tables & Desks'],
    ['Glass Top Coffee Table', 'GOODS', 5200, 8499, 'Tables & Desks'],
    ['Study Table with Drawer', 'GOODS', 4200, 6499, 'Tables & Desks'],
    ['Adjustable Height Standing Desk', 'GOODS', 9500, 14999, 'Tables & Desks'],
    ['Console Table - Mango Wood', 'GOODS', 6800, 10499, 'Tables & Desks'],
    // Sofas & Recliners
    ['3-Seater Fabric Sofa', 'GOODS', 22000, 34999, 'Sofas & Recliners'],
    ['L-Shaped Sectional Sofa (Grey)', 'GOODS', 38000, 57999, 'Sofas & Recliners'],
    ['2-Seater Leather Loveseat', 'GOODS', 26000, 39999, 'Sofas & Recliners'],
    ['Sofa Cum Bed - Convertible', 'GOODS', 19500, 29999, 'Sofas & Recliners'],
    // Storage & Shelving
    ['5-Tier Bookshelf Unit', 'GOODS', 5400, 8499, 'Storage & Shelving'],
    ['3-Door Wardrobe (Engineered Wood)', 'GOODS', 14500, 21999, 'Storage & Shelving'],
    ['Shoe Rack Cabinet', 'GOODS', 2800, 4499, 'Storage & Shelving'],
    ['TV Entertainment Unit', 'GOODS', 8200, 12999, 'Storage & Shelving'],
    // Bedroom Furniture
    ['Queen Size Bed Frame (Sheesham)', 'GOODS', 16500, 24999, 'Bedroom Furniture'],
    ['King Size Bed Frame with Storage', 'GOODS', 24000, 35999, 'Bedroom Furniture'],
    ['Bunk Bed - Kids Bedroom', 'GOODS', 13500, 19999, 'Bedroom Furniture'],
    ['Memory Foam Mattress (Queen)', 'GOODS', 9800, 15999, 'Bedroom Furniture'],
    // Office Furniture
    ['Executive Office Desk', 'GOODS', 12500, 18999, 'Office Furniture'],
    ['4-Drawer Filing Cabinet', 'GOODS', 4600, 6999, 'Office Furniture'],
    ['Conference Table (8-Seater)', 'GOODS', 28000, 42999, 'Office Furniture'],
    // Outdoor & Patio
    ['Outdoor Patio Chair Set (2pc)', 'GOODS', 7200, 10999, 'Outdoor & Patio'],
    ['Garden Bench - Teak Wood', 'GOODS', 6500, 9999, 'Outdoor & Patio'],
    // Raw Materials (purchased for manufacturing, not resold at a markup)
    ['Teak Wood Plank', 'GOODS', 850, 850, 'Raw Materials'],
    ['Plywood Sheet (19mm)', 'GOODS', 1200, 1200, 'Raw Materials'],
    ['Upholstery Fabric (per meter)', 'GOODS', 350, 350, 'Raw Materials'],
    ['High-Density Foam Cushioning', 'GOODS', 500, 500, 'Raw Materials'],
    ['Furniture Assembly Service', 'SERVICE', 800, 1500, 'Raw Materials'],
  ];

  const products = {};
  for (const [name, type, cost, salesPrice, categoryName] of productDefs) {
    const gstRate = categoryName === 'Raw Materials' ? 12 : 18;
    products[name] = await upsertProduct({ name, type, cost, salesPrice, gstRate, categoryId: categories[categoryName].id });
  }

  // ── Analytic accounts ────────────────────────────────────────────────────
  console.log('Seeding analytic accounts...');

  const analytics = {
    retail: await upsertAnalyticAccount('Retail Showroom Sales', 'INCOME'),
    b2b: await upsertAnalyticAccount('B2B & Bulk Orders', 'INCOME'),
    online: await upsertAnalyticAccount('Online Store Sales', 'INCOME'),
    rawMaterial: await upsertAnalyticAccount('Raw Material Procurement', 'EXPENSE'),
    manufacturing: await upsertAnalyticAccount('Manufacturing & Assembly', 'EXPENSE'),
    marketing: await upsertAnalyticAccount('Marketing & Advertising', 'EXPENSE'),
  };

  // ── Contacts ─────────────────────────────────────────────────────────────
  console.log('Seeding contacts...');

  const vendors = {
    sunrise: await upsertContact({ name: 'Sunrise Wood Works', email: 'contact@sunrisewoodworks.example.com', phone: '9812345001', city: 'Saharanpur', state: 'Uttar Pradesh', country: 'India' }),
    coastal: await upsertContact({ name: 'Coastal Plywood & Hardware Co.', email: 'sales@coastalplywood.example.com', phone: '9812345002', city: 'Kochi', state: 'Kerala', country: 'India' }),
    metroFoam: await upsertContact({ name: 'Metro Foam & Upholstery Works', email: 'orders@metrofoam.example.com', phone: '9812345003', city: 'Ludhiana', state: 'Punjab', country: 'India' }),
    bharatSteel: await upsertContact({ name: 'Bharat Steel Fittings Pvt Ltd', email: 'info@bharatsteelfittings.example.com', phone: '9812345004', city: 'Faridabad', state: 'Haryana', country: 'India' }),
    balaji: await upsertContact({ name: 'Shree Balaji Timber Suppliers', email: 'timber@shreebalaji.example.com', phone: '9812345005', city: 'Jodhpur', state: 'Rajasthan', country: 'India' }),
  };

  const customers = {
    aarav: await upsertContact({ name: 'Aarav Mehta', email: 'aarav.mehta@example.com', phone: '9898765001', city: 'Mumbai', state: 'Maharashtra', country: 'India' }),
    priya: await upsertContact({ name: 'Priya Nair', email: 'priya.nair@example.com', phone: '9898765002', city: 'Bengaluru', state: 'Karnataka', country: 'India' }),
    rohan: await upsertContact({ name: 'Rohan Kapoor', email: 'rohan.kapoor@example.com', phone: '9898765003', city: 'New Delhi', state: 'Delhi', country: 'India' }),
    ananya: await upsertContact({ name: 'Ananya Iyer', email: 'ananya.iyer@example.com', phone: '9898765004', city: 'Chennai', state: 'Tamil Nadu', country: 'India' }),
    vikram: await upsertContact({ name: 'Vikram Desai', email: 'vikram.desai@example.com', phone: '9898765005', city: 'Ahmedabad', state: 'Gujarat', country: 'India' }),
    sneha: await upsertContact({ name: 'Sneha Reddy', email: 'sneha.reddy@example.com', phone: '9898765006', city: 'Hyderabad', state: 'Telangana', country: 'India' }),
    urbanLoft: await upsertContact({ name: 'The Urban Loft Interiors', email: 'hello@urbanloft.example.com', phone: '9898765007', city: 'Pune', state: 'Maharashtra', country: 'India' }),
    greenview: await upsertContact({ name: 'GreenView Apartments Society', email: 'admin@greenviewsociety.example.com', phone: '9898765008', city: 'Noida', state: 'Uttar Pradesh', country: 'India' }),
  };

  const staff = {
    meera: await upsertContact({ name: 'Meera Joshi', email: 'meera.joshi@cabin8.local', phone: '9900011001', city: 'Mumbai', state: 'Maharashtra', country: 'India' }),
    karan: await upsertContact({ name: 'Karan Malhotra', email: 'karan.malhotra@cabin8.local', phone: '9900011002', city: 'Mumbai', state: 'Maharashtra', country: 'India' }),
  };

  // ── Users ────────────────────────────────────────────────────────────────
  console.log('Seeding users...');

  await upsertUser({ name: 'Administrator', loginId: 'admin', email: 'admin@cabin8.local', password: 'Admin@123', role: 'ADMIN' });
  await upsertUser({ name: 'Meera Joshi', loginId: 'accountant', email: 'meera.joshi@cabin8.local', password: 'Account@123', role: 'ACCOUNTANT' });
  await upsertUser({ name: 'Aarav Mehta', loginId: 'aaravmehta', email: 'aarav.portal@example.com', password: 'Customer@123', role: 'USER', contactId: customers.aarav.id });

  // ── Sample transactions (only on a fresh, empty transactional dataset) ──
  const existingPOCount = await prisma.purchaseOrder.count();
  if (existingPOCount > 0) {
    console.log('Purchase orders already exist — skipping sample transaction seed.');
  } else {
    console.log('Seeding sample budgets...');

    await prisma.budget.create({
      data: {
        name: 'Q3 2026 Retail Sales Target', analyticAccountId: analytics.retail.id, responsibleId: staff.meera.id,
        startDate: new Date('2026-07-01'), endDate: new Date('2026-09-30'), committedAmount: 500000, status: 'CONFIRMED',
      },
    });
    await prisma.budget.create({
      data: {
        name: 'Q3 2026 Raw Material Procurement Budget', analyticAccountId: analytics.rawMaterial.id, responsibleId: staff.karan.id,
        startDate: new Date('2026-07-01'), endDate: new Date('2026-09-30'), committedAmount: 150000, status: 'CONFIRMED',
      },
    });
    await prisma.budget.create({
      data: {
        name: 'Annual Marketing Budget 2026', analyticAccountId: analytics.marketing.id, responsibleId: staff.meera.id,
        startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), committedAmount: 200000, status: 'DRAFT',
      },
    });

    console.log('Seeding sample purchase orders & vendor bills...');

    // PO1 — fully paid
    const po1 = await prisma.purchaseOrder.create({
      data: {
        poNumber: await nextPONumber(), vendorId: vendors.balaji.id, date: new Date('2026-08-05'), status: 'CONFIRMED',
        lines: { create: [
          { productId: products['Queen Size Bed Frame (Sheesham)'].id, analyticAccountId: analytics.manufacturing.id, qty: 3, unitPrice: 16500, total: 49500 },
          { productId: products['Furniture Assembly Service'].id, analyticAccountId: analytics.manufacturing.id, qty: 3, unitPrice: 800, total: 2400 },
        ] },
      },
    });
    const bill1 = await prisma.vendorBill.create({
      data: {
        billNumber: await nextBillNumber(), vendorBillNo: 'SBT-2026-0142', vendorId: vendors.balaji.id, poId: po1.id,
        billDate: new Date('2026-08-06'), dueDate: new Date('2026-09-05'), totalAmount: 51900, status: 'CONFIRMED',
        lines: { create: [
          { productId: products['Queen Size Bed Frame (Sheesham)'].id, analyticAccountId: analytics.manufacturing.id, qty: 3, unitPrice: 16500, total: 49500 },
          { productId: products['Furniture Assembly Service'].id, analyticAccountId: analytics.manufacturing.id, qty: 3, unitPrice: 800, total: 2400 },
        ] },
      },
    });
    await postVendorBill(bill1);
    const payment1 = await prisma.payment.create({
      data: { type: 'SEND', partnerId: vendors.balaji.id, billId: bill1.id, amount: 51900, method: 'BANK', date: new Date('2026-08-20'), note: 'Full settlement via NEFT' },
    });
    await prisma.vendorBill.update({ where: { id: bill1.id }, data: { amountPaid: 51900, status: 'PAID' } });
    await postBillPayment({ ...payment1, partnerId: vendors.balaji.id, billId: bill1.id });

    // PO2 — confirmed, billed, partially paid
    const po2 = await prisma.purchaseOrder.create({
      data: {
        poNumber: await nextPONumber(), vendorId: vendors.coastal.id, date: new Date('2026-08-18'), status: 'CONFIRMED',
        lines: { create: [
          { productId: products['Plywood Sheet (19mm)'].id, analyticAccountId: analytics.rawMaterial.id, qty: 25, unitPrice: 1200, total: 30000 },
          { productId: products['Teak Wood Plank'].id, analyticAccountId: analytics.rawMaterial.id, qty: 15, unitPrice: 850, total: 12750 },
        ] },
      },
    });
    const bill2 = await prisma.vendorBill.create({
      data: {
        billNumber: await nextBillNumber(), vendorBillNo: 'CPH-8891', vendorId: vendors.coastal.id, poId: po2.id,
        billDate: new Date('2026-08-19'), dueDate: new Date('2026-09-18'), totalAmount: 42750, status: 'CONFIRMED',
        lines: { create: [
          { productId: products['Plywood Sheet (19mm)'].id, analyticAccountId: analytics.rawMaterial.id, qty: 25, unitPrice: 1200, total: 30000 },
          { productId: products['Teak Wood Plank'].id, analyticAccountId: analytics.rawMaterial.id, qty: 15, unitPrice: 850, total: 12750 },
        ] },
      },
    });
    await postVendorBill(bill2);
    const payment2 = await prisma.payment.create({
      data: { type: 'SEND', partnerId: vendors.coastal.id, billId: bill2.id, amount: 20000, method: 'BANK', date: new Date('2026-08-28'), note: 'Partial advance payment' },
    });
    await prisma.vendorBill.update({ where: { id: bill2.id }, data: { amountPaid: 20000, status: 'CONFIRMED' } });
    await postBillPayment({ ...payment2, partnerId: vendors.coastal.id, billId: bill2.id });

    // PO3 — draft only
    await prisma.purchaseOrder.create({
      data: {
        poNumber: await nextPONumber(), vendorId: vendors.metroFoam.id, date: new Date('2026-09-01'), status: 'DRAFT',
        lines: { create: [
          { productId: products['Upholstery Fabric (per meter)'].id, analyticAccountId: analytics.rawMaterial.id, qty: 40, unitPrice: 350, total: 14000 },
          { productId: products['High-Density Foam Cushioning'].id, analyticAccountId: analytics.rawMaterial.id, qty: 20, unitPrice: 500, total: 10000 },
        ] },
      },
    });

    // PO4 — confirmed, not yet billed
    await prisma.purchaseOrder.create({
      data: {
        poNumber: await nextPONumber(), vendorId: vendors.bharatSteel.id, date: new Date('2026-09-02'), status: 'CONFIRMED',
        lines: { create: [
          { productId: products['4-Drawer Filing Cabinet'].id, analyticAccountId: analytics.manufacturing.id, qty: 6, unitPrice: 4600, total: 27600 },
        ] },
      },
    });

    console.log('Seeding sample sales orders & customer invoices...');

    // SO1 — fully paid
    const so1 = await prisma.salesOrder.create({
      data: {
        soNumber: await nextSONumber(), customerId: customers.aarav.id, date: new Date('2026-08-10'), status: 'CONFIRMED',
        lines: { create: [
          { productId: products['3-Seater Fabric Sofa'].id, analyticAccountId: analytics.retail.id, qty: 1, unitPrice: 34999, total: 34999 },
          { productId: products['Glass Top Coffee Table'].id, analyticAccountId: analytics.retail.id, qty: 1, unitPrice: 8499, total: 8499 },
        ] },
      },
    });
    const invoice1 = await prisma.customerInvoice.create({
      data: {
        invoiceNumber: await nextInvoiceNumber(), invoiceRef: null, customerId: customers.aarav.id, soId: so1.id,
        invoiceDate: new Date('2026-08-11'), dueDate: new Date('2026-09-10'), totalAmount: 43498, status: 'CONFIRMED',
        lines: { create: [
          { productId: products['3-Seater Fabric Sofa'].id, analyticAccountId: analytics.retail.id, qty: 1, unitPrice: 34999, total: 34999 },
          { productId: products['Glass Top Coffee Table'].id, analyticAccountId: analytics.retail.id, qty: 1, unitPrice: 8499, total: 8499 },
        ] },
      },
    });
    await postCustomerInvoice(invoice1);
    const receipt1 = await prisma.payment.create({
      data: { type: 'RECEIVE', partnerId: customers.aarav.id, invoiceId: invoice1.id, amount: 43498, method: 'BANK', date: new Date('2026-08-15'), note: 'Paid in full via UPI' },
    });
    await prisma.customerInvoice.update({ where: { id: invoice1.id }, data: { amountPaid: 43498, status: 'PAID' } });
    await postInvoicePayment({ ...receipt1, partnerId: customers.aarav.id, invoiceId: invoice1.id });

    // SO2 — B2B order, confirmed & invoiced, outstanding
    const so2 = await prisma.salesOrder.create({
      data: {
        soNumber: await nextSONumber(), customerId: customers.urbanLoft.id, date: new Date('2026-08-25'), status: 'CONFIRMED',
        lines: { create: [
          { productId: products['Ergonomic Mesh Office Chair'].id, analyticAccountId: analytics.b2b.id, qty: 8, unitPrice: 5999, total: 47992 },
          { productId: products['Executive Office Desk'].id, analyticAccountId: analytics.b2b.id, qty: 4, unitPrice: 18999, total: 75996 },
        ] },
      },
    });
    const invoice2 = await prisma.customerInvoice.create({
      data: {
        invoiceNumber: await nextInvoiceNumber(), invoiceRef: 'PO-UL-2026-77', customerId: customers.urbanLoft.id, soId: so2.id,
        invoiceDate: new Date('2026-08-26'), dueDate: new Date('2026-09-25'), totalAmount: 123988, status: 'CONFIRMED',
        lines: { create: [
          { productId: products['Ergonomic Mesh Office Chair'].id, analyticAccountId: analytics.b2b.id, qty: 8, unitPrice: 5999, total: 47992 },
          { productId: products['Executive Office Desk'].id, analyticAccountId: analytics.b2b.id, qty: 4, unitPrice: 18999, total: 75996 },
        ] },
      },
    });
    await postCustomerInvoice(invoice2);
    const receipt2 = await prisma.payment.create({
      data: { type: 'RECEIVE', partnerId: customers.urbanLoft.id, invoiceId: invoice2.id, amount: 60000, method: 'BANK', date: new Date('2026-09-01'), note: 'Partial payment received' },
    });
    await prisma.customerInvoice.update({ where: { id: invoice2.id }, data: { amountPaid: 60000, status: 'CONFIRMED' } });
    await postInvoicePayment({ ...receipt2, partnerId: customers.urbanLoft.id, invoiceId: invoice2.id });

    // SO3 — draft
    await prisma.salesOrder.create({
      data: {
        soNumber: await nextSONumber(), customerId: customers.priya.id, date: new Date('2026-09-03'), status: 'DRAFT',
        lines: { create: [
          { productId: products['Queen Size Bed Frame (Sheesham)'].id, analyticAccountId: analytics.retail.id, qty: 1, unitPrice: 24999, total: 24999 },
          { productId: products['Memory Foam Mattress (Queen)'].id, analyticAccountId: analytics.retail.id, qty: 1, unitPrice: 15999, total: 15999 },
        ] },
      },
    });

    // SO4 — confirmed, not yet invoiced
    await prisma.salesOrder.create({
      data: {
        soNumber: await nextSONumber(), customerId: customers.greenview.id, date: new Date('2026-09-04'), status: 'CONFIRMED',
        lines: { create: [
          { productId: products['5-Tier Bookshelf Unit'].id, analyticAccountId: analytics.b2b.id, qty: 12, unitPrice: 8499, total: 101988 },
        ] },
      },
    });

    // SO5 — draft, no line-level activity yet
    await prisma.salesOrder.create({
      data: {
        soNumber: await nextSONumber(), customerId: customers.vikram.id, date: new Date('2026-09-05'), status: 'DRAFT',
        lines: { create: [
          { productId: products['Recliner Chair - Faux Leather'].id, analyticAccountId: analytics.retail.id, qty: 2, unitPrice: 12999, total: 25998 },
        ] },
      },
    });
  }

  console.log('Seed complete.');
  console.log('Admin login: "admin" / "Admin@123"');
  console.log('Accountant login: "accountant" / "Account@123"');
  console.log('Portal (customer) login: "aaravmehta" / "Customer@123"');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
