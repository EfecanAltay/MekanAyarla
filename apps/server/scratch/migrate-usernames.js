const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { username: null }
  });

  console.log(`Found ${users.length} users with no username.`);

  for (const user of users) {
    if (user.email) {
      const username = user.email.split('@')[0];
      await prisma.user.update({
        where: { id: user.id },
        data: { username }
      });
      console.log(`Updated user ${user.email} to username ${username}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
