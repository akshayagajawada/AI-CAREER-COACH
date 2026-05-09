require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create or find a test user
  const clerkUserId = process.env.TEST_CLERK_USER_ID || 'local-test-user-1';
  const email = process.env.TEST_USER_EMAIL || 'local-test-user+1@example.com';

  let user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkUserId,
        email,
        name: 'Local Test User',
      },
    });
    console.log('Created test user:', user.id);
  } else {
    console.log('Found test user:', user.id);
  }

  const content = `# Test Resume\n\nSaved at ${new Date().toISOString()}\n\n- Item A\n- Item B`;

  const resume = await prisma.resume.upsert({
    where: { userId: user.id },
    update: { content },
    create: { userId: user.id, content },
  });

  console.log('Upserted resume:', resume.id, resume.content.slice(0, 100));

  const fetched = await prisma.resume.findUnique({ where: { userId: user.id } });
  console.log('Fetched resume content:', fetched.content.slice(0, 200));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });