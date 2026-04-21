import { logMessage } from '@/lib/messages/logMessage';
import { sendSms } from '@/lib/phones/sendSms';

export async function processVideoMessage(
  phoneNumber: string,
  artistAddress: string
) {
  const message =
    'Sorry, videos are not supported because their quality is significantly degraded when sent via SMS text message. Please go to https://inprocess.world/create to upload videos.';
  await logMessage(
    [
      {
        type: 'text',
        text: message,
      },
    ],
    'assistant',
    undefined,
    artistAddress
  );
  await sendSms(phoneNumber, message);
}
