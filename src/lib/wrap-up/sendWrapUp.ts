import { telegramChatBotClient } from '@/lib/telegram/client';
import { WRAP_UP_CHANNEL_LABELS } from '@/lib/consts';

const sendWrapUp = async ({
  chatId,
  username,
  telegramCount,
  webCount,
  apiCount,
  smsCount,
}: {
  chatId: string;
  username: string;
  telegramCount: number;
  webCount: number;
  apiCount: number;
  smsCount: number;
}) => {
  const total = telegramCount + webCount + apiCount + smsCount;

  const channelLines = (
    [
      ['telegram', telegramCount],
      ['web', webCount],
      ['api', apiCount],
      ['sms', smsCount],
    ] as [string, number][]
  )
    .filter(([, count]) => count > 0)
    .map(([channel, count]) => `${WRAP_UP_CHANNEL_LABELS[channel]}: ${count}`)
    .join('\n');

  const text = [
    `📊 Weekly Wrap-Up 📊`,
    ``,
    `Great week, @${username}! You posted ${total} moment${total === 1 ? '' : 's'} this week.`,
    ``,
    channelLines,
    ``,
    `Keep creating. See you next Friday! 🙌`,
  ].join('\n');

  await telegramChatBotClient.sendMessage(chatId, text);
};

export default sendWrapUp;
