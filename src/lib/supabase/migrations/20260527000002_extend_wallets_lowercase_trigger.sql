DROP TRIGGER IF EXISTS wallets_lowercase_address ON in_process_wallets;
DROP FUNCTION IF EXISTS trg_wallets_lowercase_address();

CREATE OR REPLACE FUNCTION trg_wallets_lowercase_address()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.address := lower(NEW.address);
  IF NEW.smart_wallet_address IS NOT NULL THEN
    NEW.smart_wallet_address := lower(NEW.smart_wallet_address);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER wallets_lowercase_address
  BEFORE INSERT OR UPDATE ON in_process_wallets
  FOR EACH ROW EXECUTE FUNCTION trg_wallets_lowercase_address();
