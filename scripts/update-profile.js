import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Replace with your actual email
  const email = process.env.USER_EMAIL || 'your-email@example.com';

  console.log(`Looking for user with email: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ User not found for email: ${email}`);
    process.exit(1);
  }

  console.log(`✓ Found user: ${user.name} (ID: ${user.id})`);

  // Update user profile
  // Set industry to null to re-enable onboarding, or set to a new industry
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      industry: null, // Set to null to re-run onboarding, or set to 'tech-software-development'
      bio: process.env.USER_BIO || 'Updated professional bio',
      experience: parseInt(process.env.USER_EXPERIENCE || '5', 10),
      skills: process.env.USER_SKILLS 
        ? process.env.USER_SKILLS.split(',').map(s => s.trim())
        : ['JavaScript', 'React', 'Node.js'],
    },
  });

  console.log('✓ Profile updated successfully!');
  console.log('Updated data:', {
    name: updated.name,
    email: updated.email,
    industry: updated.industry,
    bio: updated.bio,
    experience: updated.experience,
    skills: updated.skills,
  });

  console.log('\n📝 Next steps:');
  if (!updated.industry) {
    console.log('1. Visit http://localhost:3000/onboarding');
    console.log('2. Complete the onboarding form with your new details');
  } else {
    console.log('1. Your profile has been updated directly');
    console.log('2. Visit http://localhost:3000/dashboard to see changes');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
