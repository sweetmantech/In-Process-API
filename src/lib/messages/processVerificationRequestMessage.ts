import { logMessage } from '@/lib/messages/logMessage';
import { sendSms } from '@/lib/phones/sendSms';

export async function processVerificationRequestMessage(
  fromPhoneNumber: string,
  artistAddress: string
) {
  const message =
    "Your phone number is not verified. Please reply 'yes' to verify your phone number.";
  await logMessage(
    [
      {
        type: 'text',
        text: message,
      },
    ],
    'assistant',
    artistAddress
  );
  await sendSms(fromPhoneNumber, message);
}
