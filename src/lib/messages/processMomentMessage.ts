import { logMessage } from '@/lib/messages/logMessage';
import { sendSms } from '@/lib/phones/sendSms';
import { IS_TESTNET, SITE_ORIGINAL_URL } from '@/lib/consts';
import { tasks } from '@trigger.dev/sdk';

export async function processMomentMessage(
  contractAddress: string,
  tokenId: string,
  phoneNumber: string,
  artistAddress: string
) {
  const message = `Moment created! ${SITE_ORIGINAL_URL}/sms/${IS_TESTNET ? 'bsep' : 'base'}:${contractAddress}/${tokenId}`;
  const messageId = await logMessage(
    [
      {
        type: 'text',
        text: message,
      },
    ],
    'assistant',
    artistAddress
  );
  if (messageId) {
    await tasks.trigger('process-message-moment', {
      messageId,
    });
  }
  await sendSms(phoneNumber, message);
}
