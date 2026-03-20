import { tasks } from '@trigger.dev/sdk';
import type { Thread } from 'chat';
import { logMessage } from '@/lib/messages/logMessage';
import { IS_TESTNET, SITE_ORIGINAL_URL } from '@/lib/consts';

const handleMomentSuccess = async (
  thread: Thread,
  contractAddress: string,
  tokenId: string,
  artistAddress: string
) => {
  const chain = IS_TESTNET ? 'bsep' : 'base';
  const successMessage = `✅ Moment created! ${SITE_ORIGINAL_URL}/sms/${chain}:${contractAddress}/${tokenId}`;

  const messageId = await logMessage(
    [{ type: 'text', text: successMessage }],
    'assistant',
    artistAddress,
    'telegram'
  );

  if (messageId) {
    await tasks.trigger('process-message-moment', { messageId });
  }

  await thread.post(successMessage);
};

export default handleMomentSuccess;
