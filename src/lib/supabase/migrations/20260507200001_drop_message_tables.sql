-- Rewrite moment_matches_channel to use in_process_moments.channel directly
-- instead of joining in_process_message_moment → in_process_messages → in_process_message_metadata.
CREATE OR REPLACE FUNCTION public.moment_matches_channel(p_moment_id uuid, p_channel text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT
    p_channel IS NULL
    OR (
      p_channel != 'web'
      AND EXISTS (
        SELECT 1 FROM public.in_process_moments m
        WHERE m.id = p_moment_id AND m.channel = p_channel
      )
    )
    OR (
      p_channel = 'web'
      AND EXISTS (
        SELECT 1 FROM public.in_process_moments m
        WHERE m.id = p_moment_id AND m.channel IS NULL
      )
    )
$$;

-- Rewrite get_nudges to use account_notifications.telegram_chat_id and last_nudge_sent_at
-- instead of querying in_process_messages / in_process_message_metadata.
DROP FUNCTION IF EXISTS public.get_nudges();

CREATE FUNCTION public.get_nudges()
RETURNS TABLE (
  artist_address         text,
  chat_id                text,
  days_since_last_moment integer,
  nudge_period           integer
)
LANGUAGE sql
STABLE
AS $function$
  WITH nudge_artists AS (
    SELECT an.artist_address, an.nudge_period, an.telegram_chat_id, an.last_nudge_sent_at
    FROM public.account_notifications an
    WHERE an.nudge_period IS NOT NULL
      AND an.telegram_chat_id IS NOT NULL
      AND an.telegram_chat_id <> ''
  ),
  inactive_artists AS (
    SELECT
      na.artist_address,
      na.nudge_period,
      na.telegram_chat_id,
      na.last_nudge_sent_at,
      (extract(epoch from now() - MAX(m.created_at)) / 86400)::integer AS days_inactive
    FROM nudge_artists na
    INNER JOIN public.in_process_collections c ON c.creator = na.artist_address
    INNER JOIN public.in_process_moments m ON m.collection = c.id
    GROUP BY na.artist_address, na.nudge_period, na.telegram_chat_id, na.last_nudge_sent_at
    HAVING MAX(m.created_at) <= now() - make_interval(days => na.nudge_period)
  )
  SELECT
    ia.artist_address,
    ia.telegram_chat_id AS chat_id,
    ia.days_inactive,
    ia.nudge_period
  FROM inactive_artists ia
  WHERE ia.last_nudge_sent_at IS NULL
     OR ia.last_nudge_sent_at < now() - make_interval(days => GREATEST(ia.nudge_period, 2));
$function$;

-- Drop tables in FK order: message_moment first (references both messages and moments),
-- then messages (references metadata), then metadata.
DROP TABLE IF EXISTS public.in_process_message_moment;
DROP TABLE IF EXISTS public.in_process_messages;
DROP TABLE IF EXISTS public.in_process_message_metadata;

-- Drop enum types that were only used by the dropped tables.
DROP TYPE IF EXISTS public.message_client;
DROP TYPE IF EXISTS public.message_role;
