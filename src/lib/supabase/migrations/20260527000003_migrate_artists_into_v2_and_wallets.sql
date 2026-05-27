-- Copy artists with the same username into a single in_process_artists_v2 row,
-- taking the first non-null value per column across duplicates.
INSERT INTO in_process_artists_v2 (address, username, bio, x, telegram, instagram)
SELECT
  MIN(address),
  username,
  (array_remove(array_agg(bio              ORDER BY address), NULL))[1],
  (array_remove(array_agg(twitter_username  ORDER BY address), NULL))[1],
  (array_remove(array_agg(telegram_username ORDER BY address), NULL))[1],
  (array_remove(array_agg(instagram_username ORDER BY address), NULL))[1]
FROM in_process_artists
WHERE username IS NOT NULL
GROUP BY username;

INSERT INTO in_process_artists_v2 (address, username, bio, x, telegram, instagram)
SELECT address, NULL, bio, twitter_username, telegram_username, instagram_username
FROM in_process_artists
WHERE username IS NULL;

INSERT INTO in_process_wallets (address, artist, type)
SELECT
  old.address,
  COALESCE(
    (SELECT v2.id FROM in_process_artists_v2 v2 WHERE v2.username = old.username LIMIT 1),
    (SELECT v2.id FROM in_process_artists_v2 v2 WHERE v2.address  = old.address  LIMIT 1)
  ),
  NULL
FROM in_process_artists old;

UPDATE in_process_wallets w
SET smart_wallet_address = old.smart_wallet
FROM in_process_artists old
WHERE w.address = old.address
  AND old.smart_wallet IS NOT NULL;
