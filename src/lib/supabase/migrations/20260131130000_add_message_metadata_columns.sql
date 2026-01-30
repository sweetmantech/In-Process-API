-- Add telegram_username, phone_number columns and make artist_address nullable
alter table "public"."in_process_message_metadata"
  add column "telegram_username" text,
  add column "phone_number" text;

-- Make artist_address nullable
alter table "public"."in_process_message_metadata"
  alter column "artist_address" drop not null;
