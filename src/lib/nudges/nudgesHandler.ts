import { NextResponse } from 'next/server';
import getNudges from '@/lib/supabase/account_notifications/getNudges';
import sendNudge from '@/lib/nudges/sendNudge';

const nudgesHandler = async () => {
  const targets = await getNudges();

  const results = await Promise.all(
    targets.map(async ({ artist_id, chat_id, days_since_last_moment }) => {
      try {
        await sendNudge({
          chatId: chat_id,
          artistId: artist_id,
          daysSinceLastMoment: days_since_last_moment,
        });
        return {
          artist: artist_id,
          chatId: chat_id,
          sent: true as const,
        };
      } catch (e: any) {
        return {
          artist: artist_id,
          chatId: chat_id,
          sent: false as const,
          error: e?.message ?? 'unknown',
        };
      }
    })
  );

  return NextResponse.json({
    status: 'success',
    total: results.length,
    sent: results.filter((r) => r.sent).length,
    results,
  });
};

export default nudgesHandler;
