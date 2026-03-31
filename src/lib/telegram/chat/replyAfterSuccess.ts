import type { Thread } from 'chat';
import { IS_TESTNET, SITE_ORIGINAL_URL } from '@/lib/consts';
import fetchArtistCollageBuffer from '@/lib/telegram/fetchArtistCollageBuffer';

const COLLAGE_DELAY_MS = 10_000;

const sendCollagePhoto = async (
  chatId: string,
  photo: Buffer
): Promise<void> => {
  const token = process.env.TELEGRAM_CHAT_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_CHAT_BOT_TOKEN is not set');
  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append(
    'photo',
    new Blob([photo.buffer as ArrayBuffer], { type: 'image/png' }),
    'collage.png'
  );
  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`sendPhoto failed: ${body}`);
  }
};

const replyAfterSuccess = async (
  thread: Thread,
  contractAddress: string,
  tokenId: string,
  artistAddress: string,
  collageIncluded = true
) => {
  const chain = IS_TESTNET ? 'bsep' : 'base';
  const successMessage = `✅ Moment created! ${SITE_ORIGINAL_URL}/collect/${chain}:${contractAddress}/${tokenId}`;

  await new Promise((resolve) => setTimeout(resolve, COLLAGE_DELAY_MS));

  await thread.post(successMessage);
  const collage = collageIncluded
    ? await fetchArtistCollageBuffer(artistAddress)
    : null;
  if (collage) {
    await sendCollagePhoto(thread.channelId, collage);
  }
};

export default replyAfterSuccess;
