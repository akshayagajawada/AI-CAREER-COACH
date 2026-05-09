-- Add translations jsonb field to Resume
ALTER TABLE "Resume" ADD COLUMN IF NOT EXISTS "translations" jsonb;

-- Note: Reverting this migration would drop the column (data loss)
-- To revert: ALTER TABLE "Resume" DROP COLUMN IF EXISTS "translations";