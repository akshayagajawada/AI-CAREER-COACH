-- Migration: add_resume_translations
-- Adds a JSONB column `translations` to the Resume table and backfills it with existing content.

BEGIN;

ALTER TABLE "Resume"
  ADD COLUMN IF NOT EXISTS "translations" jsonb;

-- Backfill existing rows: store current `content` as the English ('en') translation
UPDATE "Resume"
  SET "translations" = jsonb_build_object('en', "content")
  WHERE "translations" IS NULL;

COMMIT;