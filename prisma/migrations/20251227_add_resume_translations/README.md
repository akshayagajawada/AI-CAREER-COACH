Migration: add_resume_translations

What this does
- Adds a nullable `translations` JSONB column to the `Resume` table
- Backfills existing rows by copying `content` into `translations.en`

How to apply locally (interactive dev)
1. Ensure your `.env` has DATABASE_URL set
2. Run:
   npx prisma migrate dev --name add_resume_translations
3. Verify with:
   npx prisma db pull
   npx prisma studio

How to apply in non-interactive / CI environments
- Use `npx prisma migrate deploy` to apply existing SQL migration files during deploy.
- The SQL file in this directory is a standalone migration that can be applied by your CI or DB admin.

Notes
- If you see a Prisma error about `datasource.url` deprecation (Prisma 7+), see project docs and consider adding a `prisma.config.ts` for client configuration or lock your Prisma version to the one used by the project (check `package.json`).