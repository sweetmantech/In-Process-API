import { sendSms } from '@/lib/phones/sendSms';

export async function sendVideoNotSupported(
  phoneNumber: string,
  _artistAddress: string
) {
  const message =
    'Sorry, videos are not supported because their quality is significantly degraded when sent via SMS text message. Please go to https://inprocess.world/create to upload videos.';
  await sendSms(phoneNumber, message);
}
