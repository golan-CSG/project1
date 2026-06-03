const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.join(process.cwd(), 'prisma/dev.db') });
const prisma = new PrismaClient({ adapter });

async function clean() {
  const f = await prisma.favorite.deleteMany();
  const w = await prisma.wantedPost.deleteMany();
  const l = await prisma.listing.deleteMany();
  const u = await prisma.user.deleteMany();
  console.log('נמחקו:', f.count, 'מועדפים,', w.count, 'בקשות,', l.count, 'מודעות,', u.count, 'משתמשים');
  await prisma.$disconnect();
}

clean().catch(e => { console.error(e); process.exit(1); });
