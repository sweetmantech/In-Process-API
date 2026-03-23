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

  await thread.post(successMessage);

  if (messageId) {
    try {
      await tasks.trigger('process-message-moment', { messageId });
    } catch (e) {
      console.error('handleMomentSuccess: tasks.trigger failed', e);
    }
  }
};

export default handleMomentSuccess;
