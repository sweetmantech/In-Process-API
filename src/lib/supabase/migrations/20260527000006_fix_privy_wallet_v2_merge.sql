UPDATE in_process_wallets w
SET artist = (
  SELECT v2.id
  FROM in_process_artists_v2 v2
  JOIN in_process_artist_social_wallets sw ON v2.address = sw.artist_address
  WHERE sw.social_wallet = w.address
  LIMIT 1
)
WHERE w.address IN (
  SELECT sw.social_wallet
  FROM in_process_artist_social_wallets sw
  WHERE EXISTS (
    SELECT 1 FROM in_process_artists WHERE address = sw.artist_address
  )
);

DELETE FROM in_process_artists_v2
WHERE address IN (
  SELECT sw.social_wallet
  FROM in_process_artist_social_wallets sw
  WHERE EXISTS (
    SELECT 1 FROM in_process_artists WHERE address = sw.artist_address
  )
);
