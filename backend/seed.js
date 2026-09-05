require('dotenv').config();

const bcrypt = require('bcryptjs');
const prisma = require('./src/core/prismaClient');

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
  return prisma.productCategory.upsert({
    where: { name },
    update: {},
    create: { name }
  });
}

async function upsertContact(data) {
  return prisma.contact.upsert({
    where: { email: data.email },
    update: {},
    create: data
  });
}

async function main() {
  console.log('Seeding chart of accounts...');

  const purchaseExpense = await upsertAccount('Purchase Expense', 'EXPENSE');
  const creditors       = await upsertAccount('Creditors', 'LIABILITY');
  const debtors         = await upsertAccount('Debtors', 'ASSET');
  const saleIncome      = await upsertAccount('Sale Income', 'INCOME');
  const cash            = await upsertAccount('Cash', 'CASH');
  const bank            = await upsertAccount('Bank', 'BANK');
  await upsertAccount('Capital', 'CAPITAL');
  await upsertAccount('Other Expense', 'OTHER_EXPENSE');

  console.log('Seeding journals...');

  await upsertJournal('Sales Journal', 'SALES', saleIncome.id);
  await upsertJournal('Purchase Journal', 'PURCHASE', purchaseExpense.id);
  await upsertJournal('Bank Journal', 'BANK', bank.id);
  await upsertJournal('Cash Journal', 'CASH', cash.id);

  console.log('Seeding admin user...');

  const adminExists = await prisma.user.findUnique({ where: { loginId: 'admin' } });
  if (!adminExists) {
    const hashed = await bcrypt.hash('Admin@123', 10);
    await prisma.user.create({
      data: {
        name: 'Administrator',
        loginId: 'admin',
        email: 'admin@cabin8.local',
        password: hashed,
        role: 'ADMIN'
      }
    });
  }

  console.log('Seeding sample masters...');

  await upsertProductCategory('Furniture');
  await upsertProductCategory('Raw Materials');

  await upsertContact({
    name: 'Sample Vendor',
    email: 'vendor@example.com',
    phone: '9999999999',
    city: 'Delhi',
    country: 'India'
  });

  await upsertContact({
    name: 'Sample Customer',
    email: 'customer@example.com',
    phone: '8888888888',
    city: 'Mumbai',
    country: 'India'
  });

  console.log('Seed complete.');
  console.log('Login with loginId "admin" / password "Admin@123"');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
