import type { Thread } from 'chat';
import { IS_TESTNET, SITE_ORIGINAL_URL } from '@/lib/consts';
import fetchArtistCollageBuffer from '@/lib/telegram/fetchArtistCollageBuffer';

const COLLAGE_DELAY_MS = 8_000;

const handleMomentSuccess = async (
  thread: Thread,
  contractAddress: string,
  tokenId: string,
  artistAddress: string
) => {
  const chain = IS_TESTNET ? 'bsep' : 'base';
  const successMessage = `✅ Moment created! ${SITE_ORIGINAL_URL}/collect/${chain}:${contractAddress}/${tokenId}`;

  await new Promise((resolve) => setTimeout(resolve, COLLAGE_DELAY_MS));

  await thread.post(successMessage);
  const collage = await fetchArtistCollageBuffer(artistAddress);
  if (collage) {
    await thread.post({
      markdown: '',
      files: [
        { data: collage, filename: 'collage.png', mimeType: 'image/png' },
      ],
    });
  }
};

export default handleMomentSuccess;
