require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  const email = process.argv[2];
  let user;
  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
    if (!user) { console.log('לא נמצא משתמש עם אימייל:', email); process.exit(1); }
  } else {
    user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!user) { console.log('אין משתמשים במערכת'); process.exit(1); }
  }
  await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
  console.log('OK:', user.name, '(' + user.email + ') is now admin');
  await prisma.$disconnect();
}

run().catch((e) => { console.error(e.message); process.exit(1); });
