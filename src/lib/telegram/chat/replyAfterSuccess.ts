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
    await thread.post({
      markdown: '🎨 Your collage',
      attachments: [
        {
          data: collage,
          name: `collage you have ever posted.png`,
          mimeType: 'image/png',
          type: 'image',
        },
      ],
    });
  }
};

export default replyAfterSuccess;
