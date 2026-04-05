import type { Thread } from 'chat';
import { IS_TESTNET, SITE_ORIGINAL_URL } from '@/lib/consts';
import fetchArtistCollageBuffer from '@/lib/telegram/fetchArtistCollageBuffer';

const COLLAGE_DELAY_MS = 10_000;

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
    const formData = new FormData();
    formData.append('chat_id', thread.channelId);
    formData.append(
      'photo',
      new Blob([collage.buffer as ArrayBuffer], { type: 'image/png' }),
      'collage.png'
    );
    formData.append('caption', '🎨 collage 🎨');
    await (thread.adapter as any).telegramFetch('sendPhoto', formData);
  }
};

export default replyAfterSuccess;
