import { tasks } from '@trigger.dev/sdk';
import { logMessage } from '@/lib/messages/logMessage';
import getMomentSuccessMessage from '@/lib/moment/getMomentSuccessMessage';
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
  const successMessage = getMomentSuccessMessage(contractAddress, tokenId);

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
