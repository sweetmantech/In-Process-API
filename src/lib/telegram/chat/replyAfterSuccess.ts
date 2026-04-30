import type { Thread } from 'chat';
import getMomentSuccessMessage from '@/lib/moment/getMomentSuccessMessage';
import fetchArtistCollageBuffer from '@/lib/telegram/fetchArtistCollageBuffer';

const COLLAGE_DELAY_MS = 30_000;

const replyAfterSuccess = async (
  thread: Thread,
  contractAddress: string,
  tokenId: string,
  artistAddress: string,
  collageIncluded = true
) => {
  const successMessage = getMomentSuccessMessage(contractAddress, tokenId);

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
    formData.append(
      'caption',
      `See your latest moments at https://inprocess.world/${artistAddress}`
    );
    await (thread.adapter as any).telegramFetch('sendPhoto', formData);
  }
};

export default replyAfterSuccess;
