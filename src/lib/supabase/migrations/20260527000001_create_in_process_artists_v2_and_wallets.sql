-- Step 1a: wallet_type enum
CREATE TYPE wallet_type AS ENUM ('privy', 'farcaster', 'external');

-- Step 1b: in_process_artists_v2
-- uuid PK, address kept for lookup until step 5 drop
CREATE TABLE in_process_artists_v2 (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address   text UNIQUE NOT NULL,
  username  text UNIQUE,
  bio       text,
  x         text,
  telegram  text,
  instagram text
);

-- Step 1c: in_process_wallets
CREATE TABLE in_process_wallets (
  address             text PRIMARY KEY,
  artist              uuid REFERENCES in_process_artists_v2(id),
  type                wallet_type,
  smart_wallet_address text
);

-- Step 1d: lowercase trigger on in_process_wallets.address at insert
CREATE OR REPLACE FUNCTION trg_wallets_lowercase_address()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.address := lower(NEW.address);
  RETURN NEW;
END;
$$;

CREATE TRIGGER wallets_lowercase_address
  BEFORE INSERT ON in_process_wallets
  FOR EACH ROW EXECUTE FUNCTION trg_wallets_lowercase_address();
