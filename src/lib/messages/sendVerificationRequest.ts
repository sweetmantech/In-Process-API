import { sendSms } from '@/lib/phones/sendSms';

export async function sendVerificationRequest(
  fromPhoneNumber: string,
  _artistAddress: string
) {
  const message =
    "Your phone number is not verified. Please reply 'yes' to verify your phone number.";
  await sendSms(fromPhoneNumber, message);
}
