import { NextResponse } from 'next/server';
import getWeeklyWrapUpStats from '@/lib/supabase/account_notifications/getWeeklyWrapUpStats';
import sendWrapUp from '@/lib/wrap-up/sendWrapUp';

const wrapUpHandler = async (): Promise<NextResponse> => {
  const targets = await getWeeklyWrapUpStats();

  const results = await Promise.all(
    targets.map(
      async ({
        username,
        chat_id,
        telegram_count,
        web_count,
        api_count,
        sms_count,
      }) => {
        try {
          await sendWrapUp({
            chatId: chat_id,
            username,
            telegramCount: telegram_count,
            webCount: web_count,
            apiCount: api_count,
            smsCount: sms_count,
          });
          return { username, chatId: chat_id, sent: true as const };
        } catch (e: any) {
          return {
            username,
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

export default wrapUpHandler;
