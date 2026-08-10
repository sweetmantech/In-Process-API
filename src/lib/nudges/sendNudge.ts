import { telegramChatBotClient } from '@/lib/telegram/client';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';

const sendNudge = async ({
  chatId,
  wallet,
  daysSinceLastMoment,
}: {
  chatId: string;
  wallet: string;
  daysSinceLastMoment: number;
}) => {
  const text = `Hi! It's been ${daysSinceLastMoment} day${daysSinceLastMoment === 1 ? '' : 's'} since you last posted. You've probably been cooking - is there anything you can post on In Process?`;
  await telegramChatBotClient.sendMessage(chatId, text);
  await upsertAccountNotification({
    wallet,
    telegram_chat_id: chatId,
    last_nudge_sent_at: new Date().toISOString(),
  });
};

export default sendNudge;
