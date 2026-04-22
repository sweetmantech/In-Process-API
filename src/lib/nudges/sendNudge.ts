import { telegramChatBotClient } from '@/lib/telegram/client';
import { logMessage } from '@/lib/messages/logMessage';

const sendNudge = async ({
  chatId,
  artistAddress,
  daysSinceLastMoment,
}: {
  chatId: string;
  artistAddress: string;
  daysSinceLastMoment: number;
}) => {
  const text = `Hi! It's been ${daysSinceLastMoment} day${daysSinceLastMoment === 1 ? '' : 's'} since you last posted. You've probably been cooking - is there anything you can post on In Process?`;
  await telegramChatBotClient.sendMessage(chatId, text);
  await logMessage(
    [{ type: 'text', text }],
    'assistant',
    chatId,
    artistAddress,
    'telegram'
  );
};

export default sendNudge;
