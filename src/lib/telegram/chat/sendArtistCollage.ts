import type { Thread } from 'chat';
import pollArtistCollage from '@/lib/telegram/pollArtistCollage';
import parseTelegramChatId from '@/lib/telegram/parseTelegramChatId';

const sendArtistCollage = async (
  thread: Thread,
  artistAddress: string
): Promise<void> => {
  const collage = await pollArtistCollage(artistAddress);
  if (!collage) return;

  const formData = new FormData();
  formData.append('chat_id', parseTelegramChatId(thread.channelId));
  formData.append(
    'photo',
    new Blob([collage.buffer as ArrayBuffer], { type: 'image/png' }),
    'collage.png'
  );
  formData.append(
    'caption',
    `See your latest moments at https://inprocess.world/${artistAddress}`
  );
  await (thread.adapter as any).telegramFetch('sendPhoto', formData);
};

export default sendArtistCollage;
