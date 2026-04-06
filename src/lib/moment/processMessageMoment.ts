import { tasks } from '@trigger.dev/sdk';
import { IS_TESTNET, SITE_ORIGINAL_URL } from '@/lib/consts';
import { logMessage } from '@/lib/messages/logMessage';
import { Address } from 'viem';

const processMessageMoment = async ({
  contractAddress,
  tokenId,
  artistAddress,
  channel,
}: {
  contractAddress: Address;
  tokenId: string;
  artistAddress: string;
  channel?: string;
}) => {
  const chain = IS_TESTNET ? 'bsep' : 'base';
  const successMessage = `Moment created, ready for editing at ${SITE_ORIGINAL_URL}/sms/${chain}:${contractAddress}/${tokenId}`;

  const messageId = await logMessage(
    [{ type: 'text', text: successMessage }],
    'assistant',
    artistAddress,
    channel as 'sms' | 'telegram' | 'web' | 'api'
  );

  if (messageId) {
    try {
      await tasks.trigger('process-message-moment', { messageId });
    } catch (e) {
      console.error('processMessageMoment: tasks.trigger failed', e);
    }
  }
};

export default processMessageMoment;
