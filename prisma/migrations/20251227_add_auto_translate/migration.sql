-- Migration: add_auto_translate
-- Adds a Boolean column `autoTranslate` to the User table with default true

BEGIN;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "autoTranslate" boolean NOT NULL DEFAULT true;

-- Ensure existing rows have true
UPDATE "User"
  SET "autoTranslate" = true
  WHERE "autoTranslate" IS NULL;

COMMIT;