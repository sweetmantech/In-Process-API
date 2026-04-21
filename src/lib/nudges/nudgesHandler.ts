import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import sendNudge from '@/lib/nudges/sendNudge';

const nudgesHandler = async () => {
  const { data: targets, error } = await supabase.rpc('get_daily_nudges');
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const results = await Promise.all(
    (targets ?? []).map(
      async ({ artist_address, chat_id, days_since_last_moment }) => {
        try {
          await sendNudge({
            chatId: chat_id,
            artistAddress: artist_address,
            daysSinceLastMoment: days_since_last_moment,
          });
          return {
            artist: artist_address,
            chatId: chat_id,
            sent: true as const,
          };
        } catch (e: any) {
          return {
            artist: artist_address,
            chatId: chat_id,
            sent: false as const,
            error: e?.message ?? 'unknown',
          };
        }
      }
    )
  );

  return NextResponse.json({
    status: 'success',
    total: results.length,
    sent: results.filter((r) => r.sent).length,
    results,
  });
};

export default nudgesHandler;
