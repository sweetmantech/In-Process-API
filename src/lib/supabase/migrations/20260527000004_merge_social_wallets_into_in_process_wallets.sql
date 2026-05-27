DO $$
DECLARE
  sw          RECORD;
  a_uuid      uuid;
  b_uuid      uuid;
  b_username  text;
  b_bio       text;
  b_x         text;
  b_telegram  text;
  b_instagram text;
BEGIN
  FOR sw IN SELECT * FROM in_process_artist_social_wallets LOOP
    SELECT artist INTO a_uuid
    FROM in_process_wallets
    WHERE address = lower(sw.social_wallet);

    SELECT artist INTO b_uuid
    FROM in_process_wallets
    WHERE address = lower(sw.artist_address);

    CONTINUE WHEN a_uuid IS NULL OR b_uuid IS NULL OR a_uuid = b_uuid;

    SELECT username, bio, x, telegram, instagram
    INTO b_username, b_bio, b_x, b_telegram, b_instagram
    FROM in_process_artists_v2
    WHERE id = b_uuid;

    -- Null out B's unique fields before merging to avoid UNIQUE constraint violation
    UPDATE in_process_artists_v2 SET username = NULL WHERE id = b_uuid;

    UPDATE in_process_artists_v2
    SET
      username  = COALESCE(username, b_username),
      bio       = COALESCE(bio, b_bio),
      x         = COALESCE(x, b_x),
      telegram  = COALESCE(telegram, b_telegram),
      instagram = COALESCE(instagram, b_instagram)
    WHERE id = a_uuid;

    UPDATE in_process_wallets SET artist = a_uuid WHERE artist = b_uuid;

    DELETE FROM in_process_artists_v2 WHERE id = b_uuid;

    INSERT INTO in_process_wallets (address, artist, type)
    VALUES (lower(sw.social_wallet), a_uuid, 'farcaster')
    ON CONFLICT (address) DO UPDATE SET artist = EXCLUDED.artist, type = 'farcaster';
  END LOOP;
END;
$$;
