import { sendSms } from '@/lib/phones/sendSms';

export async function sendNewbieWelcome(
  _messageText: string,
  fromPhoneNumber: string
) {
  const WELCOME_MESSAGE =
    'Welcome to In Process! To get started please visit https://inprocess.world/manage and link your phone number.';
  await sendSms(fromPhoneNumber, WELCOME_MESSAGE);
}
