import { logMessage } from '@/lib/messages/logMessage';
import { sendSms } from '@/lib/phones/sendSms';

export async function processMessageFromNewbie(
  messageText: string,
  fromPhoneNumber: string
) {
  const WELCOME_MESSAGE =
    'Welcome to In Process! To get started please visit https://inprocess.world/manage and link your phone number.';
  await logMessage(
    [
      {
        type: 'text',
        text: messageText,
      },
    ],
    'user'
  );

  await sendSms(fromPhoneNumber, WELCOME_MESSAGE);

  await logMessage(
    [
      {
        type: 'text',
        text: WELCOME_MESSAGE,
      },
    ],
    'assistant'
  );
}
