const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.join(process.cwd(), 'prisma/dev.db') });
const prisma = new PrismaClient({ adapter });

async function run() {
  const email = process.argv[2];
  let user;
  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
    if (!user) { console.log('לא נמצא משתמש עם אימייל:', email); process.exit(1); }
  } else {
    // default: oldest user
    user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!user) { console.log('אין משתמשים במערכת'); process.exit(1); }
  }
  await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
  console.log('✓', user.name, '(' + user.email + ') הוגדר כמנהל');
  await prisma.$disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
