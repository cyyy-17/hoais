require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hoa.com' },
    update: { password: hash, role: 'SUPER_ADMIN' },
    create: { email: 'admin@hoa.com', name: 'Super Admin', password: hash, role: 'SUPER_ADMIN' }
  });
  console.log('Admin created:', admin.email);
}

run().catch(console.error).finally(() => prisma.$disconnect());
