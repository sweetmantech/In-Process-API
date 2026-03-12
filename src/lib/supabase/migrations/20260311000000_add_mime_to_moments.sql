ALTER TABLE "public"."in_process_moments"
  ADD COLUMN IF NOT EXISTS "mime" text;
