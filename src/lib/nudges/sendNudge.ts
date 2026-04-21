import telegramChatBot from '@/lib/telegram/chat/bot';
import { logMessage } from '@/lib/messages/logMessage';

const sendNudge = async ({
  roomId,
  artistAddress,
  daysSinceLastMoment,
}: {
  roomId: string;
  artistAddress: string;
  daysSinceLastMoment: number;
}) => {
  const text = `Hi! It's been ${daysSinceLastMoment} day${daysSinceLastMoment === 1 ? '' : 's'} since you last posted. You've probably been cooking - is there anything you can post on In Process?`;
  await telegramChatBot.channel(roomId).post(text);
  await logMessage(
    [{ type: 'text', text }],
    'assistant',
    roomId,
    artistAddress,
    'telegram'
  );
};

export default sendNudge;
