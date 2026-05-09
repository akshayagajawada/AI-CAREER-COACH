const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clerkUserId = process.env.TEST_CLERK_USER_ID || 'local-test-user-1';
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error('Test user not found; run test-save-resume.js first');

  const translations = {
    en: '# Resume (EN)\n\nContent in English',
    fr: '# CV (FR)\n\nContenu en Français',
  };

  const resume = await prisma.resume.upsert({
    where: { userId: user.id },
    update: { translations, content: translations.en },
    create: { userId: user.id, content: translations.en, translations },
  });

  console.log('Upserted translations:', resume.id, resume.translations);

  const fetched = await prisma.resume.findUnique({ where: { userId: user.id } });
  console.log('Fetched translations:', fetched.translations);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });