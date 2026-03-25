import type { Thread } from 'chat';
import { IS_TESTNET, SITE_ORIGINAL_URL } from '@/lib/consts';

const handleMomentSuccess = async (
  thread: Thread,
  contractAddress: string,
  tokenId: string
) => {
  const chain = IS_TESTNET ? 'bsep' : 'base';
  const successMessage = `✅ Moment created! ${SITE_ORIGINAL_URL}/collect/${chain}:${contractAddress}/${tokenId}`;
  await thread.post(successMessage);
};

export default handleMomentSuccess;
